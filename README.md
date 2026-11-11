# Multicloud-As-A-Code — Portfolio de Jaime Gómez Pascual

Portafolio interactivo con estética de consola cloud / dashboard de monitorización, construido como una SPA en React, contenedorizado con Docker y desplegado como Infraestructura como Código (Terraform) en Azure, con alternativa en AWS.

**Demo:** _pendiente de URL de producción_

## Stack

- **Frontend:** React 19 + Vite, Tailwind CSS v4, Framer Motion, lucide-react
- **Datos:** todo el contenido se renderiza dinámicamente desde [`src/data/perfil.json`](src/data/perfil.json) — sin datos hardcodeados en los componentes
- **Contenedorización:** Dockerfile multi-stage (build con Node → runtime con Nginx)
- **IaC:** Terraform, con dos módulos independientes:
  - [`terraform/`](terraform) — AWS (S3 + CloudFront)
  - [`terraform/azure/`](terraform/azure) — Azure Storage (web estática) + identidad OIDC para GitHub Actions
- **CI/CD:** GitHub Actions ([`.github/workflows/deploy-azure.yml`](.github/workflows/deploy-azure.yml)) — lint, build y despliegue automático a Azure en cada push a `main`, autenticado con OIDC (sin secretos)
- **CV público:** `npm run cv` genera `public/cv-jaime-gomez-pascual.pdf` desde `perfil.json` (sin teléfono ni dirección)

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build   # genera dist/
npm run preview # sirve dist/ localmente para verificarlo
```

## Con Docker

```bash
docker compose up --build
```

Disponible en `http://localhost:8080`.

## Despliegue en la nube

Ver los README de cada módulo de Terraform:

- [`terraform/`](terraform) — AWS S3 + CloudFront
- [`terraform/azure/`](terraform/azure) — Azure Storage, web estática (despliegue principal)

> La suscripción Azure for Students solo permite 5 regiones europeas y Static Web Apps no está en ninguna; por eso se usa la web estática de Azure Storage en Spain Central.

## Estructura del proyecto

```
src/
├── data/perfil.json       # única fuente de verdad del contenido
├── components/            # un componente por sección de la página
└── App.jsx                # orquesta las secciones a partir de perfil.json
```
