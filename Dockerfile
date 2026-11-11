# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Etapa 1: Build — compila la SPA (Vite + React) a estáticos
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Cache de dependencias: solo se reinstalan si cambia el lockfile
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Etapa 2: Runtime — sirve /dist con Nginx (imagen mínima)
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Configuración propia: rutas de SPA (fallback a index.html), gzip y cache
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

# Nginx de imagen oficial ya corre como usuario "nginx" en Alpine >= 1.25
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
