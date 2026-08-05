import { useEffect } from "react"
import { toast } from "sonner"
import type { IpcEntry } from "@/interfaces/ipc"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import logo from '@/assets/logo.png'
import FormularioIpc from "../components/FormularioIpc"
import TablaIpc from "../components/TablaIpc"
import { useIpcEntriesQuery } from "../hooks/ipcEntriesQueries"
function ordenarEntradas(datos: IpcEntry[]): IpcEntry[] {
  return [...datos].sort((a, b) => b.anio - a.anio || b.mes - a.mes)
}

export default function CargaDatos() {
  const { data, isPending: cargando, isError } = useIpcEntriesQuery()
  const entradas = ordenarEntradas(data ?? [])

  useEffect(() => {
    if (isError) toast.error("No se pudieron cargar los períodos existentes.")
  }, [isError])

  return (
    <div>
      <div className='flex flex-row justify-between items-center mb-2'  >
              <h1 className='text-3xl font-bold text-blue-900/80 '>
               INGRESO CALCULADORA DE INFLACIÓN
             </h1>

             <img src={logo} alt="Logo" title="Dipec" className="w-26" />
          </div>

      <Tabs defaultValue="carga">
        <TabsList className="w-full bg-gray-200/60 py-2 ">
          <TabsTrigger  value="carga">Ingresar Nuevos Datos</TabsTrigger>
          <TabsTrigger value="tabla">Agregar o Modificar Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="carga">
          <div className="flex flex-col gap-4 rounded-2xl bg-teal-500/10 px-10 py-14 mt-4">
            <FormularioIpc entradas={entradas} />
          </div>
          <div className="flex flex-col gap-4 mt-10 rounded-2xl px-10 py-14 border border-2 border-muted-foreground/20">
              <h2 className="text-base font-semibold text-foreground">Datos ingresados:</h2>

              {cargando ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
              ) : (
                <TablaIpc entradas={entradas} soloLectura alturaMaxima={300} />
              )}
            </div>
        </TabsContent>

        <TabsContent value="tabla">
          <div className="flex flex-col gap-4 mt-4  rounded-2xl px-10 py-14 border border-2 border-muted-foreground/20">
            {cargando ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : (
              <TablaIpc entradas={entradas} alturaMaxima={600}/>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
