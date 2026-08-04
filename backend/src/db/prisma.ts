import path from "node:path"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../generated/prisma/client.js"

const adapter = new PrismaBetterSqlite3({
  url: path.resolve(import.meta.dirname, "../../data/ipc.db"),
})

export const prisma = new PrismaClient({ adapter })
