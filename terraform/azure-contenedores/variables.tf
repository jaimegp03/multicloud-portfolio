variable "subscription_id" {
  description = "Suscripción de Azure: -var \"subscription_id=$(az account show --query id -o tsv)\"."
  type        = string
}

variable "github_client_id" {
  description = "Client ID de la identidad OIDC de GitHub Actions (creada en terraform/azure). Recibe permiso para desplegar nuevas versiones del contenedor."
  type        = string
}

variable "location" {
  description = "Región (debe estar entre las permitidas por la política de la suscripción)."
  type        = string
  default     = "spaincentral"
}

variable "prefix" {
  type    = string
  default = "jgp"
}

variable "imagen" {
  description = "Imagen inicial. Después la actualiza el workflow con cada commit (Terraform ignora el cambio)."
  type        = string
  default     = "ghcr.io/jaimegp03/portfolio-estado:latest"
}

variable "web_url" {
  type    = string
  default = "https://stjgpportfolio.z43.web.core.windows.net/"
}

variable "api_url" {
  type    = string
  default = "https://func-jgp-visitas.azurewebsites.net/api/visitas"
}

# Área de trabajo de Log Analytics existente (proyecto de la API)
variable "log_analytics_name" {
  type    = string
  default = "log-jgp-portfolio"
}

variable "log_analytics_resource_group" {
  type    = string
  default = "rg-portfolio-api-production"
}
