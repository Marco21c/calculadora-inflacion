# Calculadora de Inflación

Herramienta web de la Dirección Provincial de Estadística y Censos (DIPEC) para calcular la inflación acumulada entre dos períodos, en base al Índice de Precios al Consumidor (IPC) de San Salvador de Jujuy.

## Estructura del proyecto

Monorepo con dos paquetes (npm workspaces):

```
calculadora-inflacion/
├── frontend/   # SPA en React + Vite — DOS builds separados (ver abajo)
└── backend/    # API en Express + Prisma
```

### Frontend (`frontend/`)

- React 19 + TypeScript + Vite, estilos con Tailwind CSS.
- React Query (`@tanstack/react-query`) para el fetching de datos del backend.
- Organizado en dos módulos bajo `src/`:
  - **`calculadora/`**: la calculadora pública (páginas, componentes, cálculo de inflación entre dos períodos).
  - **`entry-data/`**: panel de administración para cargar y editar los datos de IPC (tabla editable, alta individual y masiva).

El proyecto **compila dos bundles independientes a partir del mismo código**, para que el sitio público nunca descargue ni una línea del código de administración:

| Build           | Entry point   | Contenido                                              | Ruta raíz       | Comando            | Salida         |
| --------------- | ------------- | -------------------------------------------------------- | ---------------- | ------------------- | -------------- |
| **Público**     | `index.html`  | Solo `calculadora/` (calculadora)                        | `/calculadora`   | `npm run build:public` | `dist-public/` |
| **Admin**       | `admin.html`  | `calculadora/` + `entry-data/`, con sidebar               | `/administrador` | `npm run build:admin`  | `dist-admin/`  |

`PublicApp.tsx` y `AdminApp.tsx` (montados por `main.tsx` y `main-admin.tsx` respectivamente) son los dos árboles de rutas; `vite.config.ts` elige el entry point y el `outDir` según `--mode admin`. Se puede confirmar la separación buscando texto de la UI de admin (p. ej. "Guardar cambios") dentro de `dist-public/assets/*.js`: no debería aparecer.

El admin **sigue sin autenticación real**: la ruta `/administrador` no está protegida a nivel de servidor, solo separada del build público. No exponer ese build en un dominio público sin agregar login antes.

### Backend (`backend/`)

- Node + Express + TypeScript, expuesto también como función serverless para Vercel (`backend/api/index.ts`).
- Persistencia con Prisma sobre **PostgreSQL (Supabase)**, usando el driver `@prisma/adapter-pg`.
- Endpoints (montados bajo `/api/ipc-entries`):
  - `GET /api/ipc-entries` — lista todas las entradas de IPC.
  - `POST /api/ipc-entries` — crea o actualiza una entrada (upsert por año/mes).
  - `PUT /api/ipc-entries/bulk` — carga masiva (reemplaza/actualiza varias entradas).
  - `DELETE /api/ipc-entries/:anio/:mes` — elimina la entrada de un período.
- Sin autenticación por ahora (decisión temporal, mismo motivo que arriba): estos tres métodos aceptan cambios de cualquiera que conozca la URL.

## Requisitos

- Node.js 20+
- npm
- Docker + Docker Compose (solo para levantar el frontend público como se sirve en el VPS)

## Desarrollo local

Instalar dependencias una sola vez desde la raíz (resuelve ambos workspaces):

```bash
npm install
```

Copiar `backend/.env.example` a `backend/.env` y completar `DATABASE_URL`/`DIRECT_URL` con los datos de conexión del proyecto de Supabase (Project Settings → Database → Connection string). La primera vez, crear las tablas y cargar los datos:

```bash
cd backend
npx prisma migrate dev --name init   # crea las tablas en Supabase
npm run db:seed                      # carga backend/prisma/seed-data.json
```

Levantar backend y frontend en terminales distintas:

```bash
npm run dev:backend    # http://localhost:3001
npm run dev:frontend   # http://localhost:5173
```

El dev server de Vite sirve los dos entry points a la vez, sin tener que elegir un modo:

- `http://localhost:5173/index.html` → público (`/calculadora`)
- `http://localhost:5173/admin.html` → admin (`/administrador`)

El frontend apunta por defecto a `http://localhost:3001` como API (ver `VITE_API_URL` más abajo).

## Variables de entorno

| Paquete           | Variable          | Uso                                                                   | Default local              |
| ------------------ | ----------------- | ------------------------------------------------------------------------ | ---------------------------- |
| backend             | `DATABASE_URL`     | Conexión pooled a Supabase (puerto 6543) — la usa la app en runtime     | —                             |
| backend             | `DIRECT_URL`       | Conexión directa a Supabase (puerto 5432) — la usa Prisma Migrate       | —                             |
| backend             | `FRONTEND_ORIGIN`  | Origen permitido por CORS (poner la URL del **frontend admin en Vercel**, el único que le pega cross-origin) | `http://localhost:5173`    |
| backend             | `PORT`             | Puerto del servidor Express (solo fuera de Vercel)                       | `3001`                       |
| frontend            | `VITE_API_URL`     | URL base de la API. Vacía en el build público (nginx proxea `/api/*`); URL completa del backend en el build admin de Vercel | `http://localhost:3001`    |
| docker-compose (raíz) | `BACKEND_URL`    | URL pública del backend en Vercel, sin barra final — la usa nginx para proxear `/api/*` | requerido, sin default |
| docker-compose (raíz) | `HTTP_PORT`      | Puerto del host donde nginx publica el sitio                             | `80`                        |

Sin `FRONTEND_ORIGIN` correcto, CORS bloquea las requests del admin en Vercel; el build público no depende de CORS porque nginx hace de proxy same-origin.

## Build

```bash
npm run build:backend
npm run build:public -w frontend   # sitio público, para el VPS
npm run build:admin -w frontend    # panel de admin, para Vercel
```

## Despliegue

Son **tres despliegues independientes**. El público (`/calculadora`) puede ir a un VPS propio (Docker + nginx) o a Cloudflare Pages — ninguno de los dos necesita base de datos ni backend propios, solo proxean `/api/*` al backend de Vercel.

| Qué                     | Dónde                                    | Config                       |
| ------------------------ | ------------------------------------------ | ------------------------------ |
| Backend + Postgres        | Vercel (serverless) + Supabase           | `backend/vercel.json`         |
| Admin (`/administrador`) | Vercel                                    | `frontend/vercel.json`        |
| Público (`/calculadora`) | VPS (Docker + nginx) **o** Cloudflare Pages | `docker-compose.yml` / `frontend/public/_redirects` |

### Backend (Vercel)

Proyecto de Vercel con **Root Directory = `backend/`**. Variables de entorno del proyecto: `DATABASE_URL`, `DIRECT_URL`, `FRONTEND_ORIGIN` (la URL del proyecto de Vercel del admin). Antes del primer deploy, correr la migración inicial contra Supabase:

```bash
cd backend
npx prisma migrate deploy
```

### Admin (Vercel)

Proyecto de Vercel aparte con **Root Directory = `frontend/`**. `frontend/vercel.json` ya define `buildCommand: npm run build:admin` y `outputDirectory: dist-admin` — si el dashboard tiene un Build Command sobreescrito a mano, hay que actualizarlo a esos mismos valores. Variable de entorno: `VITE_API_URL` con la URL del backend de Vercel (ver arriba), porque acá sí es una llamada cross-origin real.

### Público (VPS)

En el VPS (con Docker y Docker Compose instalados):

```bash
git clone <repo>
cd calculadora-inflacion
cp .env.example .env
# editar .env: BACKEND_URL=https://tu-backend.vercel.app
docker compose up -d --build
```

Esto construye una imagen de nginx que sirve el build público (`dist-public/`) y proxea `/api/*` al backend de Vercel — el navegador ve todo como same-origin, sin CORS de por medio. El sitio queda en `http://<ip-del-vps>:${HTTP_PORT:-80}/calculadora`.

Para bajarlo: `docker compose down` (o `down -v` si además se quiere borrar cualquier estado).

### Público (Cloudflare Pages) — alternativa al VPS

Mismo build (`dist-public/`), sin Docker ni servidor propio: Cloudflare Pages sirve el estático directo. El equivalente al proxy de nginx es `frontend/public/_redirects` (Vite lo copia tal cual a `dist-public/_redirects` en el build):

```
/api/*  https://calculadora-inflacion-backend-one.vercel.app/api/:splat  200
/*      /index.html                                                       200
```

La primera regla proxea `/api/*` al backend de Vercel (el `200` al final hace que Cloudflare lo trate como proxy, no como redirect — el navegador nunca ve la URL de Vercel). La segunda es el fallback de SPA, para que rutas como `/calculadora` no den 404 al refrescar la página.

Configuración del proyecto en el dashboard de Cloudflare Pages:

- **Root directory**: `frontend`
- **Build command**: `npm run build:public`
- **Build output directory**: `dist-public`

Si el backend de Vercel cambia de URL, hay que actualizar la primera línea de `frontend/public/_redirects` y volver a deployar.
