# ── 5. Panel (Azure Monitor Workbook) ───────────────────────────
# Todas las consultas son KQL sobre el área de trabajo de Log Analytics:
#   AppRequests             peticiones a la API (Application Insights)
#   AppAvailabilityResults  resultados de las pruebas de disponibilidad
#   StorageBlobLogs         descargas de la web estática y del CV

locals {
  ws_id = data.azurerm_log_analytics_workspace.logs.id

  # Visitantes reales: fuera las pruebas de disponibilidad y los curl del pipeline
  peticiones_reales = <<-KQL
    AppRequests
    | where Name == "visitas" and isempty(SyntheticSource)
    | where tostring(Properties["user_agent.original"]) !startswith "curl"
  KQL

  web_real = <<-KQL
    StorageBlobLogs
    | where OperationName == "GetWebContent" and StatusCode in (200, 206, 304)
    | where UserAgentHeader !has "AppInsights"
    // Visitante = IP sin puerto + día: el visor de PDF pide el archivo en
    // varios trozos (206) y no debe contar como varias descargas
    | extend Visitante = strcat(tostring(split(CallerIpAddress, ":")[0]), "|", format_datetime(TimeGenerated, "yyyy-MM-dd"))
  KQL

  consultas = [
    {
      nombre = "resumen"
      titulo = "Resumen del periodo"
      vista  = "table"
      ancho  = "100"
      query  = <<-KQL
        ${local.peticiones_reales}
        | summarize ['Visitas nuevas'] = countif(tostring(Properties.HttpMethod) == "POST"),
                    ['Peticiones'] = count(),
                    ['Errores'] = countif(Success == false),
                    ['Latencia p95 (ms)'] = round(percentile(DurationMs, 95))
      KQL
    },
    {
      nombre = "visitas_dia"
      titulo = "Visitas nuevas por día"
      vista  = "barchart"
      ancho  = "50"
      query  = <<-KQL
        ${local.peticiones_reales}
        | where tostring(Properties.HttpMethod) == "POST"
        | summarize Visitas = count() by ['Día'] = bin(TimeGenerated, 1d)
        | order by ['Día'] asc
      KQL
    },
    {
      nombre = "paises"
      titulo = "Desde dónde visitan (aproximado, por IP)"
      vista  = "table"
      ancho  = "50"
      query  = <<-KQL
        ${local.peticiones_reales}
        | where tostring(Properties.HttpMethod) == "POST"
        | summarize Visitas = count() by ['País'] = ClientCountryOrRegion, Ciudad = ClientCity
        | order by Visitas desc
      KQL
    },
    {
      nombre = "disponibilidad"
      titulo = "Disponibilidad (%) según las pruebas"
      vista  = "timechart"
      ancho  = "50"
      query  = <<-KQL
        AppAvailabilityResults
        | summarize Disponibilidad = round(100.0 * countif(Success == true) / count(), 2) by Prueba = Name, bin(TimeGenerated, 1h)
      KQL
    },
    {
      nombre = "latencia"
      titulo = "Latencia de la API (ms)"
      vista  = "timechart"
      ancho  = "50"
      query  = <<-KQL
        ${local.peticiones_reales}
        | summarize p50 = percentile(DurationMs, 50), p95 = percentile(DurationMs, 95) by bin(TimeGenerated, 1h)
      KQL
    },
    {
      nombre = "web"
      titulo = "Web estática: cargas de la página y descargas del CV"
      vista  = "table"
      ancho  = "50"
      query  = <<-KQL
        ${local.web_real}
        | summarize ['Visitantes de la web'] = dcountif(Visitante, Uri matches regex @"\.net/(index\.html)?(\?|$)"),
                    ['Descargas del CV'] = dcountif(Visitante, Uri has "cv-jaime-gomez-pascual.pdf")
      KQL
    },
    {
      nombre = "cv_dia"
      titulo = "Descargas del CV por día"
      vista  = "barchart"
      ancho  = "50"
      query  = <<-KQL
        ${local.web_real}
        | where Uri has "cv-jaime-gomez-pascual.pdf"
        | summarize Descargas = dcount(Visitante) by ['Día'] = bin(TimeGenerated, 1d)
        | order by ['Día'] asc
      KQL
    },
    {
      nombre = "errores"
      titulo = "Últimos errores de la API"
      vista  = "table"
      ancho  = "50"
      query  = <<-KQL
        AppRequests
        | where Name == "visitas" and Success == false
        | project Hora = TimeGenerated, ['Código'] = ResultCode, ['Método'] = tostring(Properties.HttpMethod), Milisegundos = round(DurationMs)
        | order by Hora desc
        | take 20
      KQL
    },
  ]

  workbook = {
    version = "Notebook/1.0"
    items = concat(
      [
        {
          type = 1
          name = "titulo"
          content = {
            json = "## Portfolio · Observabilidad\nVisitas, disponibilidad y rendimiento de la web y de la API de visitas. Las pruebas automáticas y el pipeline se excluyen de las visitas."
          }
        },
        {
          type = 9
          name = "parametros"
          content = {
            version = "KqlParameterItem/1.0"
            parameters = [{
              id         = "periodo"
              version    = "KqlParameterItem/1.0"
              name       = "Periodo"
              label      = "Periodo"
              type       = 4
              isRequired = true
              value      = { durationMs = 604800000 }
              typeSettings = {
                selectableValues = [
                  { durationMs = 86400000 },
                  { durationMs = 604800000 },
                  { durationMs = 2592000000 },
                ]
              }
            }]
          }
        },
      ],
      [for c in local.consultas : {
        type        = 3
        name        = c.nombre
        customWidth = c.ancho
        content = {
          version                  = "KqlItem/1.0"
          title                    = c.titulo
          query                    = c.query
          size                     = 0
          queryType                = 0
          resourceType             = "microsoft.operationalinsights/workspaces"
          crossComponentResources  = [local.ws_id]
          timeContextFromParameter = "Periodo"
          timeContext              = { durationMs = 604800000 }
          visualization            = c.vista
        }
      }]
    )
    fallbackResourceIds = [local.ws_id]
    "$schema"           = "https://github.com/Microsoft/Application-Insights-Workbooks/blob/master/schema/workbook.json"
  }
}

resource "azurerm_application_insights_workbook" "panel" {
  name                = uuidv5("url", "https://github.com/jaimegp03/multicloud-portfolio/observabilidad")
  resource_group_name = azurerm_resource_group.obs.name
  location            = var.location
  display_name        = "Portfolio · Observabilidad"
  source_id           = lower(local.ws_id)
  data_json           = jsonencode(local.workbook)
  tags                = local.tags
}
