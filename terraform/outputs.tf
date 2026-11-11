output "s3_bucket_name" {
  description = "Nombre del bucket S3 donde se sube el build (dist/)."
  value       = aws_s3_bucket.spa.id
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución CloudFront (útil para invalidaciones de caché en CI/CD)."
  value       = aws_cloudfront_distribution.spa.id
}

output "cloudfront_domain_name" {
  description = "Dominio *.cloudfront.net por defecto para acceder al portafolio."
  value       = aws_cloudfront_distribution.spa.domain_name
}

output "site_url" {
  description = "URL pública del portafolio (dominio personalizado si está configurado, si no el de CloudFront)."
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.spa.domain_name}"
}
