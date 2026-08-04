import { db } from "../db/index.js"
import type { IpcEntry, IpcEntryRow } from "../interfaces/ipc.js"

function aIpcEntry(fila: IpcEntryRow): IpcEntry {
  return {
    anio: fila.anio,
    mes: fila.mes,
    variacionMensual: fila.variacion_mensual,
    inflacionInteranual: fila.inflacion_interanual,
  }
}

export function listarEntradas(): IpcEntry[] {
  const filas = db
    .prepare("SELECT * FROM ipc_entries ORDER BY anio, mes")
    .all() as IpcEntryRow[]
  return filas.map(aIpcEntry)
}

export function guardarEntrada(entrada: IpcEntry): IpcEntry {
  db.prepare(
    `INSERT INTO ipc_entries (anio, mes, variacion_mensual, inflacion_interanual)
     VALUES (@anio, @mes, @variacionMensual, @inflacionInteranual)
     ON CONFLICT (anio, mes) DO UPDATE SET
       variacion_mensual = excluded.variacion_mensual,
       inflacion_interanual = excluded.inflacion_interanual`,
  ).run({
    anio: entrada.anio,
    mes: entrada.mes,
    variacionMensual: entrada.variacionMensual,
    inflacionInteranual: entrada.inflacionInteranual ?? null,
  })

  const fila = db
    .prepare("SELECT * FROM ipc_entries WHERE anio = ? AND mes = ?")
    .get(entrada.anio, entrada.mes) as IpcEntryRow

  return aIpcEntry(fila)
}

export function eliminarEntrada(anio: number, mes: number): boolean {
  const resultado = db
    .prepare("DELETE FROM ipc_entries WHERE anio = ? AND mes = ?")
    .run(anio, mes)
  return resultado.changes > 0
}
