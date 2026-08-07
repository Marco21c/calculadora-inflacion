import type { IpcEntry, ResultadoInflacion } from "@/interfaces/ipc"
import { MESES } from "./ipc"

interface PeriodoParams {
  mesInicio: number
  anioInicio: number
  mesFin: number
  anioFin: number
}

function encontrarIndicesPeriodo(
  ipcData: IpcEntry[],
  params: PeriodoParams,
): { indiceInicio: number; indiceFin: number } | null {
  const indiceInicio = ipcData.findIndex(
    (entrada) => entrada.anio === params.anioInicio && entrada.mes === params.mesInicio,
  )
  const indiceFin = ipcData.findIndex(
    (entrada) => entrada.anio === params.anioFin && entrada.mes === params.mesFin,
  )
  if (indiceInicio === -1 || indiceFin === -1 || indiceInicio > indiceFin) return null
  return { indiceInicio, indiceFin }
}

export function calcularInflacion(
  ipcData: IpcEntry[],
  params: PeriodoParams & { monto: number },
): ResultadoInflacion | null {
  const indices = encontrarIndicesPeriodo(ipcData, params)
  if (!indices) return null
  const { indiceInicio, indiceFin } = indices

  // inflacionMensual se guarda como fracción (ej. 0.023 = 2.3%), no como
  // porcentaje: no hay que dividir por 100 acá.
  let acumulado = 1
  for (let i = indiceInicio; i <= indiceFin; i++) {
    acumulado *= 1 + ipcData[i].inflacionMensual
  }

  const montoFinal = params.monto * acumulado
  const inflacionAcumulada = (acumulado - 1) * 100
  const inflacionInteranual = ipcData[indiceFin].inflacionInteranual
  const periodoInteranual = `${MESES[params.mesFin - 1]} ${params.anioFin - 1} - ${MESES[params.mesFin - 1]} ${params.anioFin}`

  return { montoFinal, inflacionAcumulada, inflacionInteranual, periodoInteranual }
}

export function getEntradasDelPeriodo(ipcData: IpcEntry[], params: PeriodoParams): IpcEntry[] {
  const indices = encontrarIndicesPeriodo(ipcData, params)
  if (!indices) return []
  return ipcData.slice(indices.indiceInicio, indices.indiceFin + 1)
}

export function getEntradasDesde(ipcData: IpcEntry[], anio: number, mes: number): IpcEntry[] {
  return ipcData.filter((entrada) => entrada.anio > anio || (entrada.anio === anio && entrada.mes >= mes))
}

export interface VariacionAnual {
  anio: number
  variacion: number
}

// Inflación anual compuesta a partir de los meses del período (no el campo
// inflacionInteranual, que es la variación interanual mes a mes, no por año).
export function getVariacionAnual(entradas: IpcEntry[]): VariacionAnual[] {
  const acumuladoPorAnio = new Map<number, number>()
  for (const entrada of entradas) {
    const acumuladoPrevio = acumuladoPorAnio.get(entrada.anio) ?? 1
    acumuladoPorAnio.set(entrada.anio, acumuladoPrevio * (1 + entrada.inflacionMensual))
  }
  return Array.from(acumuladoPorAnio.entries())
    .sort(([anioA], [anioB]) => anioA - anioB)
    .map(([anio, acumulado]) => ({ anio, variacion: (acumulado - 1) * 100 }))
}
