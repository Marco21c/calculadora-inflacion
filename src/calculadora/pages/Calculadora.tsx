import { useMemo, useState } from "react";
import Egreso from "../components/Egreso";
import Ingreso from "../components/Ingreso";
import logo from '@/assets/logo.png'
import { calcularInflacion, getAniosDisponibles } from "../data/ipc";


export default function Calculadora() {
  const anios = useMemo(() => getAniosDisponibles(), [])

  const [monto, setMonto] = useState("")
  const [mesInicio, setMesInicio] = useState(0)
  const [anioInicio, setAnioInicio] = useState(0)
  const [mesFin, setMesFin] = useState(0)
  const [anioFin, setAnioFin] = useState(0)

  const resultado = useMemo(() => {
    const montoNumero = Number(monto)
    if (!montoNumero || !mesInicio || !anioInicio || !mesFin || !anioFin) return null
    return calcularInflacion({ monto: montoNumero, mesInicio, anioInicio, mesFin, anioFin })
  }, [monto, mesInicio, anioInicio, mesFin, anioFin])

  return (
    <div>
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

       <div className='grid grid-cols-1 md:grid-cols-2 gap-8 bg-teal-500/20 w-full rounded-2xl p-8'>
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
        />
        <Egreso resultado={resultado} />
        </div>
    </div>
  )
}
