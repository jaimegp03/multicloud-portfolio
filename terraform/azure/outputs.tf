output "resource_group_name" {
  description = "Grupo de recursos del portfolio."
  value       = azurerm_resource_group.portfolio.name
}

output "web_url" {
  description = "URL pública de la web estática (HTTPS)."
  value       = azurerm_storage_account.web.primary_web_endpoint
}

# Valores NO secretos que el workflow necesita: se guardan como
# variables del repositorio (Settings → Secrets and variables → Variables).
output "github_variables" {
  description = "Variables de GitHub Actions para el login OIDC y la subida de archivos."
  value = {
    AZURE_CLIENT_ID       = azuread_application.github.client_id
    AZURE_TENANT_ID       = data.azuread_client_config.current.tenant_id
    AZURE_SUBSCRIPTION_ID = split("/", azurerm_storage_account.web.id)[2]
    AZURE_STORAGE_ACCOUNT = azurerm_storage_account.web.name
    AZURE_WEB_URL         = azurerm_storage_account.web.primary_web_endpoint
  }
}
