import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MESES } from "@/calculadora/data/ipc"
import { guardarEntrada } from "../data/ipcAdmin"

interface FormularioIpcProps {
  onGuardado: () => void
}

export default function FormularioIpc({ onGuardado }: FormularioIpcProps) {
  const [mes, setMes] = useState("")
  const [anio, setAnio] = useState("")
  const [variacionMensual, setVariacionMensual] = useState("")
  const [inflacionInteranual, setInflacionInteranual] = useState("")
  const [guardando, setGuardando] = useState(false)

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault()

    const mesNumero = Number(mes)
    const anioNumero = Number(anio)
    const variacionNumero = Number(variacionMensual)

    if (!mesNumero || !anioNumero || variacionMensual.trim() === "" || Number.isNaN(variacionNumero)) {
      toast.error("Completá mes, año y variación mensual.")
      return
    }

    setGuardando(true)
    try {
      await guardarEntrada({
        mes: mesNumero,
        anio: anioNumero,
        variacionMensual: variacionNumero / 100,
        inflacionInteranual: inflacionInteranual.trim() === "" ? null : Number(inflacionInteranual),
      })
      toast.success(`Período ${MESES[mesNumero - 1]} ${anioNumero} guardado.`)
      setMes("")
      setAnio("")
      setVariacionMensual("")
      setInflacionInteranual("")
      onGuardado()
    } catch {
      toast.error("No se pudo guardar el período. Intentá nuevamente.")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="mes" className="text-sm font-semibold text-foreground">
            Mes
          </label>
          <select
            id="mes"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              Mes
            </option>
            {MESES.map((nombre, i) => (
              <option key={nombre} value={i + 1}>
                {nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="anio" className="text-sm font-semibold text-foreground">
            Año
          </label>
          <input
            id="anio"
            type="number"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            placeholder="2026"
            className="h-10 rounded-md border border-input bg-white px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="variacionMensual" className="text-sm font-semibold text-foreground">
          Variación mensual (%)
        </label>
        <input
          id="variacionMensual"
          type="number"
          step="0.01"
          value={variacionMensual}
          onChange={(e) => setVariacionMensual(e.target.value)}
          placeholder="2.10"
          className="h-10 rounded-md border border-input bg-white px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          className="h-10 rounded-md border border-input bg-white px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <Button type="submit" disabled={guardando} className="w-fit">
        {guardando ? "Guardando..." : "Guardar período"}
      </Button>
    </form>
  )
}
