import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Egreso from "../components/Egreso";
import Ingreso from "../components/Ingreso";
import logo from '@/assets/logo.png'
import { fetchIpcData, getAniosDisponibles } from "../data/ipc";
import { calcularInflacion } from "../utils/calculos";
import type { IpcEntry } from "@/interfaces/ipc";


export default function Calculadora() {
  const [ipcData, setIpcData] = useState<IpcEntry[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetchIpcData()
      .then(setIpcData)
      .catch(() => toast.error("No se pudieron cargar los datos del IPC. Intentá nuevamente más tarde."))
      .finally(() => setCargando(false))
  }, [])

  const anios = useMemo(() => getAniosDisponibles(ipcData), [ipcData])

  const [monto, setMonto] = useState("")
  const [mesInicio, setMesInicio] = useState(0)
  const [anioInicio, setAnioInicio] = useState(0)
  const [mesFin, setMesFin] = useState(0)
  const [anioFin, setAnioFin] = useState(0)

  const resultado = useMemo(() => {
    const montoNumero = Number(monto)
    if (!montoNumero || !mesInicio || !anioInicio || !mesFin || !anioFin) return null
    return calcularInflacion(ipcData, { monto: montoNumero, mesInicio, anioInicio, mesFin, anioFin })
  }, [ipcData, monto, mesInicio, anioInicio, mesFin, anioFin])

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

       <div className='grid grid-cols-1 md:grid-cols-2 gap-10 bg-teal-500/20 w-full rounded-2xl px-10 py-14'>
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
          ipcData={ipcData}
        />
        <Egreso resultado={resultado} />
        </div>
    </div>
  )
}
