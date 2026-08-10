import { lazy, Suspense, useMemo, useState } from "react";
import Egreso from "../components/Egreso";
import Ingreso from "../components/Ingreso";
import logo from '@/assets/logo.png'
import {  getAniosDisponibles } from "../utils/ipc";
import { calcularInflacion, getEntradasDelPeriodo, getEntradasDesde, getVariacionAnual } from "../utils/calculos";
import { useIpcEntriesQuery } from "@/entry-data/hooks/ipcEntriesQueries";

const GraficoVariacionMensual = lazy(() => import("../components/GraficoVariacionMensual"))
const GraficoVariacionMensualPeriodo = lazy(() => import("../components/GraficoVariacionMensualPeriodo"))
const GraficoVariacionAnual = lazy(() => import("../components/GraficoVariacionAnual"))

export default function Calculadora() {


  const { data = [], isPending: cargando, isError } = useIpcEntriesQuery()
  
  const anios = useMemo(() => getAniosDisponibles(data), [data])

  const [monto, setMonto] = useState("")
  const [mesInicio, setMesInicio] = useState(0)
  const [anioInicio, setAnioInicio] = useState(0)
  const [mesFin, setMesFin] = useState(0)
  const [anioFin, setAnioFin] = useState(0)

  const resultado = useMemo(() => {
    const montoNumero = Number(monto)
    if (!montoNumero || !mesInicio || !anioInicio || !mesFin || !anioFin) return null
    return calcularInflacion(data, { monto: montoNumero, mesInicio, anioInicio, mesFin, anioFin })
  }, [data, monto, mesInicio, anioInicio, mesFin, anioFin])

  const entradasMensual = useMemo(() => getEntradasDesde(data, 2023, 6), [data])

  const periodoCompleto = Boolean(mesInicio && anioInicio && mesFin && anioFin)

  const entradasPeriodo = useMemo(() => {
    if (!periodoCompleto) return []
    return getEntradasDelPeriodo(data, { mesInicio, anioInicio, mesFin, anioFin }, 3)
  }, [data, periodoCompleto, mesInicio, anioInicio, mesFin, anioFin])

  const variacionAnual = useMemo(() => getVariacionAnual(data), [data])

  return (
    <div >
         <div className='flex flex-row justify-between items-center mb-2'  >
              <h1 className='text-3xl font-bold text-blue-900/80 '>
               CALCULADORA DE INFLACIÓN
             </h1>

             <img src={logo} alt="Logo" title="Dipec" className="w-26" />
          </div>
       <div className='mb-10 flex justify-start'>
        <p className='max-w-2xl text-left text-semibold'>Esta herramienta le permite calcular la inflación acumulada para un determinado período,
          en base al Índice de Precios al Consumidor (IPC) de San Salvador de Jujuy.</p>
       </div>

       {cargando && (
         <p className='mb-4 text-sm text-muted-foreground'>Cargando datos del IPC...</p>
       )}

       {isError && (
         <p className='mb-4 text-sm text-red-600'>No se pudieron cargar los datos del IPC. Intente nuevamente más tarde.</p>
       )}

       <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-teal-500/20 w-full rounded-2xl px-10 py-14'>
        <Ingreso
          monto={monto}
          onMontoChange={setMonto}
          mesInicio={mesInicio}
          anioInicio={anioInicio}
          mesFin={mesFin}
          anioFin={anioFin}
          onMesInicioChange={setMesInicio}
          onAnioInicioChange={setAnioInicio}
          onMesFinChange={setMesFin}
          onAnioFinChange={setAnioFin}
          anios={anios}
          ipcData={data}
        />
        <div className='flex flex-col gap-1'>
          <Egreso resultado={resultado} />
          {entradasPeriodo.length > 0 && (
            <Suspense fallback={<p className='text-sm text-muted-foreground'>Cargando gráfico...</p>}>
              <GraficoVariacionMensualPeriodo entradas={entradasPeriodo} />
            </Suspense>
          )}
        </div>
        </div>

       {data.length > 0 && (
         <Suspense fallback={<p className='mt-10 text-sm text-muted-foreground'>Cargando gráficos...</p>}>
           <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-4'>
             <GraficoVariacionMensual entradas={entradasMensual} />
             <GraficoVariacionAnual variacionAnual={variacionAnual} />
           </div>
         </Suspense>
       )}
    </div>
  )
}
