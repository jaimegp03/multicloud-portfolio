output "api_url" {
  description = "URL del endpoint del contador."
  value       = "https://${azurerm_function_app_flex_consumption.api.default_hostname}/api/visitas"
}

output "function_app_name" {
  description = "Nombre de la Function App (variable AZURE_FUNCTIONAPP_NAME del repo)."
  value       = azurerm_function_app_flex_consumption.api.name
}

output "cosmos_endpoint" {
  description = "Endpoint de Cosmos DB."
  value       = azurerm_cosmosdb_account.api.endpoint
}
