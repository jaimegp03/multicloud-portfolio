# ─────────────────────────────────────────────────────────────
# Página de estado del portfolio en Azure Container Apps.
# La imagen se construye en GitHub Actions y se publica en GitHub
# Container Registry (gratis); Terraform crea el entorno, la app, su
# identidad administrada y los permisos mínimos.
#
# Uso:
#   terraform init
#   terraform apply -var "subscription_id=$(az account show --query id -o tsv)" \
#                   -var "github_client_id=<AZURE_CLIENT_ID de terraform/azure>"
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
}

provider "azuread" {}
