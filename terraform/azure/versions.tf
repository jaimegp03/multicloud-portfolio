# ─────────────────────────────────────────────────────────────
# Despliegue en Azure Static Web Apps: hosting gratuito para SPA,
# HTTPS automático y despliegue continuo vía GitHub Actions.
# ─────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }

  # Buena práctica: estado remoto (Azure Storage) en vez de local.
  # Descomenta y ajusta tras crear la cuenta de almacenamiento una única vez:
  #
  # backend "azurerm" {
  #   resource_group_name  = "rg-terraform-state"
  #   storage_account_name = "tfstateportfolio"
  #   container_name       = "tfstate"
  #   key                  = "portfolio-linkedin.tfstate"
  # }
}

provider "azurerm" {
  features {}
}
