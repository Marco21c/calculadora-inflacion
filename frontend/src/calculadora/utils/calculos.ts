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

export function getEntradasDelPeriodo(ipcData: IpcEntry[], params: PeriodoParams, minimoMeses = 1): IpcEntry[] {
  const indices = encontrarIndicesPeriodo(ipcData, params)
  if (!indices) return []
  const { indiceInicio, indiceFin } = indices
  // Si el período elegido tiene menos meses que el mínimo, se extiende hacia
  // atrás (meses anteriores a mesInicio) para completarlo.
  const indiceInicioAjustado = Math.max(0, Math.min(indiceInicio, indiceFin - minimoMeses + 1))
  return ipcData.slice(indiceInicioAjustado, indiceFin + 1)
}

// Inflación interanual de un mes: IPC de ese mes contra el IPC del mismo mes
// del año anterior. Devuelve null si no hay dato cargado para ese mes-1 año.
export function calcularInflacionInteranual(
  entradas: IpcEntry[],
  anio: number,
  mes: number,
  ipcActual: number,
): number | null {
  const entradaAnioAnterior = entradas.find((entrada) => entrada.anio === anio - 1 && entrada.mes === mes)
  if (!entradaAnioAnterior) return null
  return (ipcActual / entradaAnioAnterior.ipc - 1) * 100
}

// Promedio de IPC de los últimos 12 meses (incluyendo el mes actual). Si no
// hay 11 meses previos cargados, no se puede completar la ventana de 12
// meses y devuelve null.
export function calcularPromedioAnualIpc(entradas: IpcEntry[], ipcActual: number): number | null {
  if (entradas.length < 11) return null
  const ultimosMeses = entradas.slice(-11)
  const valores = [...ultimosMeses.map((entrada) => entrada.ipc), ipcActual]
  return valores.reduce((suma, valor) => suma + valor, 0) / valores.length
}

// Promedio de la inflación interanual de los últimos 12 meses (incluyendo el
// mes actual). Si no hay 11 meses previos, o alguno de los 12 no tiene
// inflación interanual cargada, no se puede completar la ventana y devuelve
// null (no promedia con datos parciales).
export function calcularVariacionInteranualPromedio(
  entradas: IpcEntry[],
  inflacionInteranualActual: number | null,
): number | null {
  const ultimosMeses = entradas.slice(-11)
  if (ultimosMeses.length < 11) return null
  const valores = [...ultimosMeses.map((entrada) => entrada.inflacionInteranual), inflacionInteranualActual]
  const completos = valores.filter((valor): valor is number => valor !== null)
  if (completos.length < valores.length) return null
  return completos.reduce((suma, valor) => suma + valor, 0) / completos.length
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
