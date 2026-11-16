# Observabilidad del portfolio

Vigila la web y la API de visitas como lo haría un equipo de operaciones: **si algo se cae o va mal, llega un email antes de que nadie se queje**.

```
                ┌───────────── Prueba de disponibilidad (cada 15 min, Ámsterdam)
                ▼
Visitantes ──▶ API (Functions) ──▶ Application Insights ─┐
Visitantes ──▶ Web (Storage)  ──▶ registros StorageRead ─┼──▶ Log Analytics ──▶ Panel (Workbook)
                                                         └──▶ Alertas ──▶ Email
```

## En qué consiste

| Pieza | Qué hace |
|---|---|
| **Prueba de disponibilidad** (`prueba-api`, en el resource group de la API porque Azure lo exige) | Un "visitante robot" llama a la API cada 15 minutos. Exige respuesta 200, que contenga `visitas` y un certificado HTTPS con más de 7 días de vida. Reintenta antes de dar un fallo por bueno. |
| **Grupo de acción** (`ag-portfolio-email`) | A quién avisar: un email (no se publica en el repo, va en un `.tfvars` ignorado). |
| **Alertas** | API caída (falla la prueba), errores 5xx a visitantes reales, latencia media > 3 s. |
| **Diagnóstico de la web** | Cada descarga de la web estática (página, CV…) queda en la tabla `StorageBlobLogs`. |
| **Panel** (Workbook) | Visitas por día y país, disponibilidad, latencia p50/p95, cargas de la web, descargas del CV y últimos errores. Excluye el tráfico del robot y del pipeline. |

## Para qué sirve en el mundo real

- **Monitorización sintética**: así detectan las empresas una caída a las 3 de la mañana.
- **Alertas con grupos de acción**: la base de cualquier sistema de guardias (email, SMS, Teams, PagerDuty…).
- **KQL**: el mismo lenguaje de Log Analytics, Application Insights y Microsoft Sentinel.
- **Validar el contenido** y no solo el código 200: evita el "el servidor responde, pero la página está rota".

## Consultas útiles (Log Analytics → Registros)

```kusto
// Descargas del CV por día
StorageBlobLogs
| where OperationName == "GetWebContent" and Uri has "cv-jaime-gomez-pascual.pdf"
| summarize Descargas = count() by bin(TimeGenerated, 1d)

// Resultado de las pruebas de disponibilidad
AppAvailabilityResults
| project TimeGenerated, Name, Success, Location, DurationMs
| order by TimeGenerated desc
```

## Coste

≈ 2 $/mes: 1 prueba × 1 ubicación cada 15 min (0,000645 $ por ejecución) + alertas de métricas (≈ 0,1 $ cada una). Los registros entran en el tope diario de 0,5 GB del área de trabajo. Para quitarlo todo: `terraform destroy`.

## Uso

```bash
terraform init
terraform apply -var "subscription_id=$(az account show --query id -o tsv)" -var "email_alertas=tu@email"
```
