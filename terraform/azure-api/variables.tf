variable "subscription_id" {
  description = "Suscripción de Azure. Se pasa al ejecutar: -var \"subscription_id=$(az account show --query id -o tsv)\"."
  type        = string
}

variable "location" {
  description = "Región (debe estar entre las permitidas por la política de la suscripción)."
  type        = string
  default     = "spaincentral"
}

variable "prefix" {
  description = "Prefijo corto para nombres globales (Cosmos DB, Function App, Storage)."
  type        = string
  default     = "jgp"
}

variable "allowed_origins" {
  description = "Orígenes autorizados por CORS a llamar a la API."
  type        = list(string)
  default = [
    "https://stjgpportfolio.z43.web.core.windows.net",
    "http://localhost:5173",
  ]
}

variable "github_client_id" {
  description = "Client ID de la identidad OIDC de GitHub Actions (la creada en terraform/azure). Recibe permiso para desplegar el código de la función."
  type        = string
}
