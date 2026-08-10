import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ConfirmDialog"
import { MESES } from "@/calculadora/utils/ipc"
import {
  calcularInflacionInteranual,
  calcularPromedioAnualIpc,
  calcularVariacionInteranualPromedio,
} from "@/calculadora/utils/calculos"
import type { IpcEntry } from "@/interfaces/ipc"
import { useGuardarEntradaMutation } from "../hooks/ipcEntriesQueries"
import DetalleEntradaIpc from "./DetalleEntradaIpc"
import { calcularSiguientePeriodo } from "../utils/calcularSiguientePeriodo"

interface FormularioIpcProps {
  entradas: IpcEntry[]
}

function parsearNumeroOpcional(valor: string): { ok: true; valor: number | null } | { ok: false } {
  if (valor.trim() === "") return { ok: true, valor: null }
  const numero = Number(valor)
  if (Number.isNaN(numero)) return { ok: false }
  return { ok: true, valor: numero }
}

function comoTexto(valor: number | null): string {
  return valor === null ? "" : valor.toFixed(6)
}

const inputClassName =
  "h-10 rounded-md border border-input bg-white px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export default function FormularioIpc({ entradas }: FormularioIpcProps) {
  const siguientePeriodo = useMemo(() => calcularSiguientePeriodo(entradas), [entradas])
  const guardarMutation = useGuardarEntradaMutation()
  const [pendiente, setPendiente] = useState<IpcEntry | null>(null)

  const [ipc, setIpc] = useState("")
  const [inflacionMensual, setInflacionMensual] = useState("")

  // Valor tipeado a mano para cada campo opcional. Mientras el admin no lo
  // haya tocado, se muestra el calculado en su lugar 
  const [inflacionInteranual, setInflacionInteranual] = useState("")
  const [promedioAnualIpc, setPromedioAnualIpc] = useState("")
  const [variacionInteranualPromedio, setVariacionInteranualPromedio] = useState("")

  const [inflacionInteranualTocado, setInflacionInteranualTocado] = useState(false)
  const [promedioAnualIpcTocado, setPromedioAnualIpcTocado] = useState(false)
  const [variacionInteranualPromedioTocado, setVariacionInteranualPromedioTocado] = useState(false)

  const ipcNumero = Number(ipc)
  const ipcValido = ipc.trim() !== "" && !Number.isNaN(ipcNumero)

  const inflacionInteranualCalculado = useMemo(() => {
    if (!ipcValido || !siguientePeriodo) return null
    return calcularInflacionInteranual(entradas, siguientePeriodo.anio, siguientePeriodo.mes, ipcNumero)
  }, [entradas, siguientePeriodo, ipcValido, ipcNumero])

  const promedioAnualIpcCalculado = useMemo(() => {
    if (!ipcValido) return null
    return calcularPromedioAnualIpc(entradas, ipcNumero)
  }, [entradas, ipcValido, ipcNumero])

  // Valor efectivamente mostrado en cada input: el tipeado a mano si el
  // admin lo tocó, si no el calculado en vivo.
  const inflacionInteranualMostrado = inflacionInteranualTocado
    ? inflacionInteranual
    : comoTexto(inflacionInteranualCalculado)
  const inflacionInteranualParsed = parsearNumeroOpcional(inflacionInteranualMostrado)

  const variacionInteranualPromedioCalculado = useMemo(() => {
    if (!ipcValido) return null
    return calcularVariacionInteranualPromedio(entradas, inflacionInteranualParsed.ok ? inflacionInteranualParsed.valor : null)
  }, [entradas, ipcValido, inflacionInteranualParsed])

  const promedioAnualIpcMostrado = promedioAnualIpcTocado ? promedioAnualIpc : comoTexto(promedioAnualIpcCalculado)
  const promedioAnualIpcParsed = parsearNumeroOpcional(promedioAnualIpcMostrado)

  const variacionInteranualPromedioMostrado = variacionInteranualPromedioTocado
    ? variacionInteranualPromedio
    : comoTexto(variacionInteranualPromedioCalculado)
  const variacionInteranualPromedioParsed = parsearNumeroOpcional(variacionInteranualPromedioMostrado)

  // Si el admin vació un campo tocado a mano, al cambiar el IPC volvemos a
  // modo automático para que se autocomplete de nuevo (en vez de quedar
  // "tocado" para siempre con un valor vacío). Ajustamos el estado durante
  // el render (patrón recomendado por React) en vez de usar un efecto.
  const [ipcAnterior, setIpcAnterior] = useState(ipc)
  if (ipc !== ipcAnterior) {
    setIpcAnterior(ipc)
    if (inflacionInteranualTocado && inflacionInteranual.trim() === "") setInflacionInteranualTocado(false)
    if (promedioAnualIpcTocado && promedioAnualIpc.trim() === "") setPromedioAnualIpcTocado(false)
    if (variacionInteranualPromedioTocado && variacionInteranualPromedio.trim() === "") setVariacionInteranualPromedioTocado(false)
  }

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault()

    if (!siguientePeriodo) {
      toast.error("No se pudieron cargar los períodos existentes. Recargá la página para continuar.")
      return
    }

    const inflacionMensualNumero = Number(inflacionMensual)

    if (
      !ipcValido ||
      inflacionMensual.trim() === "" || Number.isNaN(inflacionMensualNumero) ||
      !inflacionInteranualParsed.ok || !promedioAnualIpcParsed.ok || !variacionInteranualPromedioParsed.ok
    ) {
      toast.error("Completá IPC e inflación mensual con valores numéricos válidos.")
      return
    }

    setPendiente({
      mes: siguientePeriodo.mes,
      anio: siguientePeriodo.anio,
      ipc: ipcNumero,
      inflacionMensual: inflacionMensualNumero,
      inflacionInteranual: inflacionInteranualParsed.valor,
      promedioAnualIpc: promedioAnualIpcParsed.valor,
      variacionInteranualPromedio: variacionInteranualPromedioParsed.valor,
    })
  }

  function confirmarGuardado() {
    if (!pendiente) return
    guardarMutation.mutate(pendiente, {
      onSuccess: () => {
        toast.success(`Período ${MESES[pendiente.mes - 1]} ${pendiente.anio} guardado.`)
        setIpc("")
        setInflacionMensual("")
        setInflacionInteranual("")
        setPromedioAnualIpc("")
        setVariacionInteranualPromedio("")
        setInflacionInteranualTocado(false)
        setPromedioAnualIpcTocado(false)
        setVariacionInteranualPromedioTocado(false)
        setPendiente(null)
      },
      onError: () => toast.error("No se pudo guardar el período. Intentá nuevamente."),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="mes" className="text-lg text-foreground">
            Fecha
          </label>
          {siguientePeriodo ? (
            <div id="mes" className={`${inputClassName} flex items-center bg-muted/40 text-muted-foreground`}>
              {MESES[siguientePeriodo.mes - 1]} {siguientePeriodo.anio}
            </div>
          ) : (
            <p className="text-sm text-red-600">
              No se pudieron cargar los períodos existentes. Recargá la página para continuar.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="ipc" className="text-lg text-foreground">
            IPC - Nivel General
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
          <label htmlFor="inflacionMensual" className="text-lg text-foreground">
            Inflación mensual - Variación %
          </label>
          <input
            id="inflacionMensual"
            type="number"
            step="0.001"
            value={inflacionMensual}
            onChange={(e) => setInflacionMensual(e.target.value)}
            placeholder="0.023 (= 2.3%)"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="inflacionInteranual" className="text-lg text-foreground">
            Inflación interanual (%) — opcional
          </label>
          <input
            id="inflacionInteranual"
            type="number"
            step="0.000001"
            value={inflacionInteranualMostrado}
            onChange={(e) => {
              setInflacionInteranual(e.target.value)
              setInflacionInteranualTocado(true)
            }}
            placeholder="85.40"
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="promedioAnualIpc" className="text-lg text-foreground">
            Promedio anual IPC — opcional
          </label>
          <input
            id="promedioAnualIpc"
            type="number"
            step="0.000001"
            value={promedioAnualIpcMostrado}
            onChange={(e) => {
              setPromedioAnualIpc(e.target.value)
              setPromedioAnualIpcTocado(true)
            }}
            placeholder="98.30"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="variacionInteranualPromedio" className="text-lg text-foreground">
            Variación interanual promedio (%) — opcional
          </label>
          <input
            id="variacionInteranualPromedio"
            type="number"
            step="0.000001"
            value={variacionInteranualPromedioMostrado}
            onChange={(e) => {
              setVariacionInteranualPromedio(e.target.value)
              setVariacionInteranualPromedioTocado(true)
            }}
            placeholder="78.20"
            className={inputClassName}
          />
        </div>
      </div>

      <Button type="submit" disabled={!siguientePeriodo || guardarMutation.isPending}>
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
