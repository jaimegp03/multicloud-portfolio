locals {
  tags = {
    proyecto   = "portfolio-api-visitas"
    gestionado = "terraform"
  }
}

resource "azurerm_resource_group" "api" {
  name     = "rg-portfolio-api-production"
  location = var.location
  tags     = local.tags
}

# ─────────────────────────────────────────────────────────────
# Observabilidad: Log Analytics + Application Insights
# ─────────────────────────────────────────────────────────────
resource "azurerm_log_analytics_workspace" "api" {
  name                = "log-${var.prefix}-portfolio"
  resource_group_name = azurerm_resource_group.api.name
  location            = var.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  daily_quota_gb      = 0.5 # tope de ingesta para no llevarse sustos de coste
  tags                = local.tags
}

resource "azurerm_application_insights" "api" {
  name                = "appi-${var.prefix}-visitas"
  resource_group_name = azurerm_resource_group.api.name
  location            = var.location
  workspace_id        = azurerm_log_analytics_workspace.api.id
  application_type    = "web"
  tags                = local.tags
}

# ─────────────────────────────────────────────────────────────
# Cosmos DB serverless: se paga por operación (céntimos) y solo
# admite autenticación con Entra ID (claves desactivadas).
# ─────────────────────────────────────────────────────────────
resource "azurerm_cosmosdb_account" "api" {
  name                = "cosmos-${var.prefix}-portfolio"
  resource_group_name = azurerm_resource_group.api.name
  location            = var.location
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  local_authentication_enabled = false
  minimal_tls_version          = "Tls12"

  capabilities {
    name = "EnableServerless"
  }

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = var.location
    failover_priority = 0
  }

  tags = local.tags
}

resource "azurerm_cosmosdb_sql_database" "api" {
  name                = "portfolio"
  resource_group_name = azurerm_resource_group.api.name
  account_name        = azurerm_cosmosdb_account.api.name
}

resource "azurerm_cosmosdb_sql_container" "contadores" {
  name                = "contadores"
  resource_group_name = azurerm_resource_group.api.name
  account_name        = azurerm_cosmosdb_account.api.name
  database_name       = azurerm_cosmosdb_sql_database.api.name
  partition_key_paths = ["/id"]
}

# ─────────────────────────────────────────────────────────────
# Function App (Flex Consumption): escala a cero y se paga por uso.
# Su almacenamiento también se usa sin claves (identidad administrada).
# ─────────────────────────────────────────────────────────────
resource "azurerm_storage_account" "func" {
  name                            = "st${var.prefix}visitasfunc"
  resource_group_name             = azurerm_resource_group.api.name
  location                        = var.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  shared_access_key_enabled       = false
  tags                            = local.tags
}

resource "azurerm_storage_container" "deployments" {
  name                  = "deployments"
  storage_account_id    = azurerm_storage_account.func.id
  container_access_type = "private"
}

resource "azurerm_service_plan" "api" {
  name                = "asp-${var.prefix}-visitas"
  resource_group_name = azurerm_resource_group.api.name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "FC1"
  tags                = local.tags
}

resource "azurerm_function_app_flex_consumption" "api" {
  name                = "func-${var.prefix}-visitas"
  resource_group_name = azurerm_resource_group.api.name
  location            = var.location
  service_plan_id     = azurerm_service_plan.api.id

  runtime_name    = "node"
  runtime_version = "22"

  storage_container_type      = "blobContainer"
  storage_container_endpoint  = "${azurerm_storage_account.func.primary_blob_endpoint}${azurerm_storage_container.deployments.name}"
  storage_authentication_type = "SystemAssignedIdentity"

  instance_memory_in_mb  = 512
  maximum_instance_count = 40 # límite de escalado (y de gasto) en caso de abuso

  https_only = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_insights_connection_string = azurerm_application_insights.api.connection_string
    cors {
      allowed_origins = var.allowed_origins
    }
  }

  app_settings = {
    AzureWebJobsStorage__accountName = azurerm_storage_account.func.name
    COSMOS_ENDPOINT                  = azurerm_cosmosdb_account.api.endpoint
    COSMOS_DATABASE                  = azurerm_cosmosdb_sql_database.api.name
    COSMOS_CONTAINER                 = azurerm_cosmosdb_sql_container.contadores.name
  }

  tags = local.tags
}

# ─────────────────────────────────────────────────────────────
# Permisos (mínimo privilegio)
# ─────────────────────────────────────────────────────────────

# La función lee/escribe el contador en Cosmos DB (rol de datos integrado)
resource "azurerm_cosmosdb_sql_role_assignment" "func_data" {
  resource_group_name = azurerm_resource_group.api.name
  account_name        = azurerm_cosmosdb_account.api.name
  role_definition_id  = "${azurerm_cosmosdb_account.api.id}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002"
  principal_id        = azurerm_function_app_flex_consumption.api.identity[0].principal_id
  scope               = azurerm_cosmosdb_account.api.id
}

# El runtime de Functions usa su almacenamiento con identidad (blobs, colas y tablas internas)
resource "azurerm_role_assignment" "func_storage" {
  for_each = toset([
    "Storage Blob Data Owner",
    "Storage Queue Data Contributor",
    "Storage Table Data Contributor",
  ])
  scope                = azurerm_storage_account.func.id
  role_definition_name = each.value
  principal_id         = azurerm_function_app_flex_consumption.api.identity[0].principal_id
}

# GitHub Actions (identidad OIDC del módulo de la web) puede publicar el código
data "azuread_service_principal" "github" {
  client_id = var.github_client_id
}

resource "azurerm_role_assignment" "github_deploy" {
  scope                = azurerm_function_app_flex_consumption.api.id
  role_definition_name = "Website Contributor"
  principal_id         = data.azuread_service_principal.github.object_id
}
