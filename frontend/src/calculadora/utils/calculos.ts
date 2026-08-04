import type { IpcEntry, ResultadoInflacion } from "@/interfaces/ipc"
import { MESES } from "../data/ipc"

export function calcularInflacion(
  ipcData: IpcEntry[],
  params: {
    monto: number
    mesInicio: number
    anioInicio: number
    mesFin: number
    anioFin: number
  },
): ResultadoInflacion | null {
  const indiceInicio = ipcData.findIndex(
    (entrada) => entrada.anio === params.anioInicio && entrada.mes === params.mesInicio,
  )
  const indiceFin = ipcData.findIndex(
    (entrada) => entrada.anio === params.anioFin && entrada.mes === params.mesFin,
  )
  if (indiceInicio === -1 || indiceFin === -1 || indiceInicio > indiceFin) return null

  let acumulado = 1
  for (let i = indiceInicio; i <= indiceFin; i++) {
    acumulado *= 1 + ipcData[i].variacionMensual
  }

  const montoFinal = params.monto * acumulado
  const inflacionAcumulada = (acumulado - 1) * 100
  const inflacionInteranual = ipcData[indiceFin].inflacionInteranual
  const periodoInteranual = `${MESES[params.mesFin - 1]} ${params.anioFin - 1} - ${MESES[params.mesFin - 1]} ${params.anioFin}`

  return { montoFinal, inflacionAcumulada, inflacionInteranual, periodoInteranual }
}
