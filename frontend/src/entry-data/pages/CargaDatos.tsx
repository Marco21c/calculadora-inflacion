import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import type { IpcEntry } from "@/interfaces/ipc"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormularioIpc from "../components/FormularioIpc"
import TablaIpc from "../components/TablaIpc"
import { listarEntradas } from "../data/ipcAdmin"
import logo from '@/assets/logo.png'
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
      <div className='flex flex-row justify-between items-center mb-2'  >
              <h1 className='text-3xl font-bold text-blue-900/80 '>
               INGRESO IPC
             </h1>

             <img src={logo} alt="Logo" title="Dipec" className="w-26" />
          </div>

      <Tabs defaultValue="carga"> 
        <TabsList className="w-full bg-gray-200/60 py-2 ">
          <TabsTrigger  value="carga">Ingresar Nuevos Datos</TabsTrigger>
          <TabsTrigger value="tabla">Agregar o Modificar Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="carga">
          <div className="flex flex-col gap-10 rounded-2xl bg-teal-500/10 px-10 py-14 mt-4">
            <FormularioIpc entradas={entradas} onGuardado={recargar} />
          </div>
          <div className="flex flex-col gap-4 mt-10 rounded-2xl px-10 py-14 border border-2 border-muted-foreground/20">
              <h2 className="text-base font-semibold text-foreground">Ipc ordenado del mas reciente al mas antiguo</h2>
              
              {cargando ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
              ) : (
                <TablaIpc entradas={entradas} onActualizado={recargar} soloLectura alturaMaxima={300} />
              )}
            </div>
        </TabsContent>

        <TabsContent value="tabla">
          <div className="flex flex-col gap-4 mt-10 rounded-2xl px-10 py-14 border border-2 border-muted-foreground/20">
            {cargando ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : (
              <TablaIpc entradas={entradas} onActualizado={recargar} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
