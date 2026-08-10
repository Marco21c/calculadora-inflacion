import { ChevronsUpDown } from "lucide-react"
import { useEffect, useMemo } from "react"
import { MESES, getMesesDisponibles } from "../utils/ipc"
import type { IpcEntry } from "@/interfaces/ipc"

interface Opcion {
  value: number
  label: string
}

function CampoSelect({
  id,
  value,
  onChange,
  opciones,
  placeholder,
  ariaLabel,
  deshabilitadas = [],
}: {
  id: string
  value: number
  onChange: (value: number) => void
  opciones: Opcion[]
  placeholder: string
  ariaLabel: string
  deshabilitadas?: number[]
}) {
  return (
    <div className="relative flex-1">
      <select
        id={id}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        className="h-10 w-full appearance-none rounded-md border border-input bg-white px-3 pr-8 text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value} disabled={deshabilitadas.includes(opcion.value)}>
            {opcion.label}
          </option>
        ))}
      </select>
      <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

interface IngresoProps {
  monto: string
  onMontoChange: (value: string) => void
  mesInicio: number
  anioInicio: number
  mesFin: number
  anioFin: number
  onMesInicioChange: (value: number) => void
  onAnioInicioChange: (value: number) => void
  onMesFinChange: (value: number) => void
  onAnioFinChange: (value: number) => void
  anios: number[]
  ipcData: IpcEntry[]
}

export default function Ingreso({
  monto,
  onMontoChange,
  mesInicio,
  anioInicio,
  mesFin,
  anioFin,
  onMesInicioChange,
  onAnioInicioChange,
  onMesFinChange,
  onAnioFinChange,
  anios,
  ipcData,
}: IngresoProps) {
  const opcionesMeses: Opcion[] = MESES.map((mes, i) => ({ value: i + 1, label: mes }))
  const opcionesAnios: Opcion[] = anios.map((anio) => ({ value: anio, label: String(anio) }))

  const aniosDeshabilitadosInicio = useMemo(
    () => (anioFin ? opcionesAnios.map((o) => o.value).filter((anio) => anio > anioFin) : []),
    [anioFin, opcionesAnios],
  )
  const aniosDeshabilitadosFin = useMemo(
    () => (anioInicio ? opcionesAnios.map((o) => o.value).filter((anio) => anio < anioInicio) : []),
    [anioInicio, opcionesAnios],
  )

  const mesesDeshabilitadosInicio = useMemo(() => {
    const disponibles = anioInicio ? getMesesDisponibles(ipcData, anioInicio) : []
    return opcionesMeses
      .map((o) => o.value)
      .filter((mes) => {
        if (anioInicio && !disponibles.includes(mes)) return true
        if (anioInicio && anioFin && anioInicio === anioFin && mesFin && mes > mesFin) return true
        return false
      })
  }, [ipcData, anioInicio, anioFin, mesFin, opcionesMeses])

  const mesesDeshabilitadosFin = useMemo(() => {
    const disponibles = anioFin ? getMesesDisponibles(ipcData, anioFin) : []
    return opcionesMeses
      .map((o) => o.value)
      .filter((mes) => {
        if (anioFin && !disponibles.includes(mes)) return true
        if (anioInicio && anioFin && anioInicio === anioFin && mesInicio && mes < mesInicio) return true
        return false
      })
  }, [ipcData, anioFin, anioInicio, mesInicio, opcionesMeses])

  // Si el mes ya elegido queda inválido por un cambio posterior (año, u otro
  // mes cuando coinciden los años), "disabled" en el <option> no lo
  // deselecciona solo: hay que limpiarlo para que no quede una fecha inválida.
  useEffect(() => {
    if (mesInicio && mesesDeshabilitadosInicio.includes(mesInicio)) onMesInicioChange(0)
  }, [mesInicio, mesesDeshabilitadosInicio, onMesInicioChange])

  useEffect(() => {
    if (mesFin && mesesDeshabilitadosFin.includes(mesFin)) onMesFinChange(0)
  }, [mesFin, mesesDeshabilitadosFin, onMesFinChange])

  return (
    <form className="flex h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="monto" className="font-semibold text-foreground">
          Ingresar el monto a calcular:
        </label>
        <div className="relative max-w-md">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-foreground/50">$</span>
          <input
            id="monto"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ingresar cantidad"
            value={monto}
            onChange={(e) => onMontoChange(e.target.value)}
            className="h-12 w-full rounded-md border border-input bg-white pr-3 pl-7 text-lg font-semibold text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className=" font-semibold text-foreground">Comienzo:</span>
        <div className="flex max-w-md gap-3">
          <CampoSelect
            id="mesInicio"
            value={mesInicio}
            onChange={onMesInicioChange}
            opciones={opcionesMeses}
            placeholder="Mes"
            ariaLabel="Mes de comienzo"
            deshabilitadas={mesesDeshabilitadosInicio}
          />
          <CampoSelect
            id="anioInicio"
            value={anioInicio}
            onChange={onAnioInicioChange}
            opciones={opcionesAnios}
            placeholder="Año"
            ariaLabel="Año de comienzo"
            deshabilitadas={aniosDeshabilitadosInicio}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className=" font-semibold text-foreground">Final:</span>
        <div className="flex max-w-md gap-3">
          <CampoSelect
            id="mesFin"
            value={mesFin}
            onChange={onMesFinChange}
            opciones={opcionesMeses}
            placeholder="Mes"
            ariaLabel="Mes final"
            deshabilitadas={mesesDeshabilitadosFin}
          />
          <CampoSelect
            id="anioFin"
            value={anioFin}
            onChange={onAnioFinChange}
            opciones={opcionesAnios}
            placeholder="Año"
            ariaLabel="Año final"
            deshabilitadas={aniosDeshabilitadosFin}
          />
        </div>
      </div>
    </form>
  )
}
