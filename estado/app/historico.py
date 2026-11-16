"""Lee el histórico de Log Analytics con la identidad administrada del contenedor.

No hay claves: DefaultAzureCredential usa la identidad administrada en Azure
(y tu sesión de `az login` en local). La identidad solo tiene el rol
"Log Analytics Reader" sobre el área de trabajo.
"""

from __future__ import annotations

import logging
from datetime import timedelta

from azure.identity.aio import DefaultAzureCredential
from azure.monitor.query.aio import LogsQueryClient
from azure.monitor.query import LogsQueryStatus

from .estado import Historico

log = logging.getLogger(__name__)

KQL = """
let disp = AppAvailabilityResults
    | where TimeGenerated > ago(30d)
    | summarize d30 = round(100.0 * countif(Success == true) / count(), 2),
                d1  = round(100.0 * countif(Success == true and TimeGenerated > ago(1d))
                            / countif(TimeGenerated > ago(1d)), 2),
                pruebas = count(),
                ultima = max(TimeGenerated)
    | extend k = 1;
let api = AppRequests
    | where TimeGenerated > ago(1d) and Name == "visitas" and isempty(SyntheticSource)
    | summarize p50 = round(percentile(DurationMs, 50)),
                errores = countif(Success == false),
                peticiones = count()
    | extend k = 1;
disp | join kind=fullouter api on k
"""


def _num(valor):
    """Log Analytics devuelve NaN cuando no hay datos: lo convertimos en None."""
    return None if valor is None or valor != valor else float(valor)


async def leer_historico(workspace_id: str) -> Historico | None:
    if not workspace_id:
        return None
    try:
        async with DefaultAzureCredential() as cred, LogsQueryClient(cred) as cliente:
            res = await cliente.query_workspace(workspace_id, KQL, timespan=timedelta(days=30))
        if res.status != LogsQueryStatus.SUCCESS or not res.tables or not res.tables[0].rows:
            return Historico()
        fila = dict(zip(res.tables[0].columns, res.tables[0].rows[0]))
        ultima = fila.get("ultima")
        return Historico(
            disponibilidad_24h=_num(fila.get("d1")),
            disponibilidad_30d=_num(fila.get("d30")),
            pruebas_30d=int(fila.get("pruebas") or 0),
            ultima_prueba=ultima.isoformat() if ultima else None,
            latencia_p50_ms=_num(fila.get("p50")),
            errores_24h=int(fila.get("errores") or 0),
            peticiones_24h=int(fila.get("peticiones") or 0),
        )
    except Exception:  # sin histórico la página sigue funcionando con los sondeos en vivo
        log.exception("No se pudo leer el histórico de Log Analytics")
        return None
