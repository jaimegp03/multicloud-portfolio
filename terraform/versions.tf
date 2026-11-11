# ─────────────────────────────────────────────────────────────
# Este módulo (terraform/ raíz) despliega en AWS: S3 + CloudFront.
# Para desplegar en Azure (Static Web Apps) usa terraform/azure/.
# ─────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Buena práctica: estado remoto en lugar de local (evita conflictos
  # en equipo y sirve como fuente única de verdad). Descomenta y
  # ajusta tras crear el bucket/tabla de bloqueo una única vez:
  #
  # backend "s3" {
  #   bucket         = "tu-bucket-de-tfstate"
  #   key            = "portfolio-linkedin/terraform.tfstate"
  #   region         = "eu-west-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
