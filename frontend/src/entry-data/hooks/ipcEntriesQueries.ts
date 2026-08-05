import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { IpcEntry } from "@/interfaces/ipc"
import { eliminarEntrada, guardarEntrada, guardarEntradasMasivo, listarEntradas } from "../services/ipcAdmin"

export const ipcEntriesQueryKey = ["ipc-entries"] as const

export function useIpcEntriesQuery() {
  return useQuery({ queryKey: ipcEntriesQueryKey, queryFn: listarEntradas })
}

export function useGuardarEntradaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: guardarEntrada,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ipcEntriesQueryKey }),
  })
}

export function useEliminarEntradaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ anio, mes }: { anio: number; mes: number }) => eliminarEntrada(anio, mes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ipcEntriesQueryKey }),
  })
}

export function useGuardarEntradasMasivoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entradas: IpcEntry[]) => guardarEntradasMasivo(entradas),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ipcEntriesQueryKey }),
  })
}
