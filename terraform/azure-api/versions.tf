# ─────────────────────────────────────────────────────────────
# API serverless del contador de visitas del portfolio.
# Módulo independiente del de la web (su propio estado y resource
# group): se puede destruir sin afectar a la web.
#
# Uso:
#   terraform init
#   terraform apply -var "subscription_id=$(az account show --query id -o tsv)"
# ─────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.30"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.53"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
  # Cuentas de almacenamiento sin claves: Terraform también usa Entra ID
  storage_use_azuread = true
}

provider "azuread" {}
