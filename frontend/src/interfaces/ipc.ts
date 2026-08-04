export interface IpcEntry {
  anio: number
  mes: number
  variacionMensual: number
  inflacionInteranual: number | null
}

export interface ResultadoInflacion {
  montoFinal: number
  inflacionAcumulada: number
  inflacionInteranual: number | null
  periodoInteranual: string
}