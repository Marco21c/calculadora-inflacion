import axios from "axios"
import type { IpcEntry } from "@/interfaces/ipc"

// Sin VITE_API_URL seteada: en desarrollo (vite dev) apunta al backend local;
// en cualquier build de producción usa rutas relativas same-origin (para que
// funcione detrás de un proxy tipo nginx/_redirects sin tener que acordarse
// de configurar la variable en cada plataforma de deploy).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3001" : ""),
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

export async function guardarEntradasMasivo(entradas: IpcEntry[]): Promise<IpcEntry[]> {
  const { data } = await api.put<IpcEntry[]>("/api/ipc-entries/bulk", entradas)
  return data
}
