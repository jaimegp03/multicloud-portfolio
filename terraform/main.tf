# ─────────────────────────────────────────────────────────────
# Bucket S3 — almacena los estáticos generados por `npm run build`.
# Privado: solo CloudFront puede leerlo (via Origin Access Control).
# ─────────────────────────────────────────────────────────────
resource "aws_s3_bucket" "spa" {
  bucket        = "${var.project_name}-${var.environment}"
  force_destroy = var.force_destroy_bucket
}

resource "aws_s3_bucket_public_access_block" "spa" {
  bucket = aws_s3_bucket.spa.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "spa" {
  bucket = aws_s3_bucket.spa.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "spa" {
  bucket = aws_s3_bucket.spa.id

  versioning_configuration {
    status = "Enabled"
  }
}

# ─────────────────────────────────────────────────────────────
# CloudFront — CDN + HTTPS delante del bucket privado.
# ─────────────────────────────────────────────────────────────
resource "aws_cloudfront_origin_access_control" "spa" {
  name                              = "${var.project_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "spa" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = var.cloudfront_price_class
  aliases             = var.domain_name != "" ? [var.domain_name] : []
  comment             = "${var.project_name} (${var.environment})"

  origin {
    domain_name              = aws_s3_bucket.spa.bucket_regional_domain_name
    origin_id                = "s3-${aws_s3_bucket.spa.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.spa.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods          = ["GET", "HEAD"]
    target_origin_id       = "s3-${aws_s3_bucket.spa.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress                = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600   # 1 hora
    max_ttl     = 86400  # 1 día
  }

  # SPA: cualquier 404 (ruta no encontrada en el bucket) sirve
  # index.html con 200, para que el enrutado lo resuelva el cliente.
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.domain_name == ""
    acm_certificate_arn            = var.domain_name != "" ? var.acm_certificate_arn : null
    ssl_support_method             = var.domain_name != "" ? "sni-only" : null
    minimum_protocol_version       = "TLSv1.2_2021"
  }
}

# ─────────────────────────────────────────────────────────────
# Política del bucket: solo permite lectura a la distribución
# de CloudFront concreta creada arriba (principio de mínimo privilegio).
# ─────────────────────────────────────────────────────────────
data "aws_iam_policy_document" "spa_cloudfront_read" {
  statement {
    sid    = "AllowCloudFrontServicePrincipalReadOnly"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.spa.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.spa.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "spa" {
  bucket = aws_s3_bucket.spa.id
  policy = data.aws_iam_policy_document.spa_cloudfront_read.json
}
