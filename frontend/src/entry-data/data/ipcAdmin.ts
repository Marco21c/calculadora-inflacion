import type { IpcEntry } from "@/interfaces/ipc"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"

export async function listarEntradas(): Promise<IpcEntry[]> {
  const respuesta = await fetch(`${API_URL}/api/ipc-entries`)
  if (!respuesta.ok) throw new Error("No se pudieron obtener las entradas del IPC")
  return respuesta.json()
}

export async function guardarEntrada(entrada: IpcEntry): Promise<IpcEntry> {
  const respuesta = await fetch(`${API_URL}/api/ipc-entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entrada),
  })
  if (!respuesta.ok) throw new Error("No se pudo guardar la entrada del IPC")
  return respuesta.json()
}

export async function eliminarEntrada(anio: number, mes: number): Promise<void> {
  const respuesta = await fetch(`${API_URL}/api/ipc-entries/${anio}/${mes}`, { method: "DELETE" })
  if (!respuesta.ok) throw new Error("No se pudo eliminar la entrada del IPC")
}
