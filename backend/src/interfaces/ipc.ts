export interface IpcEntryRow {
  anio: number
  mes: number
  variacion_mensual: number
  inflacion_interanual: number | null
}

export interface IpcEntry {
  anio: number
  mes: number
  variacionMensual: number
  inflacionInteranual: number | null
}