output "url" {
  description = "URL pública de la página de estado."
  value       = "https://${azurerm_container_app.estado.ingress[0].fqdn}"
}

output "container_app_name" {
  value = azurerm_container_app.estado.name
}

output "resource_group" {
  value = azurerm_resource_group.ca.name
}
