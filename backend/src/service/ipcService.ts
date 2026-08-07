import { prisma } from "../db/prisma.js"
import type { IpcEntry } from "../interfaces/ipc.js"

export function getIpcEntries(): Promise<IpcEntry[]> {
  return prisma.ipcEntry.findMany({ orderBy: [{ anio: "asc" }, { mes: "asc" }] })
}

export function saveIpcEntries(entrada: IpcEntry): Promise<IpcEntry> {
  return prisma.ipcEntry.upsert({
    where: { anio_mes: { anio: entrada.anio, mes: entrada.mes } },
    update: {
      ipc: entrada.ipc,
      inflacionMensual: entrada.inflacionMensual,
      inflacionInteranual: entrada.inflacionInteranual,
      promedioAnualIpc: entrada.promedioAnualIpc,
      variacionInteranualPromedio: entrada.variacionInteranualPromedio,
    },
    create: entrada,
  })
}

export function saveAndReplace(entradas: IpcEntry[]): Promise<IpcEntry[]> {
  return prisma.$transaction(
    entradas.map((entrada) =>
      prisma.ipcEntry.upsert({
        where: { anio_mes: { anio: entrada.anio, mes: entrada.mes } },
        update: {
          ipc: entrada.ipc,
          inflacionMensual: entrada.inflacionMensual,
          inflacionInteranual: entrada.inflacionInteranual,
          promedioAnualIpc: entrada.promedioAnualIpc,
          variacionInteranualPromedio: entrada.variacionInteranualPromedio,
        },
        create: entrada,
      }),
    ),
    // Default de Prisma (5000ms) no alcanza para muchas filas contra la
    // latencia de red de Supabase: ver prisma/seed.ts, mismo ajuste.
    { timeout: 30000 },
  )
}

export async function deleteIpcEntries(anio: number, mes: number): Promise<boolean> {
  try {
    await prisma.ipcEntry.delete({ where: { anio_mes: { anio, mes } } })
    return true
  } catch {
    return false
  }
}
