# Build context: raíz del repo (workspaces de npm). Se construye con
#   docker build -f backend/Dockerfile .
# o vía docker-compose.yml en la raíz.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY backend backend
RUN npm run build -w backend

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/prisma.config.ts
# El server corre desde dist/ (compilado). src/ solo hace falta para poder
# correr prisma/seed.ts con tsx (ver README/onboarding: db:seed). Se copia
# desde la etapa `build`, no del contexto, porque ahí ya incluye el cliente
# de Prisma generado (src/generated/, gitignoreado en el repo).
COPY --from=build /app/backend/src ./backend/src

WORKDIR /app/backend
EXPOSE 3001

# Aplica migraciones pendientes contra DIRECT_URL y recién ahí levanta el server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
