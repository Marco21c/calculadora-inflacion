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
- Persistencia con Prisma sobre **SQLite** (`backend/data/ipc.db`), usando el driver `better-sqlite3`.
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

Levantar cada paquete en una terminal distinta:

```bash
npm run dev:backend    # http://localhost:3001
npm run dev:frontend   # http://localhost:5173
```

El frontend apunta por defecto a `http://localhost:3001` como API (ver `VITE_API_URL` más abajo).

## Variables de entorno

| Paquete  | Variable         | Uso                                                              | Default local           |
| -------- | ---------------- | ----------------------------------------------------------------- | ------------------------ |
| backend  | `FRONTEND_ORIGIN` | Origen permitido por CORS                                        | `http://localhost:5173` |
| backend  | `PORT`            | Puerto del servidor Express (solo fuera de Vercel)                | `3001`                  |
| frontend | `VITE_API_URL`    | URL base de la API que consume la calculadora y el panel de carga | `http://localhost:3001` |

En producción (Vercel) **ambas variables deben configurarse explícitamente** en cada proyecto: `FRONTEND_ORIGIN` en el backend con la URL pública del frontend, y `VITE_API_URL` en el frontend con la URL pública del backend. Sin esto, CORS bloquea las requests o el frontend sigue apuntando a `localhost`.

## Build

```bash
npm run build:frontend
npm run build:backend
```

## Despliegue

Frontend y backend se despliegan como dos proyectos de Vercel independientes (cada uno con su propio `vercel.json`, con "Root Directory" apuntando a `frontend/` y `backend/` respectivamente).

Notas sobre el backend en Vercel:

- El filesystem de la función es de solo lectura salvo `/tmp`. La base `data/ipc.db` se incluye en el bundle de la función (`vercel.json` → `functions.api/index.ts.includeFiles`) y, en el primer arranque de cada instancia, se copia a `/tmp` para poder abrirse en modo lectura-escritura.
- Por ser instancias serverless efímeras, los datos cargados desde el panel de administración **en producción no persisten de forma confiable** entre despliegues ni se comparten entre instancias. Para uso esporádico alcanza; si el panel se usa con frecuencia en producción, conviene migrar a una base con estado real (por ejemplo, Turso/libSQL compatible con SQLite, o Postgres) o alojar el backend en un host con disco persistente.
