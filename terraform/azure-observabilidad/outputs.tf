output "panel_url" {
  description = "Abre el panel (Workbook) en Azure Portal."
  value       = "https://portal.azure.com/#resource${azurerm_application_insights_workbook.panel.id}/workbook"
}

output "pruebas_disponibilidad" {
  value = { for k, t in azurerm_application_insights_standard_web_test.disponibilidad : k => t.name }
}
