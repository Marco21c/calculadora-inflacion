export interface IpcEntry {
  anio: number
  mes: number
  ipc: number
  inflacionMensual: number
  inflacionInteranual: number | null
  promedioAnualIpc: number | null
  variacionInteranualPromedio: number | null
}

export interface ResultadoInflacion {
  montoFinal: number
  inflacionAcumulada: number
  inflacionInteranual: number | null
  periodoInteranual: string
}