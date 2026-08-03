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

export interface IpcEntry {
  anio: number
  mes: number
  indice: number
}

// Serie de ejemplo (no oficial) que simula un IPC mensual creciente, solo
// para poder ejercitar el cálculo de inflación acumulada e interanual
// mientras no se dispone de la fuente de datos real.
const ANIO_INICIO = 2015
const ANIO_FIN = 2026

function generarSerieIpc(): IpcEntry[] {
  const serie: IpcEntry[] = []
  let indice = 100
  let t = 0
  for (let anio = ANIO_INICIO; anio <= ANIO_FIN; anio++) {
    for (let mes = 1; mes <= 12; mes++) {
      serie.push({ anio, mes, indice: Math.round(indice * 100) / 100 })
      const tasaMensual = 0.02 + 0.015 * Math.sin(t / 6) + 0.0006 * t
      indice *= 1 + tasaMensual
      t++
    }
  }
  return serie
}

export const IPC_DATA: IpcEntry[] = generarSerieIpc()

export function getAniosDisponibles(): number[] {
  const anios = new Set(IPC_DATA.map((entrada) => entrada.anio))
  return Array.from(anios).sort((a, b) => a - b)
}

export function getIndice(anio: number, mes: number): number | undefined {
  return IPC_DATA.find((entrada) => entrada.anio === anio && entrada.mes === mes)?.indice
}

export interface ResultadoInflacion {
  montoFinal: number
  inflacionAcumulada: number
  inflacionInteranual: number | null
  periodoInteranual: string
}

export function calcularInflacion(params: {
  monto: number
  mesInicio: number
  anioInicio: number
  mesFin: number
  anioFin: number
}): ResultadoInflacion | null {
  const indiceInicio = getIndice(params.anioInicio, params.mesInicio)
  const indiceFin = getIndice(params.anioFin, params.mesFin)
  if (indiceInicio === undefined || indiceFin === undefined) return null

  const montoFinal = params.monto * (indiceFin / indiceInicio)
  const inflacionAcumulada = (indiceFin / indiceInicio - 1) * 100

  const indiceFinAnioAnterior = getIndice(params.anioFin - 1, params.mesFin)
  const inflacionInteranual =
    indiceFinAnioAnterior !== undefined ? (indiceFin / indiceFinAnioAnterior - 1) * 100 : null

  const periodoInteranual = `${MESES[params.mesFin - 1]} ${params.anioFin - 1} - ${MESES[params.mesFin - 1]} ${params.anioFin}`

  return { montoFinal, inflacionAcumulada, inflacionInteranual, periodoInteranual }
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
