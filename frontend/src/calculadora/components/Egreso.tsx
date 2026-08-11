import { formatoMoneda, formatoPorcentaje} from "../utils/ipc"
import type { ResultadoInflacion } from "@/interfaces/ipc"

interface EgresoProps {
  resultado: ResultadoInflacion | null
}

export default function Egreso({ resultado }: EgresoProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="font-semibold text-foreground">Resultado:</h2>

      <p className="text-2xl font-bold text-blue-900/80 break-words sm:text-3xl">
        {formatoMoneda(resultado?.montoFinal ?? 0)}
      </p>

      {!resultado ? (
        <p className="text-sm text-muted-foreground">
          Completá el período para ver el resultado.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <p className=" text-foreground">
              La inflación acumulada para el período especificado fue de:
            </p>
            <p className="text-xl font-bold text-red-600 sm:text-2xl">
              {formatoPorcentaje(resultado.inflacionAcumulada)}
            </p>
          </div>

          {resultado.inflacionInteranual !== null && (
            <div className="flex flex-col gap-1">
              <p className="text-foreground">
                La inflación interanual del período {resultado.periodoInteranual} fue de:
              </p>
              <p className="text-xl font-bold text-red-600 sm:text-2xl">
                {formatoPorcentaje(resultado.inflacionInteranual)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
