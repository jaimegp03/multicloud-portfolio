# Página de estado del portfolio · imagen para Azure Container Apps
#
# Etapa 1: instala las dependencias en un entorno virtual aislado.
FROM python:3.13-slim AS deps
ENV PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
RUN python -m venv /venv
COPY requirements.txt .
RUN /venv/bin/pip install -r requirements.txt

# Etapa 2: imagen final, solo con el entorno virtual y el código
FROM python:3.13-slim
LABEL org.opencontainers.image.source="https://github.com/jaimegp03/multicloud-portfolio" \
      org.opencontainers.image.description="Página de estado del portfolio (FastAPI)"

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PATH="/venv/bin:$PATH"
WORKDIR /app
COPY --from=deps /venv /venv
COPY app/ app/

# Sin privilegios de root dentro del contenedor
RUN useradd --system --uid 10001 app
USER 10001

ARG APP_VERSION=local
ENV APP_VERSION=$APP_VERSION

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
