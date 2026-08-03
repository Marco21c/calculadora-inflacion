import { formatoMoneda, formatoPorcentaje, type ResultadoInflacion } from "../data/ipc"

interface EgresoProps {
  resultado: ResultadoInflacion | null
}

export default function Egreso({ resultado }: EgresoProps) {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">Resultado:</h2>

      {!resultado ? (
        <p className="text-sm text-muted-foreground">
          Completá el monto y el período para ver el resultado.
        </p>
      ) : (
        <>
          <p className="text-3xl font-bold text-blue-900/80">{formatoMoneda(resultado.montoFinal)}</p>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-foreground">
              La inflación acumulada para el período especificado fue de:
            </p>
            <p className="text-xl font-bold text-red-600">
              {formatoPorcentaje(resultado.inflacionAcumulada)}
            </p>
          </div>

          {resultado.inflacionInteranual !== null && (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-foreground">
                La inflación interanual del período {resultado.periodoInteranual} fue de:
              </p>
              <p className="text-xl font-bold text-red-600">
                {formatoPorcentaje(resultado.inflacionInteranual)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
