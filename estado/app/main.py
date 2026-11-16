"""Página de estado del portfolio (FastAPI dentro de un contenedor).

Rutas:
  GET /            página HTML
  GET /api/estado  el mismo estado en JSON
  GET /healthz     sonda de vida para Azure Container Apps
"""

from __future__ import annotations

import asyncio
import logging
import os

import httpx
from fastapi import Depends, FastAPI
from fastapi.responses import HTMLResponse, JSONResponse

from .estado import Cache, Estado, estado_global, sondear
from .historico import leer_historico
from .pagina import renderizar

logging.basicConfig(level=logging.INFO)
# El SDK de Azure registra cada petición HTTP en INFO: solo avisos y errores
logging.getLogger("azure").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)

WEB_URL = os.getenv("WEB_URL", "https://stjgpportfolio.z43.web.core.windows.net/")
API_URL = os.getenv("API_URL", "https://func-jgp-visitas.azurewebsites.net/api/visitas")
WORKSPACE_ID = os.getenv("WORKSPACE_ID", "")
VERSION = os.getenv("APP_VERSION", "local")

app = FastAPI(title="Estado del portfolio", docs_url=None, redoc_url=None)
_cache = Cache(segundos=60)


async def calcular_estado() -> Estado:
    async with httpx.AsyncClient(headers={"User-Agent": "portfolio-estado"}, follow_redirects=True) as cliente:
        web, api, historico = await asyncio.gather(
            sondear(cliente, "Web", WEB_URL, "Jaime"),
            sondear(cliente, "API de visitas", API_URL, "visitas"),
            leer_historico(WORKSPACE_ID),
        )
    sondeos = [web, api]
    return Estado(estado_global(sondeos), sondeos, historico)


async def estado_actual() -> Estado:
    return await _cache.obtener(calcular_estado)


SIN_CACHE = {"Cache-Control": "no-store"}


@app.get("/", response_class=HTMLResponse)
async def pagina(estado: Estado = Depends(estado_actual)) -> HTMLResponse:
    return HTMLResponse(renderizar(estado, VERSION), headers=SIN_CACHE)


@app.get("/api/estado")
async def estado_json(estado: Estado = Depends(estado_actual)) -> JSONResponse:
    return JSONResponse(estado.a_dict() | {"version": VERSION}, headers=SIN_CACHE)


@app.get("/healthz")
async def healthz() -> dict:
    return {"ok": True}
