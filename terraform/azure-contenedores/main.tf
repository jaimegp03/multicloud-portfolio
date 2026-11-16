locals {
  tags = {
    proyecto   = "portfolio-linkedin"
    componente = "contenedores"
    gestionado = "terraform"
  }
}

data "azurerm_log_analytics_workspace" "logs" {
  name                = var.log_analytics_name
  resource_group_name = var.log_analytics_resource_group
}

data "azuread_service_principal" "github" {
  client_id = var.github_client_id
}

resource "azurerm_resource_group" "ca" {
  name     = "rg-portfolio-contenedores-production"
  location = var.location
  tags     = local.tags
}

# ── Entorno: la "red" compartida donde viven las Container Apps ──
# Solo consumo (sin perfiles dedicados): no hay cuota fija por hora.
# Los registros de los contenedores van al mismo Log Analytics de siempre.
resource "azurerm_container_app_environment" "env" {
  name                       = "cae-${var.prefix}-portfolio"
  resource_group_name        = azurerm_resource_group.ca.name
  location                   = var.location
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.logs.id
  tags                       = local.tags

  lifecycle {
    # Azure crea el entorno en modo Express y le añade solo el perfil
    # "Consumption"; no hay nada que gestionar ahí desde Terraform
    ignore_changes = [workload_profile]
  }
}

# ── La app: un contenedor con HTTPS público que escala a cero ───
# Identidad propia de la app: un recurso independiente que sobrevive aunque
# la app se borre y se vuelva a crear (sus permisos no se pierden)
resource "azurerm_user_assigned_identity" "estado" {
  name                = "id-${var.prefix}-estado"
  resource_group_name = azurerm_resource_group.ca.name
  location            = var.location
  tags                = local.tags
}

resource "azurerm_container_app" "estado" {
  name                         = "ca-${var.prefix}-estado"
  resource_group_name          = azurerm_resource_group.ca.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"
  tags                         = local.tags

  # Identidad administrada: así lee Log Analytics sin claves.
  # Es "asignada por el usuario" porque los entornos Express (el modo que Azure
  # crea por defecto) no admiten la identidad asignada por el sistema.
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.estado.id]
  }

  template {
    min_replicas = 0 # sin visitas no hay contenedor encendido
    max_replicas = 2

    container {
      name   = "estado"
      image  = var.imagen
      cpu    = 0.25
      memory = "0.5Gi"

      # Le dice a DefaultAzureCredential qué identidad usar
      env {
        name  = "AZURE_CLIENT_ID"
        value = azurerm_user_assigned_identity.estado.client_id
      }
      env {
        name  = "WORKSPACE_ID"
        value = data.azurerm_log_analytics_workspace.logs.workspace_id
      }
      env {
        name  = "WEB_URL"
        value = var.web_url
      }
      env {
        name  = "API_URL"
        value = var.api_url
      }

      liveness_probe {
        transport = "HTTP"
        port      = 8000
        path      = "/healthz"
      }

      readiness_probe {
        transport = "HTTP"
        port      = 8000
        path      = "/healthz"
      }
    }

    http_scale_rule {
      name                = "peticiones-http"
      concurrent_requests = "20"
    }
  }

  ingress {
    external_enabled = true
    target_port      = 8000
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  lifecycle {
    # La imagen la cambia el workflow en cada despliegue, no Terraform
    ignore_changes = [template[0].container[0].image, template[0].revision_suffix]
  }
}

# ── Permisos mínimos ────────────────────────────────────────────
# La app solo puede LEER los registros (para el histórico de disponibilidad)
resource "azurerm_role_assignment" "app_lee_logs" {
  scope                = data.azurerm_log_analytics_workspace.logs.id
  role_definition_name = "Log Analytics Reader"
  principal_id         = azurerm_user_assigned_identity.estado.principal_id
}

# GitHub Actions puede publicar nuevas revisiones, solo en este resource group
resource "azurerm_role_assignment" "github_despliega" {
  scope                = azurerm_resource_group.ca.id
  role_definition_name = "Container Apps Contributor"
  principal_id         = data.azuread_service_principal.github.object_id
}
