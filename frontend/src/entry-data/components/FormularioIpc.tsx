import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ConfirmDialog"
import { MESES } from "@/calculadora/utils/ipc"
import type { IpcEntry } from "@/interfaces/ipc"
import { useGuardarEntradaMutation } from "../hooks/ipcEntriesQueries"
import DetalleEntradaIpc from "./DetalleEntradaIpc"
import { calcularSiguientePeriodo } from "../utils/calcularSiguientePeriodo"

interface FormularioIpcProps {
  entradas: IpcEntry[]
}

const inputClassName =
  "h-10 rounded-md border border-input bg-white px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export default function FormularioIpc({ entradas }: FormularioIpcProps) {
  const siguientePeriodo = useMemo(() => calcularSiguientePeriodo(entradas), [entradas])
  const guardarMutation = useGuardarEntradaMutation()
  const [pendiente, setPendiente] = useState<IpcEntry | null>(null)

  const [mes, setMes] = useState("")
  const [anio, setAnio] = useState("")
  const [ipc, setIpc] = useState("")
  const [inflacionMensual, setInflacionMensual] = useState("")
  const [inflacionInteranual, setInflacionInteranual] = useState("")
  const [promedioAnualIpc, setPromedioAnualIpc] = useState("")
  const [variacionInteranualPromedio, setVariacionInteranualPromedio] = useState("")

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault()

    const mesNumero = siguientePeriodo?.mes ?? Number(mes)
    const anioNumero = siguientePeriodo?.anio ?? Number(anio)
    const ipcNumero = Number(ipc)
    const inflacionMensualNumero = Number(inflacionMensual)

    if ( !mesNumero || !anioNumero || ipc.trim() === "" ||
      Number.isNaN(ipcNumero) || inflacionMensual.trim() === "" || Number.isNaN(inflacionMensualNumero) ) {
      toast.error("Completá mes, año, IPC e inflación mensual.")
      return
    }

    setPendiente({
      mes: mesNumero,
      anio: anioNumero,
      ipc: ipcNumero,
      inflacionMensual: inflacionMensualNumero,
      inflacionInteranual: inflacionInteranual.trim() === "" ? null : Number(inflacionInteranual),
      promedioAnualIpc: promedioAnualIpc.trim() === "" ? null : Number(promedioAnualIpc),
      variacionInteranualPromedio:
        variacionInteranualPromedio.trim() === "" ? null : Number(variacionInteranualPromedio),
    })
  }

  function confirmarGuardado() {
    if (!pendiente) return
    guardarMutation.mutate(pendiente, {
      onSuccess: () => {
        toast.success(`Período ${MESES[pendiente.mes - 1]} ${pendiente.anio} guardado.`)
        setMes("")
        setAnio("")
        setIpc("")
        setInflacionMensual("")
        setInflacionInteranual("")
        setPromedioAnualIpc("")
        setVariacionInteranualPromedio("")
        setPendiente(null)
      },
      onError: () => toast.error("No se pudo guardar el período. Intentá nuevamente."),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="mes" className="text-sm font-semibold text-foreground">
            Fecha
          </label>
          {siguientePeriodo ? (
            <div className={`${inputClassName} flex items-center bg-muted/40 text-muted-foreground`}>
              {MESES[siguientePeriodo.mes - 1]} {siguientePeriodo.anio}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <select id="mes" value={mes} onChange={(e) => setMes(e.target.value)} className={inputClassName}>
                <option value="" disabled>
                  Mes
                </option>
                {MESES.map((nombre, i) => (
                  <option key={nombre} value={i + 1}>
                    {nombre}
                  </option>
                ))}
              </select>
              <input
                id="anio"
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                placeholder="2026"
                className={inputClassName}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="ipc" className="text-sm font-semibold text-foreground">
            IPC
          </label>
          <input
            id="ipc"
            type="number"
            step="0.01"
            value={ipc}
            onChange={(e) => setIpc(e.target.value)}
            placeholder="105.20"
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="inflacionMensual" className="text-sm font-semibold text-foreground">
            Inflación mensual (%)
          </label>
          <input
            id="inflacionMensual"
            type="number"
            step="0.01"
            value={inflacionMensual}
            onChange={(e) => setInflacionMensual(e.target.value)}
            placeholder="2.10"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="inflacionInteranual" className="text-sm font-semibold text-foreground">
            Inflación interanual (%) — opcional
          </label>
          <input
            id="inflacionInteranual"
            type="number"
            step="0.01"
            value={inflacionInteranual}
            onChange={(e) => setInflacionInteranual(e.target.value)}
            placeholder="85.40"
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="promedioAnualIpc" className="text-sm font-semibold text-foreground">
            Promedio anual IPC — opcional
          </label>
          <input
            id="promedioAnualIpc"
            type="number"
            step="0.01"
            value={promedioAnualIpc}
            onChange={(e) => setPromedioAnualIpc(e.target.value)}
            placeholder="98.30"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="variacionInteranualPromedio" className="text-sm font-semibold text-foreground">
            Variación interanual promedio (%) — opcional
          </label>
          <input
            id="variacionInteranualPromedio"
            type="number"
            step="0.01"
            value={variacionInteranualPromedio}
            onChange={(e) => setVariacionInteranualPromedio(e.target.value)}
            placeholder="78.20"
            className={inputClassName}
          />
        </div>
      </div>

      <Button type="submit" disabled={guardarMutation.isPending}>
        {guardarMutation.isPending ? "Guardando..." : "Guardar período"}
      </Button>

      <ConfirmDialog
        open={pendiente !== null}
        onOpenChange={(open) => !open && setPendiente(null)}
        title="¿Guardar este período?"
        description={
          pendiente ? `Se va a guardar ${MESES[pendiente.mes - 1]} ${pendiente.anio} con los datos ingresados.` : undefined
        }
        detalle={pendiente && <DetalleEntradaIpc entrada={pendiente} />}
        confirmLabel="Guardar"
        loading={guardarMutation.isPending}
        onConfirm={confirmarGuardado}
      />
    </form>
  )
}
