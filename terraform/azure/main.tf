locals {
  tags = {
    proyecto   = var.project_name
    entorno    = var.environment
    gestionado = "terraform"
  }
}

data "azuread_client_config" "current" {}

resource "azurerm_resource_group" "portfolio" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location
  tags     = local.tags
}

# ─────────────────────────────────────────────────────────────
# Web estática: la cuenta de almacenamiento sirve el contenedor
# especial $web por HTTPS en https://<cuenta>.<zona>.web.core.windows.net
# ─────────────────────────────────────────────────────────────
resource "azurerm_storage_account" "web" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.portfolio.name
  location                 = var.storage_location
  account_kind             = "StorageV2"
  account_tier             = "Standard"
  account_replication_type = "LRS"

  min_tls_version                 = "TLS1_2"
  https_traffic_only_enabled      = true
  allow_nested_items_to_be_public = false

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }

  tags = local.tags
}

# ─────────────────────────────────────────────────────────────
# Identidad para GitHub Actions con OIDC (identidad federada):
# GitHub presenta un token firmado para este repo y rama, Entra ID
# lo canjea por un acceso temporal. No hay secretos que rotar.
# ─────────────────────────────────────────────────────────────
resource "azuread_application" "github" {
  display_name = "gh-${var.project_name}-deploy"
  owners       = [data.azuread_client_config.current.object_id]
}

resource "azuread_service_principal" "github" {
  client_id = azuread_application.github.client_id
  owners    = [data.azuread_client_config.current.object_id]
}

resource "azuread_application_federated_identity_credential" "github_main" {
  application_id = azuread_application.github.id
  display_name   = "github-${var.github_branch}"
  description    = "Despliegues desde ${var.github_repo} (rama ${var.github_branch})"
  audiences      = ["api://AzureADTokenExchange"]
  issuer         = "https://token.actions.githubusercontent.com"
  subject        = "repo:${var.github_oidc_repo}:ref:refs/heads/${var.github_branch}"
}

# Mínimo privilegio: solo puede escribir blobs en esta cuenta.
resource "azurerm_role_assignment" "github_blob" {
  scope                = azurerm_storage_account.web.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azuread_service_principal.github.object_id
}
