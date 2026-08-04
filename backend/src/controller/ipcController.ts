import type { Request, Response } from "express"
import type { IpcEntry } from "../interfaces/ipc.js"
import { eliminarEntrada, guardarEntrada, listarEntradas } from "../service/ipcService.js"

function esEntradaValida(body: unknown): body is IpcEntry {
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

export function obtenerEntradas(_req: Request, res: Response) {
  res.json(listarEntradas())
}

export function crearEntrada(req: Request, res: Response) {
  const body = req.body
  if (!esEntradaValida(body)) {
    res.status(400).json({ error: "Datos inválidos" })
    return
  }

  const entrada = guardarEntrada({
    anio: body.anio,
    mes: body.mes,
    variacionMensual: body.variacionMensual,
    inflacionInteranual: body.inflacionInteranual ?? null,
  })
  res.status(201).json(entrada)
}

export function borrarEntrada(req: Request, res: Response) {
  const anio = Number(req.params.anio)
  const mes = Number(req.params.mes)

  if (!eliminarEntrada(anio, mes)) {
    res.status(404).json({ error: "No existe una entrada para ese período" })
    return
  }
  res.status(204).send()
}
