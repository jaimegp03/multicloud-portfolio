import asyncio

import httpx
from fastapi.testclient import TestClient

from app.estado import Cache, Estado, Historico, Sondeo, estado_global, sondear
from app.main import app, estado_actual
from app.pagina import renderizar


def s(ok=True, ms=100, codigo=200):
    return Sondeo("X", "https://x", ok, ms, codigo)


# ── estado_global ───────────────────────────────────────────────
def test_todo_bien_es_operativo():
    assert estado_global([s(), s()]) == "operativo"


def test_nada_responde_es_caido():
    assert estado_global([s(False, None, None), s(False, None, None)]) == "caido"
    assert estado_global([]) == "caido"


def test_uno_falla_es_degradado():
    assert estado_global([s(), s(False, None, 503)]) == "degradado"


def test_lento_es_degradado():
    assert estado_global([s(), s(ms=4500)]) == "degradado"


# ── sondear (con un transporte HTTP simulado) ───────────────────
def _cliente(handler):
    return httpx.AsyncClient(transport=httpx.MockTransport(handler))


def test_sondeo_ok_exige_200_y_contenido():
    async def run():
        async with _cliente(lambda r: httpx.Response(200, text='{"visitas": 3}')) as c:
            return await sondear(c, "API", "https://api/x", "visitas")

    r = asyncio.run(run())
    assert r.ok and r.codigo == 200 and r.ms is not None


def test_sondeo_200_sin_contenido_esperado_falla():
    async def run():
        async with _cliente(lambda r: httpx.Response(200, text="página de error")) as c:
            return await sondear(c, "Web", "https://web", "Jaime")

    assert asyncio.run(run()).ok is False


def test_sondeo_lento_se_repite_una_vez(monkeypatch):
    import app.estado as mod

    tiempos = [0.0, 5.0, 5.0, 5.1]  # 1ª medida: 5000 ms (frío); 2ª: 100 ms

    class RelojFalso:
        @staticmethod
        def perf_counter():
            return tiempos.pop(0) if len(tiempos) > 1 else tiempos[0]

    monkeypatch.setattr(mod, "time", RelojFalso)
    llamadas = []

    def handler(request):
        llamadas.append(request)
        return httpx.Response(200, text='{"visitas": 3}')

    async def run():
        async with _cliente(handler) as c:
            return await sondear(c, "API", "https://api/x", "visitas")

    r = asyncio.run(run())
    assert len(llamadas) == 2 and r.ms == 100


def test_sondeo_error_de_red_no_revienta():
    def caer(request):
        raise httpx.ConnectError("sin red")

    async def run():
        async with _cliente(caer) as c:
            return await sondear(c, "Web", "https://web", "Jaime")

    r = asyncio.run(run())
    assert r.ok is False and r.codigo is None


# ── Cache ───────────────────────────────────────────────────────
def test_cache_no_recalcula_dentro_del_plazo():
    llamadas = 0

    async def calcular():
        nonlocal llamadas
        llamadas += 1
        return Estado("operativo", [], None)

    async def run():
        c = Cache(segundos=60)
        await c.obtener(calcular)
        await c.obtener(calcular)

    asyncio.run(run())
    assert llamadas == 1


# ── HTML y endpoints ────────────────────────────────────────────
def test_html_escapa_contenido():
    e = Estado("degradado", [Sondeo("<script>", "https://x", False, None, 500)], None)
    html = renderizar(e, "<v1>")
    assert "<script>" not in html and "&lt;script&gt;" in html
    assert "Histórico no disponible" in html


def test_endpoints():
    estado = Estado("operativo", [s()], Historico(disponibilidad_24h=100.0, pruebas_30d=96))

    async def falso():
        return estado

    app.dependency_overrides[estado_actual] = falso
    try:
        c = TestClient(app)
        assert c.get("/healthz").json() == {"ok": True}
        j = c.get("/api/estado").json()
        assert j["estado"] == "operativo" and j["historico"]["pruebas_30d"] == 96
        r = c.get("/")
        assert r.status_code == 200 and "Todos los sistemas operativos" in r.text
        assert r.headers["cache-control"] == "no-store"
    finally:
        app.dependency_overrides.clear()
