# Build context: raíz del repo (workspaces de npm). Se construye con
#   docker build -f frontend/Dockerfile .
# o vía docker-compose.yml en la raíz.
#
# Esto arma SOLO el frontend público (/calculadora). El admin se despliega
# aparte, en Vercel, con frontend/vercel.json (build:admin -> dist-admin).

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY frontend frontend
# Vacío: nginx proxea /api/* al backend real (deployado en Vercel, ver
# nginx.conf.template), así que el axios del frontend le pega a una ruta
# relativa same-origin en vez de a una URL absoluta. Ver
# frontend/src/entry-data/services/ipcAdmin.ts.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
# Build público: solo /calculadora, sin nada del código de admin (ver
# vite.config.ts y package.json > scripts > build:public).
RUN npm run build:public -w frontend

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/frontend/dist-public /usr/share/nginx/html
# La imagen oficial de nginx corre envsubst sobre *.template al arrancar el
# contenedor y escribe el resultado en /etc/nginx/conf.d/ (ver BACKEND_URL
# en docker-compose.yml). Por eso va en templates/, no directo en conf.d/.
COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
