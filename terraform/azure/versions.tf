# ─────────────────────────────────────────────────────────────
# Despliegue en Azure: web estática en una cuenta de almacenamiento
# (HTTPS incluido) y una identidad federada (OIDC) para que GitHub
# Actions publique sin guardar ninguna contraseña ni token.
#
# Por qué Storage y no Static Web Apps: la suscripción Azure for
# Students tiene una política que solo permite 5 regiones europeas
# (spaincentral, switzerlandnorth, germanywestcentral, polandcentral,
# swedencentral) y Static Web Apps no está disponible en ninguna.
# ─────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.53"
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

provider "azuread" {}
