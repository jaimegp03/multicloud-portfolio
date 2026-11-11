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

variable "aws_region" {
  description = "Región de AWS donde se crea el bucket S3."
  type        = string
  default     = "eu-west-1"
}

variable "domain_name" {
  description = "Dominio personalizado para CloudFront (ej. portfolio.jaimegomez.dev). Déjalo vacío para usar el dominio *.cloudfront.net por defecto."
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ARN de un certificado ACM (en us-east-1) para el dominio personalizado. Requerido solo si domain_name no está vacío."
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "Cobertura geográfica de CloudFront (coste vs. alcance). PriceClass_100 = EEUU/Europa (más barato)."
  type        = string
  default     = "PriceClass_100"
}

variable "force_destroy_bucket" {
  description = "Permite borrar el bucket S3 aunque contenga objetos (útil en entornos de prueba, evitar en producción)."
  type        = bool
  default     = false
}
