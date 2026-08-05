import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Conexión directa (no pooled) que usa Prisma Migrate. En runtime la app
  // usa DATABASE_URL (pooled) a través del adapter en src/db/prisma.ts.
  datasource: {
    url: process.env.DIRECT_URL,
  },
})
