variable "project_name" {
  description = "Nombre del proyecto, usado como prefijo de recursos."
  type        = string
  default     = "portfolio-linkedin"
}

variable "environment" {
  description = "Entorno de despliegue (ej. production, staging)."
  type        = string
  default     = "production"
}

variable "location" {
  description = "Región de Azure para el resource group (recurso de agrupación lógica, sin restricción de disponibilidad como Static Web Apps)."
  type        = string
  default     = "switzerlandnorth"
}

variable "swa_location" {
  description = "Región para el Static Web App. A diferencia del resource group, este servicio solo existe en un subconjunto fijo de regiones a nivel mundial (westus2, centralus, eastus2, westeurope, eastasia) — Switzerland North no es una de ellas. Si una región da 403 Forbidden, prueba con otra de la lista."
  type        = string
  default     = "eastus2"
}

variable "sku_tier" {
  description = "Plan de Static Web Apps: Free o Standard (Standard añade SLA, más dominios personalizados y auth avanzada)."
  type        = string
  default     = "Free"
}

variable "custom_domain" {
  description = "Dominio personalizado (ej. portfolio.jaimegomez.dev). Déjalo vacío para usar el dominio *.azurestaticapps.net por defecto."
  type        = string
  default     = ""
}
