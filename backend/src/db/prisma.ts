import fs from "node:fs"
import path from "node:path"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../generated/prisma/client.js"

// Relativo a process.cwd() (raíz de "backend"), no a import.meta.dirname:
// la profundidad de carpetas cambia entre "src/db" (dev) y "dist/src/db"
// (build), pero el cwd del proceso siempre es la raíz del proyecto.
const SOURCE_DB_PATH = path.resolve(process.cwd(), "data/ipc.db")

function resolveDatabasePath(): string {
  // En Vercel el filesystem de la función es de solo lectura salvo /tmp, así
  // que se copia la base ahí en el primer arranque de cada instancia. Los
  // datos cargados en producción no persisten entre despliegues/instancias.
  if (!process.env.VERCEL) return SOURCE_DB_PATH

  const tmpDbPath = path.join("/tmp", "ipc.db")
  if (!fs.existsSync(tmpDbPath)) {
    fs.copyFileSync(SOURCE_DB_PATH, tmpDbPath)
  }
  return tmpDbPath
}

const adapter = new PrismaBetterSqlite3({ url: resolveDatabasePath() })

export const prisma = new PrismaClient({ adapter })
