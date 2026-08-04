import { toast } from "sonner"
import { MESES, formatoPorcentaje } from "@/calculadora/data/ipc"
import type { IpcEntry } from "@/interfaces/ipc"
import { eliminarEntrada } from "../data/ipcAdmin"

interface TablaIpcProps {
  entradas: IpcEntry[]
  onEliminado: () => void
}

export default function TablaIpc({ entradas, onEliminado }: TablaIpcProps) {
  async function handleEliminar(anio: number, mes: number) {
    try {
      await eliminarEntrada(anio, mes)
      toast.success(`Período ${MESES[mes - 1]} ${anio} eliminado.`)
      onEliminado()
    } catch {
      toast.error("No se pudo eliminar el período. Intentá nuevamente.")
    }
  }

  if (entradas.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay períodos cargados.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-foreground">
            <th className="py-2 pr-4 font-semibold">Período</th>
            <th className="py-2 pr-4 font-semibold">Variación mensual</th>
            <th className="py-2 pr-4 font-semibold">Inflación interanual</th>
            <th className="py-2 pr-4 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {entradas.map((entrada) => (
            <tr key={`${entrada.anio}-${entrada.mes}`} className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">
                {MESES[entrada.mes - 1]} {entrada.anio}
              </td>
              <td className="py-2 pr-4 text-foreground">{formatoPorcentaje(entrada.variacionMensual * 100)}</td>
              <td className="py-2 pr-4 text-foreground">
                {entrada.inflacionInteranual === null ? "-" : formatoPorcentaje(entrada.inflacionInteranual)}
              </td>
              <td className="py-2 pr-4">
                <button
                  type="button"
                  onClick={() => handleEliminar(entrada.anio, entrada.mes)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
