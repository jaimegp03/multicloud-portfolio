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
  description = "Región del resource group (solo agrupa recursos; ya existe en Switzerland North)."
  type        = string
  default     = "switzerlandnorth"
}

variable "storage_location" {
  description = "Región de la cuenta de almacenamiento que sirve la web. Debe ser una de las permitidas por la política de la suscripción."
  type        = string
  default     = "spaincentral"
}

variable "storage_account_name" {
  description = "Nombre global y único de la cuenta de almacenamiento (3-24 caracteres, minúsculas y números). Forma parte de la URL pública."
  type        = string
  default     = "stjgpportfolio"

  validation {
    condition     = can(regex("^[a-z0-9]{3,24}$", var.storage_account_name))
    error_message = "Solo minúsculas y números, entre 3 y 24 caracteres."
  }
}

variable "github_repo" {
  description = "Repositorio de GitHub (propietario/nombre) autorizado a desplegar mediante OIDC."
  type        = string
  default     = "jaimegp03/multicloud-portfolio"
}

variable "github_oidc_repo" {
  description = <<-EOT
    Parte "repositorio" del subject OIDC que firma GitHub. Los repos nuevos usan el formato
    inmutable propietario@ID/repo@ID (así, renombrar o recrear el repo no hereda permisos).
    Se ve en el log del paso de login si no coincide (AADSTS700213).
  EOT
  type        = string
  default     = "jaimegp03@206939411/multicloud-portfolio@1454636723"
}

variable "github_branch" {
  description = "Rama desde la que GitHub Actions puede desplegar."
  type        = string
  default     = "main"
}
