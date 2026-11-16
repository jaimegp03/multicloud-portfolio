locals {
  tags = {
    proyecto   = "portfolio-linkedin"
    componente = "observabilidad"
    gestionado = "terraform"
  }
}

# ── Lo que ya existe (solo lectura) ─────────────────────────────
data "azurerm_application_insights" "api" {
  name                = var.app_insights_name
  resource_group_name = var.api_resource_group
}

data "azurerm_log_analytics_workspace" "logs" {
  name                = var.log_analytics_name
  resource_group_name = var.api_resource_group
}

data "azurerm_storage_account" "web" {
  name                = var.web_storage_account
  resource_group_name = var.web_resource_group
}

resource "azurerm_resource_group" "obs" {
  name     = "rg-portfolio-observabilidad-production"
  location = var.location
  tags     = local.tags
}

# ── 1. A quién avisar ───────────────────────────────────────────
resource "azurerm_monitor_action_group" "email" {
  name                = "ag-portfolio-email"
  resource_group_name = azurerm_resource_group.obs.name
  short_name          = "portfolio"
  tags                = local.tags

  email_receiver {
    name                    = "email-propietario"
    email_address           = var.email_alertas
    use_common_alert_schema = true
  }
}

# ── 2. Pruebas de disponibilidad (un "visitante robot") ─────────
# Solo se prueba la API (la web estática de Storage tiene un SLA del 99,9 %
# y sus descargas ya quedan en StorageBlobLogs). Cada prueba se cobra por
# ejecución: para vigilar también la web, añade aquí:
#   web = { url = var.web_url, contenido = "Jaime" }
locals {
  pruebas = {
    api = {
      url       = var.api_url
      contenido = "visitas" # {"visitas": N}
    }
  }
}

resource "azurerm_application_insights_standard_web_test" "disponibilidad" {
  for_each = local.pruebas

  name        = "prueba-${each.key}"
  description = "Comprueba cada ${var.frecuencia_pruebas / 60} min que ${each.value.url} responde 200 y contiene \"${each.value.contenido}\"."
  # Azure exige que la prueba viva en el mismo resource group que Application Insights
  resource_group_name     = var.api_resource_group
  location                = var.location
  application_insights_id = data.azurerm_application_insights.api.id
  geo_locations           = var.ubicaciones_pruebas
  frequency               = var.frecuencia_pruebas
  timeout                 = 30
  retry_enabled           = true # reintenta antes de dar un fallo por bueno
  enabled                 = true
  tags                    = local.tags

  request {
    url       = each.value.url
    http_verb = "GET" # GET no suma visitas en la API
  }

  validation_rules {
    expected_status_code        = 200
    ssl_check_enabled           = true
    ssl_cert_remaining_lifetime = 7 # avisa si el certificado caduca en menos de 7 días

    content {
      content_match      = each.value.contenido
      ignore_case        = true
      pass_if_text_found = true
    }
  }
}

# ── 3. Alertas ──────────────────────────────────────────────────
# Web o API caídas: falla la prueba de disponibilidad
resource "azurerm_monitor_metric_alert" "caida" {
  for_each = local.pruebas

  name                = "alerta-caida-${each.key}"
  description         = "${upper(each.key)} no disponible: ${each.value.url}"
  resource_group_name = azurerm_resource_group.obs.name
  scopes              = [azurerm_application_insights_standard_web_test.disponibilidad[each.key].id, data.azurerm_application_insights.api.id]
  severity            = 1
  frequency           = "PT5M"
  window_size         = "PT15M"
  tags                = local.tags

  application_insights_web_test_location_availability_criteria {
    web_test_id           = azurerm_application_insights_standard_web_test.disponibilidad[each.key].id
    component_id          = data.azurerm_application_insights.api.id
    failed_location_count = 1
  }

  action {
    action_group_id = azurerm_monitor_action_group.email.id
  }
}

# La API devuelve errores (5xx) a visitantes reales
resource "azurerm_monitor_metric_alert" "errores_api" {
  name                = "alerta-errores-api"
  description         = "La API de visitas ha devuelto errores en los últimos 15 minutos."
  resource_group_name = azurerm_resource_group.obs.name
  scopes              = [data.azurerm_application_insights.api.id]
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"
  tags                = local.tags

  criteria {
    metric_namespace = "microsoft.insights/components"
    metric_name      = "requests/failed"
    aggregation      = "Count"
    operator         = "GreaterThan"
    threshold        = 0
  }

  action {
    action_group_id = azurerm_monitor_action_group.email.id
  }
}

# La API va lenta (media de 30 min por encima de 3 s; un arranque en frío ronda 1 s)
resource "azurerm_monitor_metric_alert" "lentitud_api" {
  name                = "alerta-lentitud-api"
  description         = "La API de visitas tarda de media más de 3 segundos."
  resource_group_name = azurerm_resource_group.obs.name
  scopes              = [data.azurerm_application_insights.api.id]
  severity            = 3
  frequency           = "PT15M"
  window_size         = "PT30M"
  tags                = local.tags

  criteria {
    metric_namespace = "microsoft.insights/components"
    metric_name      = "requests/duration"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 3000
  }

  action {
    action_group_id = azurerm_monitor_action_group.email.id
  }
}

# ── 4. Registros de la web estática ─────────────────────────────
# Cada descarga de la web (index.html, CV…) queda en la tabla StorageBlobLogs
resource "azurerm_monitor_diagnostic_setting" "web" {
  name                       = "logs-a-log-analytics"
  target_resource_id         = "${data.azurerm_storage_account.web.id}/blobServices/default"
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.logs.id

  enabled_log {
    category = "StorageRead"
  }
}
