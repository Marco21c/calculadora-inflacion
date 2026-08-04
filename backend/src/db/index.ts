import Database from "better-sqlite3"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.resolve(__dirname, "../../data/ipc.db")

export const db = new Database(DB_PATH)
db.pragma("journal_mode = WAL")

db.exec(`
  CREATE TABLE IF NOT EXISTS ipc_entries (
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    variacion_mensual REAL NOT NULL,
    inflacion_interanual REAL,
    PRIMARY KEY (anio, mes)
  )
`)
