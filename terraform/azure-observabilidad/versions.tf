# ─────────────────────────────────────────────────────────────
# Observabilidad del portfolio: pruebas de disponibilidad, alertas
# por email, registros de la web estática y un panel (Workbook).
# Usa la web (terraform/azure) y la API (terraform/azure-api) ya
# creadas, a las que solo lee mediante data sources.
#
# Uso:
#   terraform init
#   terraform apply -var "subscription_id=$(az account show --query id -o tsv)" \
#                   -var "email_alertas=tu@email"
# ─────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.30"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}
