"""Lógica de la página de estado, sin dependencias de Azure ni de FastAPI.

Combina dos fuentes:
  - Sondeos en vivo: la app llama ahora mismo a la web y a la API.
  - Histórico: disponibilidad y latencia guardadas en Log Analytics
    (pruebas de disponibilidad y peticiones del proyecto de observabilidad).
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Awaitable, Callable

import httpx

LENTO_MS = 3000  # por encima, el servicio se considera degradado


@dataclass
class Sondeo:
    nombre: str
    url: str
    ok: bool
    ms: int | None = None
    codigo: int | None = None


@dataclass
class Historico:
    disponibilidad_24h: float | None = None
    disponibilidad_30d: float | None = None
    pruebas_30d: int = 0
    ultima_prueba: str | None = None
    latencia_p50_ms: float | None = None
    errores_24h: int = 0
    peticiones_24h: int = 0


@dataclass
class Estado:
    global_: str  # "operativo" | "degradado" | "caido"
    sondeos: list[Sondeo]
    historico: Historico | None
    generado: float = field(default_factory=time.time)

    def a_dict(self) -> dict:
        return {
            "estado": self.global_,
            "servicios": [s.__dict__ for s in self.sondeos],
            "historico": self.historico.__dict__ if self.historico else None,
            "generado": int(self.generado),
        }


def estado_global(sondeos: list[Sondeo]) -> str:
    """operativo si todo responde rápido, caido si nada responde, degradado en otro caso."""
    if not sondeos or not any(s.ok for s in sondeos):
        return "caido"
    if all(s.ok and (s.ms or 0) < LENTO_MS for s in sondeos):
        return "operativo"
    return "degradado"


async def sondear(cliente: httpx.AsyncClient, nombre: str, url: str, contiene: str) -> Sondeo:
    """GET a la URL: ok si responde 200 y el cuerpo contiene el texto esperado.

    Un servicio serverless tarda más en la primera petición tras estar parado
    (arranque en frío): si va lento, se mide una segunda vez antes de darlo por lento.
    """
    primero = await _medir(cliente, nombre, url, contiene)
    if primero.ok and (primero.ms or 0) >= LENTO_MS:
        return await _medir(cliente, nombre, url, contiene)
    return primero


async def _medir(cliente: httpx.AsyncClient, nombre: str, url: str, contiene: str) -> Sondeo:
    inicio = time.perf_counter()
    try:
        r = await cliente.get(url, timeout=8)
        ms = round((time.perf_counter() - inicio) * 1000)
        ok = r.status_code == 200 and contiene.lower() in r.text.lower()
        return Sondeo(nombre, url, ok, ms, r.status_code)
    except httpx.HTTPError:
        return Sondeo(nombre, url, False)


class Cache:
    """Guarda el último Estado unos segundos para no repetir sondeos ni consultas."""

    def __init__(self, segundos: int = 60) -> None:
        self.segundos = segundos
        self._valor: Estado | None = None
        self._caduca = 0.0

    async def obtener(self, calcular: Callable[[], Awaitable[Estado]]) -> Estado:
        ahora = time.monotonic()
        if self._valor is None or ahora >= self._caduca:
            self._valor = await calcular()
            self._caduca = ahora + self.segundos
        return self._valor
