resource "azurerm_resource_group" "portfolio" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location
}

# ─────────────────────────────────────────────────────────────
# Static Web App — el recurso ya trae CDN global y HTTPS incluidos.
# La vinculación al repo de GitHub para CI/CD se hace vía el
# workflow en .github/workflows/azure-static-web-apps.yml, usando
# el token de despliegue (output api_key) como secreto del repo.
# ─────────────────────────────────────────────────────────────
resource "azurerm_static_web_app" "portfolio" {
  name                = "swa-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.portfolio.name
  location            = var.swa_location
  sku_tier            = var.sku_tier
  sku_size            = var.sku_tier
}

# Dominio personalizado opcional. Requiere validación DNS (registro
# TXT/CNAME) que Azure indicará tras crear este recurso.
resource "azurerm_static_web_app_custom_domain" "portfolio" {
  count             = var.custom_domain != "" ? 1 : 0
  static_web_app_id = azurerm_static_web_app.portfolio.id
  domain_name       = var.custom_domain
  validation_type   = "cname-delegation"
}
