import type { Request, Response } from "express"
import type { IpcEntry } from "../interfaces/ipc.js"
import { deleteIpcEntries, getIpcEntries, saveAndReplace, saveIpcEntries } from "../service/ipcService.js"


function esIpcValida(body: unknown): body is IpcEntry {
  if (typeof body !== "object" || body === null) return false
  const { anio, mes, variacionMensual, inflacionInteranual } = body as Record<string, unknown>
  return (
    Number.isInteger(anio) &&
    Number.isInteger(mes) &&
    (mes as number) >= 1 &&
    (mes as number) <= 12 &&
    typeof variacionMensual === "number" &&
    Number.isFinite(variacionMensual) &&
    (inflacionInteranual === null ||
      inflacionInteranual === undefined ||
      typeof inflacionInteranual === "number")
  )
}

export async function obtenerIpcs(_req: Request, res: Response) {
  res.json(await getIpcEntries())
}

export async function crearIpc(req: Request, res: Response) {
  const body = req.body
  if (!esIpcValida(body)) {
    res.status(400).json({ error: "Datos inválidos" })
    return
  }

  const entrada = await saveIpcEntries({
    anio: body.anio,
    mes: body.mes,
    variacionMensual: body.variacionMensual,
    inflacionInteranual: body.inflacionInteranual ?? null,
  })
  res.status(201).json(entrada)
}

export async function cargaMasivaIpc(req: Request, res: Response) {
  const body = req.body
  if (!Array.isArray(body) || !body.every(esIpcValida)) {
    res.status(400).json({ error: "Datos inválidos" })
    return
  }

  const entradas = await saveAndReplace(
    body.map((entrada) => ({
      anio: entrada.anio,
      mes: entrada.mes,
      variacionMensual: entrada.variacionMensual,
      inflacionInteranual: entrada.inflacionInteranual ?? null,
    })),
  )
  res.status(201).json(entradas)
}

export async function borrarIpc(req: Request, res: Response) {
  const anio = Number(req.params.anio)
  const mes = Number(req.params.mes)

  if (!(await deleteIpcEntries(anio, mes))) {
    res.status(404).json({ error: "No existe una entrada para ese período" })
    return
  }
  res.status(204).send()
}
