# Página de estado (Azure Container Apps)

Una *status page* como las de GitHub o Azure, para el portfolio: dice si la web y la API funcionan **ahora mismo** y cuál ha sido su **disponibilidad** en las últimas 24 horas y 30 días.

```
git push ─▶ GitHub Actions ─▶ pruebas ─▶ imagen Docker ─▶ ghcr.io
                                                         │
                         Azure Container Apps ◀──────────┘ (nueva revisión, OIDC)
                                │  identidad administrada (solo lectura)
                                ├──▶ Log Analytics  (histórico del proyecto de observabilidad)
                                └──▶ web + API      (comprobación en vivo)
```

## En qué consiste

- Una app en **Python (FastAPI)** empaquetada en un **contenedor Docker**.
- Al abrir la página, el contenedor comprueba en vivo la web y la API y consulta en **Log Analytics** el histórico de las pruebas de disponibilidad.
- Lee los registros con su **identidad administrada** y el rol *Log Analytics Reader*: no hay claves ni secretos que guardar (por eso no hace falta Key Vault).
- **Escala a cero**: sin visitas no hay ningún contenedor encendido. La primera visita tras un rato tarda unos segundos en arrancarlo.
- Guarda el resultado 60 segundos para no repetir comprobaciones si entran varias personas a la vez.

## Para qué sirve en el mundo real

| Lo que hace aquí | Dónde se usa igual en una empresa |
|---|---|
| Imagen Docker multi-etapa, sin root | Cualquier microservicio moderno: el mismo artefacto en local, en pruebas y en producción |
| Registro de imágenes (GHCR) con etiquetas por commit | Saber qué versión exacta corre en producción y poder volver a ella |
| Azure Container Apps con escalado a cero | APIs y webs con tráfico variable sin administrar Kubernetes |
| Revisiones y vuelta atrás | Desplegar sin miedo: si algo falla, se vuelve a la imagen anterior en un minuto |
| Sondas de vida y disponibilidad (`/healthz`) | Que la plataforma reinicie sola un contenedor colgado |
| Página de estado | Comunicar incidencias a usuarios y clientes |

## Cómo está montado

1. **App** (`estado/app/`): `estado.py` (lógica pura, probada), `historico.py` (consulta KQL), `pagina.py` (HTML) y `main.py` (rutas).
2. **Pruebas** (`estado/tests/`): estado global, sondeos con un servidor HTTP simulado, arranques en frío, caché, escapado del HTML y endpoints.
3. **Imagen** (`estado/Dockerfile`): dos etapas (dependencias → imagen final), usuario sin privilegios (uid 10001).
4. **Infraestructura** (`terraform/azure-contenedores/`): entorno de Container Apps (solo consumo), la app con HTTPS público, identidad administrada y permisos mínimos.
5. **CI/CD** (`.github/workflows/deploy-estado.yml`): pruebas → imagen en `ghcr.io` (etiquetas `sha-xxxxxxx` y `latest`) → `az containerapp update` con OIDC → prueba de humo.

### Volver a una versión anterior

En GitHub → Actions → *Página de estado* → **Run workflow** e indicar la etiqueta, por ejemplo `sha-1a2b3c4`. Se despliega esa imagen sin volver a construir nada.

## Coste

Prácticamente 0 €: Container Apps en modo consumo incluye cada mes 180.000 vCPU-segundos, 360.000 GiB-segundos y 2 millones de peticiones gratis, y el contenedor solo está encendido mientras hay visitas. GitHub Container Registry es gratuito para imágenes públicas.

## Desarrollo

```bash
cd estado
python -m venv .venv && .venv/Scripts/activate   # en Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
python -m pytest -q
uvicorn app.main:app --reload            # http://localhost:8000
docker build -t portfolio-estado . && docker run -p 8000:8000 portfolio-estado
```

Con `WORKSPACE_ID` definido y una sesión de `az login`, en local también se ve el histórico.
