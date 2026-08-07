export interface IpcEntry {
  anio: number
  mes: number
  ipc: number
  inflacionMensual: number
  inflacionInteranual: number | null
  promedioAnualIpc: number | null
  variacionInteranualPromedio: number | null
}

// Fila en edición: ipc/inflacionMensual pueden quedar vacíos momentáneamente
// (el usuario borró el campo) antes de guardar, a diferencia de IpcEntry.
export type IpcEntryEditable = Omit<IpcEntry, "ipc" | "inflacionMensual"> & {
  ipc: number | null
  inflacionMensual: number | null
}

export interface ResultadoInflacion {
  montoFinal: number
  inflacionAcumulada: number
  inflacionInteranual: number | null
  periodoInteranual: string
}