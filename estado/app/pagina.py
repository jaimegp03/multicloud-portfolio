"""HTML de la página de estado (sin plantillas ni JavaScript; todo escapado)."""

from __future__ import annotations

from datetime import datetime, timezone
from html import escape

from .estado import Estado, Historico, Sondeo

TEXTOS = {
    "operativo": ("Todos los sistemas operativos", "#c6f432"),
    "degradado": ("Rendimiento degradado", "#f5b83d"),
    "caido": ("Servicio no disponible", "#ff6b6b"),
}


def _pct(valor: float | None) -> str:
    return "—" if valor is None else f"{valor:.2f} %".replace(".", ",")


def _ms(valor: float | int | None) -> str:
    return "—" if valor is None else f"{round(valor)} ms"


def _servicio(s: Sondeo) -> str:
    color = "#c6f432" if s.ok else "#ff6b6b"
    texto = "Operativo" if s.ok else "Sin respuesta" if s.codigo is None else f"Error {s.codigo}"
    return f"""
      <li class="fila">
        <span><i style="background:{color}"></i>{escape(s.nombre)}</span>
        <span class="mono">{escape(texto)} · {_ms(s.ms)}</span>
      </li>"""


def _historico(h: Historico | None) -> str:
    if h is None:
        return '<p class="nota">Histórico no disponible ahora mismo; se muestran solo las comprobaciones en vivo.</p>'
    datos = [
        ("Disponibilidad 24 h", _pct(h.disponibilidad_24h)),
        ("Disponibilidad 30 días", _pct(h.disponibilidad_30d)),
        ("Latencia API (p50, 24 h)", _ms(h.latencia_p50_ms)),
        ("Errores API (24 h)", str(h.errores_24h)),
    ]
    celdas = "".join(f'<div class="dato"><b>{escape(v)}</b><span>{escape(k)}</span></div>' for k, v in datos)
    return f'<div class="datos">{celdas}</div><p class="nota">{h.pruebas_30d} pruebas de disponibilidad en 30 días · Azure Monitor</p>'


def renderizar(estado: Estado, version: str) -> str:
    titulo, color = TEXTOS[estado.global_]
    hora = datetime.fromtimestamp(estado.generado, tz=timezone.utc).strftime("%d/%m/%Y %H:%M UTC")
    servicios = "".join(_servicio(s) for s in estado.sondeos)
    return f"""<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Estado · Portfolio de Jaime Gómez Pascual</title>
<meta name="description" content="Estado en tiempo real de la web y la API del portfolio.">
<style>
  :root {{ --bg:#0b0c0e; --card:#131518; --line:#24272c; --fg:#eceef1; --muted:#9aa0a8; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--fg); font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif; }}
  main {{ max-width:720px; margin:0 auto; padding:48px 16px; }}
  .mono {{ font-family:ui-monospace,"Cascadia Mono",Menlo,monospace; font-size:13px; color:var(--muted); }}
  h1 {{ font-size:28px; letter-spacing:-.03em; margin:8px 0 24px; }}
  .banner {{ display:flex; align-items:center; gap:12px; padding:18px 20px; border-radius:12px; background:var(--card); border:1px solid var(--line); font-weight:600; }}
  .banner i, .fila i {{ display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:10px; }}
  ul {{ list-style:none; padding:0; margin:20px 0; border:1px solid var(--line); border-radius:12px; overflow:hidden; }}
  .fila {{ display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:14px 20px; background:var(--card); }}
  .fila + .fila {{ border-top:1px solid var(--line); }}
  .datos {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; }}
  .dato {{ background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px; }}
  .dato b {{ display:block; font-size:22px; letter-spacing:-.02em; }}
  .dato span, .nota {{ color:var(--muted); font-size:13px; }}
  h2 {{ font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin:36px 0 12px; }}
  a {{ color:var(--fg); }}
  footer {{ margin-top:40px; padding-top:20px; border-top:1px solid var(--line); }}
</style></head>
<body><main>
  <p class="mono">status · portfolio</p>
  <h1>Estado del sistema</h1>
  <div class="banner"><i style="background:{color}"></i>{escape(titulo)}</div>

  <h2>Ahora mismo</h2>
  <ul>{servicios}</ul>

  <h2>Histórico</h2>
  {_historico(estado.historico)}

  <footer class="mono">
    Actualizado {escape(hora)} · se refresca cada minuto ·
    <a href="/api/estado">JSON</a> ·
    <a href="https://stjgpportfolio.z43.web.core.windows.net/">volver al portfolio</a><br>
    Contenedor en Azure Container Apps · versión {escape(version)}
  </footer>
</main></body></html>"""
