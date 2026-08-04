import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import type { IpcEntry } from "@/interfaces/ipc"
import FormularioIpc from "../components/FormularioIpc"
import TablaIpc from "../components/TablaIpc"
import { listarEntradas } from "../data/ipcAdmin"

function ordenarEntradas(datos: IpcEntry[]): IpcEntry[] {
  return [...datos].sort((a, b) => b.anio - a.anio || b.mes - a.mes)
}

export default function CargaDatos() {
  const [entradas, setEntradas] = useState<IpcEntry[]>([])
  const [cargando, setCargando] = useState(true)

  const recargar = useCallback(() => {
    setCargando(true)
    listarEntradas()
      .then((datos) => setEntradas(ordenarEntradas(datos)))
      .catch(() => toast.error("No se pudieron cargar los períodos existentes."))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    listarEntradas()
      .then((datos) => setEntradas(ordenarEntradas(datos)))
      .catch(() => toast.error("No se pudieron cargar los períodos existentes."))
      .finally(() => setCargando(false))
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-blue-900/80">Carga de datos del IPC</h1>

      <div className="grid grid-cols-1 gap-10 rounded-2xl bg-teal-500/20 px-10 py-14 md:grid-cols-2">
        <FormularioIpc onGuardado={recargar} />

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Períodos cargados:</h2>
          {cargando ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <TablaIpc entradas={entradas} onEliminado={recargar} />
          )}
        </div>
      </div>
    </div>
  )
}
