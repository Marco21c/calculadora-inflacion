import { lazy, Suspense, useMemo, useState } from "react";
import Egreso from "../components/Egreso";
import Ingreso from "../components/Ingreso";
import Loader from "@/components/Loader";
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

  // Período por defecto: el mes final es el último cargado, el inicial el
  // anterior a ese. Se aplica una sola vez, apenas llegan los datos (antes
  // de eso los selects de mes/año ni siquiera tienen opciones para elegir).
  const [defaultsAplicados, setDefaultsAplicados] = useState(false)
  if (!defaultsAplicados && data.length > 0) {
    setDefaultsAplicados(true)
    const ultima = data[data.length - 1]
    const anterior = data.length > 1 ? data[data.length - 2] : ultima
    setMesFin(ultima.mes)
    setAnioFin(ultima.anio)
    setMesInicio(anterior.mes)
    setAnioInicio(anterior.anio)
  }

  const resultado = useMemo(() => {
    // El monto solo afecta el monto final en pesos; la inflación acumulada
    // e interanual (los dos porcentajes) no dependen de él, así que se
    // muestran apenas el período está completo, sin esperar a que se
    // cargue un monto.
    const montoNumero = Number(monto) || 0
    if (!mesInicio || !anioInicio || !mesFin || !anioFin) return null
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
    <div className="p-4 sm:p-6 md:p-8">
         <div className='flex flex-row items-center justify-between gap-3 mb-2'  >
              <h1 className='min-w-0 text-lg font-bold text-blue-900/80 sm:text-2xl md:text-3xl'>
               CALCULADORA DE INFLACIÓN
             </h1>

             <img src={logo} alt="Logo" title="Dipec" className="w-14 shrink-0 sm:w-20 md:w-26" />
          </div>
       <div className='mb-10 flex justify-start'>
        <p className='max-w-2xl text-xs md:text-base text-left text-semibold'>Esta herramienta le permite calcular la inflación acumulada para un determinado período,
          en base al Índice de Precios al Consumidor (IPC) de San Salvador de Jujuy.</p>
       </div>

       {cargando && <Loader label="Cargando datos del IPC..." className="mb-4" />}

       {isError && (
         <p className='mb-4 text-sm text-red-600'>No se pudieron cargar los datos del IPC. Intente nuevamente más tarde.</p>
       )}

       <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-teal-500/20 w-full rounded-2xl px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-14'>
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
        <div className='flex flex-col gap-1 min-w-0'>
          <Egreso resultado={resultado} />
          {entradasPeriodo.length > 0 && (
            <Suspense fallback={<Loader label="Cargando gráfico..." />}>
              <GraficoVariacionMensualPeriodo entradas={entradasPeriodo} />
            </Suspense>
          )}
        </div>
        </div>

       {data.length > 0 && (
         <Suspense fallback={<Loader label="Cargando gráficos..." className="mt-10" />}>
           <div className='mt-6 grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2'>
             <GraficoVariacionMensual entradas={entradasMensual} />
             <GraficoVariacionAnual variacionAnual={variacionAnual} />
           </div>
         </Suspense>
       )}
    </div>
  )
}
