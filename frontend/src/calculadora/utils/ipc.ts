import type { IpcEntry } from "@/interfaces/ipc";

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export const MESES_ABREVIADOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function getAniosDisponibles(ipcData: IpcEntry[]): number[] {
  const anios = new Set(ipcData.map((entrada) => entrada.anio))
  return Array.from(anios).sort((a, b) => a - b)
}

export function getMesesDisponibles(ipcData: IpcEntry[], anio: number): number[] {
  return ipcData.filter((entrada) => entrada.anio === anio).map((entrada) => entrada.mes)
}

export function formatoMoneda(valor: number): string {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatoPorcentaje(valor: number): string {
  return `${valor.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`
}
