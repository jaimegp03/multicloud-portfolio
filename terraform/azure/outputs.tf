output "resource_group_name" {
  description = "Grupo de recursos que contiene la Static Web App."
  value       = azurerm_resource_group.portfolio.name
}

output "static_web_app_url" {
  description = "URL pública por defecto (*.azurestaticapps.net)."
  value       = "https://${azurerm_static_web_app.portfolio.default_host_name}"
}

output "static_web_app_deployment_token" {
  description = "Token de despliegue: guárdalo como secreto de GitHub (AZURE_STATIC_WEB_APPS_API_TOKEN) para que el workflow de CI/CD pueda publicar."
  value       = azurerm_static_web_app.portfolio.api_key
  sensitive   = true
}
