import { readFileSync } from "node:fs"
import { prisma } from "../src/db/prisma.js"
import type { IpcEntry } from "../src/interfaces/ipc.js"

const entradas: IpcEntry[] = JSON.parse(
  readFileSync(new URL("./seed-data.json", import.meta.url), "utf-8"),
)

await prisma.$transaction(
  entradas.map((entrada) =>
    prisma.ipcEntry.upsert({
      where: { anio_mes: { anio: entrada.anio, mes: entrada.mes } },
      update: entrada,
      create: entrada,
    }),
  ),
  { timeout: 30000 },
)

console.log(`Cargadas ${entradas.length} entradas de IPC.`)
await prisma.$disconnect()
