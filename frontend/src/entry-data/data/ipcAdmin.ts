import axios from "axios"
import type { IpcEntry } from "@/interfaces/ipc"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
})

export async function listarEntradas(): Promise<IpcEntry[]> {
  const { data } = await api.get<IpcEntry[]>("/api/ipc-entries")
  return data
}

export async function guardarEntrada(entrada: IpcEntry): Promise<IpcEntry> {
  const { data } = await api.post<IpcEntry>("/api/ipc-entries", entrada)
  return data
}

export async function eliminarEntrada(anio: number, mes: number): Promise<void> {
  await api.delete(`/api/ipc-entries/${anio}/${mes}`)
}
