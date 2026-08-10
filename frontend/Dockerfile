# Build context: raíz del repo (workspaces de npm). Se construye con
#   docker build -f frontend/Dockerfile .
# o vía docker-compose.yml en la raíz.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY frontend frontend
# Vacío: nginx sirve el frontend y el backend en el mismo origen, así que el
# axios del frontend pega a rutas relativas ("/api/...") en vez de a una URL
# absoluta. Ver frontend/src/entry-data/services/ipcAdmin.ts.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build -w frontend

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
