import { ChevronsUpDown } from "lucide-react"
import { MESES } from "../data/ipc"

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
}: {
  id: string
  value: number
  onChange: (value: number) => void
  opciones: Opcion[]
  placeholder: string
  ariaLabel: string
}) {
  return (
    <div className="relative flex-1">
      <select
        id={id}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        className="h-10 w-full appearance-none rounded-md border border-input bg-white px-3 pr-8 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
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
}: IngresoProps) {
  const opcionesMeses: Opcion[] = MESES.map((mes, i) => ({ value: i + 1, label: mes }))
  const opcionesAnios: Opcion[] = anios.map((anio) => ({ value: anio, label: String(anio) }))

  return (
    <form className="flex h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="monto" className="text-sm font-semibold text-foreground">
          Ingresar el monto a calcular:
        </label>
        <input
          id="monto"
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          value={monto}
          onChange={(e) => onMontoChange(e.target.value)}
          className="w-full max-w-md border-0 border-b-2 border-foreground/50 bg-white px-3 py-2 text-lg font-semibold text-foreground outline-none focus-visible:border-ring"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Comienzo:</span>
        <div className="flex max-w-md gap-3">
          <CampoSelect
            id="mesInicio"
            value={mesInicio}
            onChange={onMesInicioChange}
            opciones={opcionesMeses}
            placeholder="Mes"
            ariaLabel="Mes de comienzo"
          />
          <CampoSelect
            id="anioInicio"
            value={anioInicio}
            onChange={onAnioInicioChange}
            opciones={opcionesAnios}
            placeholder="Año"
            ariaLabel="Año de comienzo"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Final:</span>
        <div className="flex max-w-md gap-3">
          <CampoSelect
            id="mesFin"
            value={mesFin}
            onChange={onMesFinChange}
            opciones={opcionesMeses}
            placeholder="Mes"
            ariaLabel="Mes final"
          />
          <CampoSelect
            id="anioFin"
            value={anioFin}
            onChange={onAnioFinChange}
            opciones={opcionesAnios}
            placeholder="Año"
            ariaLabel="Año final"
          />
        </div>
      </div>
    </form>
  )
}
