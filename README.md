# Calculadora de Inflación

Herramienta web de la Dirección Provincial de Estadística y Censos (DIPEC) para calcular la inflación acumulada entre dos períodos, en base al Índice de Precios al Consumidor (IPC) de San Salvador de Jujuy.

## Estructura del proyecto

Monorepo con dos paquetes (npm workspaces):

```
calculadora-inflacion/
├── frontend/   # SPA en React + Vite
└── backend/    # API en Express + Prisma
```

### Frontend (`frontend/`)

- React 19 + TypeScript + Vite, estilos con Tailwind CSS.
- React Query (`@tanstack/react-query`) para el fetching de datos del backend.
- Organizado en dos módulos bajo `src/`:
  - **`calculadora/`**: la calculadora pública (páginas, componentes, cálculo de inflación entre dos períodos).
  - **`entry-data/`**: panel de administración para cargar y editar los datos de IPC (tabla editable, alta individual y masiva). No tiene autenticación real todavía: la ruta solo está oculta del menú público, no protegida a nivel de servidor.

### Backend (`backend/`)

- Node + Express + TypeScript, expuesto también como función serverless para Vercel (`backend/api/index.ts`).
- Persistencia con Prisma sobre **PostgreSQL (Supabase)**, usando el driver `@prisma/adapter-pg`.
- Endpoints (montados bajo `/api/ipc-entries`):
  - `GET /api/ipc-entries` — lista todas las entradas de IPC.
  - `POST /api/ipc-entries` — crea o actualiza una entrada (upsert por año/mes).
  - `PUT /api/ipc-entries/bulk` — carga masiva (reemplaza/actualiza varias entradas).
  - `DELETE /api/ipc-entries/:anio/:mes` — elimina la entrada de un período.
- Sin autenticación por ahora (decisión temporal, mismo motivo que arriba).

## Requisitos

- Node.js 20+
- npm

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

Levantar cada paquete en una terminal distinta:

```bash
npm run dev:backend    # http://localhost:3001
npm run dev:frontend   # http://localhost:5173
```

El frontend apunta por defecto a `http://localhost:3001` como API (ver `VITE_API_URL` más abajo).

## Variables de entorno

| Paquete  | Variable          | Uso                                                                 | Default local            |
| -------- | ----------------- | -------------------------------------------------------------------- | ------------------------- |
| backend  | `DATABASE_URL`     | Conexión pooled a Supabase (puerto 6543) — la usa la app en runtime | —                         |
| backend  | `DIRECT_URL`       | Conexión directa a Supabase (puerto 5432) — la usa Prisma Migrate   | —                         |
| backend  | `FRONTEND_ORIGIN`  | Origen permitido por CORS                                           | `http://localhost:5173` |
| backend  | `PORT`             | Puerto del servidor Express (solo fuera de Vercel)                   | `3001`                   |
| frontend | `VITE_API_URL`     | URL base de la API que consume la calculadora y el panel de carga    | `http://localhost:3001` |

En producción (Vercel) **todas deben configurarse explícitamente** en cada proyecto (`DATABASE_URL`/`DIRECT_URL` y `FRONTEND_ORIGIN` en el backend, `VITE_API_URL` en el frontend). Sin `FRONTEND_ORIGIN` correcto, CORS bloquea las requests; sin `VITE_API_URL`, el frontend sigue apuntando a `localhost`.

## Build

```bash
npm run build:frontend
npm run build:backend
```

## Despliegue

Frontend y backend se despliegan como dos proyectos de Vercel independientes (cada uno con su propio `vercel.json`, con "Root Directory" apuntando a `frontend/` y `backend/` respectivamente).

El backend usa Postgres (Supabase) en vez de un archivo local, así que no depende del filesystem de la función ni de instancias efímeras: las escrituras del panel de administración persisten igual que cualquier base hosteada. Solo hace falta configurar `DATABASE_URL`/`DIRECT_URL` como variables de entorno del proyecto backend en Vercel (mismos valores que en `.env` local) y correr la migración inicial (`npx prisma migrate deploy`) contra esa base antes del primer deploy.
