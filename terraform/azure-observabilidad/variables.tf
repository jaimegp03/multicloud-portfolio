variable "subscription_id" {
  description = "Suscripción de Azure: -var \"subscription_id=$(az account show --query id -o tsv)\"."
  type        = string
}

variable "email_alertas" {
  description = "Email que recibe las alertas. Sin valor por defecto para no publicarlo en el repo (pásalo con -var o en un .tfvars ignorado por git)."
  type        = string
  sensitive   = true
}

variable "location" {
  description = "Región; debe coincidir con la de Application Insights (spaincentral)."
  type        = string
  default     = "spaincentral"
}

variable "web_url" {
  description = "URL pública del portfolio."
  type        = string
  default     = "https://stjgpportfolio.z43.web.core.windows.net/"
}

variable "api_url" {
  description = "URL pública de la API de visitas."
  type        = string
  default     = "https://func-jgp-visitas.azurewebsites.net/api/visitas"
}

variable "frecuencia_pruebas" {
  description = "Segundos entre pruebas de disponibilidad (300, 600 o 900). Cada ejecución se cobra: 900 s con 1 ubicación ≈ 1,9 $/mes por prueba."
  type        = number
  default     = 900

  validation {
    condition     = contains([300, 600, 900], var.frecuencia_pruebas)
    error_message = "La frecuencia debe ser 300, 600 o 900 segundos."
  }
}

variable "ubicaciones_pruebas" {
  description = "Desde dónde se lanzan las pruebas (IDs de Azure Monitor). emea-nl-ams-azr = Ámsterdam (West Europe)."
  type        = list(string)
  default     = ["emea-nl-ams-azr"]
}

# Recursos existentes que se monitorizan
variable "api_resource_group" {
  type    = string
  default = "rg-portfolio-api-production"
}

variable "app_insights_name" {
  type    = string
  default = "appi-jgp-visitas"
}

variable "log_analytics_name" {
  type    = string
  default = "log-jgp-portfolio"
}

variable "web_resource_group" {
  type    = string
  default = "rg-portfolio-linkedin-production"
}

variable "web_storage_account" {
  type    = string
  default = "stjgpportfolio"
}
