import { useEffect, useMemo, useState } from "react"
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ConfirmDialog from "@/components/ConfirmDialog"
import { MESES, formatoPorcentaje } from "@/calculadora/utils/ipc"
import type { IpcEntry } from "@/interfaces/ipc"
import { useEliminarEntradaMutation, useGuardarEntradasMasivoMutation } from "../hooks/ipcEntriesQueries"
import DetalleEntradaIpc from "./DetalleEntradaIpc"
import { calcularSiguientePeriodo } from "../utils/calcularSiguientePeriodo"

interface TablaIpcProps {
  entradas: IpcEntry[]
  soloLectura?: boolean
  alturaMaxima?: number
}

const MESES_ABREVIADOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

const inputClassName = "text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

type CampoRequerido = "ipc" | "inflacionMensual"
type CampoOpcional = "inflacionInteranual" | "promedioAnualIpc" | "variacionInteranualPromedio"
type ColumnaNavegable = CampoRequerido | CampoOpcional

const COLUMNAS_NAVEGABLES: ColumnaNavegable[] = [
  "ipc",
  "inflacionMensual",
  "inflacionInteranual",
  "promedioAnualIpc",
  "variacionInteranualPromedio",
]

function filaVacia(anio: number, mes: number): IpcEntry {
  return {
    anio,
    mes,
    ipc: 0,
    inflacionMensual: 0,
    inflacionInteranual: null,
    promedioAnualIpc: null,
    variacionInteranualPromedio: null,
  }
}

function formatoOpcional(valor: number | null): string {
  return valor === null ? "-" : formatoPorcentaje(valor)
}

function parsearNumeroPegado(texto: string): number | null {
  const limpio = texto.trim()
  if (limpio === "") return null
  const normalizado =
    limpio.includes(",") && !limpio.includes(".")
      ? limpio.replace(",", ".")
      : limpio.replace(/\.(?=\d{3}(?:\D|$))/g, "")
  const numero = Number(normalizado)
  return Number.isNaN(numero) ? null : numero
}

export default function TablaIpc({ entradas, soloLectura = false, alturaMaxima }: TablaIpcProps) {
  const [filas, setFilas] = useState<IpcEntry[]>(entradas)
  const [periodoAEliminar, setPeriodoAEliminar] = useState<IpcEntry | null>(null)
  const [confirmarGuardado, setConfirmarGuardado] = useState(false)
  const eliminarMutation = useEliminarEntradaMutation()
  const guardarMasivoMutation = useGuardarEntradasMasivoMutation()

  useEffect(() => {
    setFilas(entradas)
  }, [entradas])

  const huboCambios = useMemo(() => JSON.stringify(filas) !== JSON.stringify(entradas), [filas, entradas])

  const filasModificadas = useMemo(
    () =>
      filas.filter((fila) => {
        const original = entradas.find((entrada) => entrada.anio === fila.anio && entrada.mes === fila.mes)
        return JSON.stringify(fila) !== JSON.stringify(original)
      }),
    [filas, entradas],
  )

  const ultimaFilaEsNueva = useMemo(() => {
    const ultima = filas[filas.length - 1]
    if (!ultima) return false
    return !entradas.some((entrada) => entrada.anio === ultima.anio && entrada.mes === ultima.mes)
  }, [filas, entradas])

  function actualizarCampoRequerido(anio: number, mes: number, campo: CampoRequerido, valor: string) {
    const numero = Number(valor)
    if (Number.isNaN(numero)) return
    setFilas((prev) =>
      prev.map((fila) => (fila.anio === anio && fila.mes === mes ? { ...fila, [campo]: numero } : fila)),
    )
  }

  function actualizarCampoOpcional(anio: number, mes: number, campo: CampoOpcional, valor: string) {
    const numero = valor.trim() === "" ? null : Number(valor)
    if (numero !== null && Number.isNaN(numero)) return
    setFilas((prev) =>
      prev.map((fila) => (fila.anio === anio && fila.mes === mes ? { ...fila, [campo]: numero } : fila)),
    )
  }

  function handlePegado(evento: React.ClipboardEvent, filaIndex: number, columnaId: ColumnaNavegable) {
    const texto = evento.clipboardData.getData("text")
    if (!texto.includes("\t") && !texto.includes("\n")) return // pegado de una sola celda: comportamiento normal

    evento.preventDefault()

    const filasPegadas = texto
      .replace(/\r/g, "")
      .split("\n")
      .filter((linea, indice, arreglo) => !(indice === arreglo.length - 1 && linea === ""))
    const columnaInicioIndex = COLUMNAS_NAVEGABLES.indexOf(columnaId)

    setFilas((prev) =>
      prev.map((fila, indice) => {
        const offsetFila = indice - filaIndex
        if (offsetFila < 0 || offsetFila >= filasPegadas.length) return fila

        const valoresColumnas = filasPegadas[offsetFila].split("\t")
        let filaActualizada = fila

        valoresColumnas.forEach((valorTexto, offsetColumna) => {
          const columnaActual = COLUMNAS_NAVEGABLES[columnaInicioIndex + offsetColumna]
          if (!columnaActual) return

          const numero = parsearNumeroPegado(valorTexto)
          if (columnaActual === "ipc" || columnaActual === "inflacionMensual") {
            if (numero !== null) filaActualizada = { ...filaActualizada, [columnaActual]: numero }
          } else {
            filaActualizada = { ...filaActualizada, [columnaActual]: numero }
          }
        })

        return filaActualizada
      }),
    )
  }

  function handleAgregarFila() {
    const siguiente = calcularSiguientePeriodo(filas)
    if (!siguiente) {
      toast.error("No se pudo calcular el próximo período.")
      return
    }
    setFilas((prev) => [...prev, filaVacia(siguiente.anio, siguiente.mes)])
  }

  function handleEliminarUltimaFila() {
    if (!ultimaFilaEsNueva) return
    setFilas((prev) => prev.slice(0, -1))
  }

  function handleTeclado(evento: React.KeyboardEvent<HTMLInputElement>, filaIndex: number, columnaId: ColumnaNavegable) {
    const esVertical = evento.key === "ArrowUp" || evento.key === "ArrowDown"
    const esHorizontal = evento.key === "ArrowLeft" || evento.key === "ArrowRight"
    if (!esVertical && !esHorizontal) return

    // Las flechas arriba/abajo incrementan o decrementan un <input type="number"> de forma nativa
    // aunque el stepper esté oculto, así que hay que frenarlas siempre para que solo naveguen.
    if (esVertical) evento.preventDefault()

    const colIndex = COLUMNAS_NAVEGABLES.indexOf(columnaId)
    const input = evento.currentTarget

    let destinoFila = filaIndex
    let destinoCol = colIndex
    if (evento.key === "ArrowUp") destinoFila -= 1
    if (evento.key === "ArrowDown") destinoFila += 1
    if (evento.key === "ArrowLeft") destinoCol -= 1
    if (evento.key === "ArrowRight") destinoCol += 1

    if (destinoFila < 0 || destinoCol < 0 || destinoCol >= COLUMNAS_NAVEGABLES.length) return

    const selector = `input[data-row="${destinoFila}"][data-col="${COLUMNAS_NAVEGABLES[destinoCol]}"]`
    const siguienteInput = input.closest("table")?.querySelector<HTMLInputElement>(selector)
    if (!siguienteInput) return

    if (esHorizontal) evento.preventDefault()
    siguienteInput.focus()
    siguienteInput.select()
  }

  function confirmarEliminar() {
    if (!periodoAEliminar) return
    const { anio, mes } = periodoAEliminar
    eliminarMutation.mutate(
      { anio, mes },
      {
        onSuccess: () => {
          toast.success(`Período ${MESES[mes - 1]} ${anio} eliminado.`)
          setPeriodoAEliminar(null)
        },
        onError: () => toast.error("No se pudo eliminar el período. Intentá nuevamente."),
      },
    )
  }

  function confirmarGuardarCambios() {
    guardarMasivoMutation.mutate(filas, {
      onSuccess: () => {
        toast.success("Cambios guardados.")
        setConfirmarGuardado(false)
      },
      onError: () => toast.error("No se pudieron guardar los cambios. Intentá nuevamente."),
    })
  }

  const columnas = useMemo<ColumnDef<IpcEntry>[]>(() => {
    const columnasBase: ColumnDef<IpcEntry>[] = [
      {
        id: "periodo",
        header: "Período",
        cell: ({ row }) => `${MESES_ABREVIADOS[row.original.mes - 1]} ${row.original.anio}`,
      },
      {
        id: "ipc",
        header: "IPC",
        cell: ({ row }) =>
          soloLectura ? (
            row.original.ipc
          ) : (
            <input
              type="number"
              step="0.01"
              value={row.original.ipc}
              onChange={(e) => actualizarCampoRequerido(row.original.anio, row.original.mes, "ipc", e.target.value)}
              onKeyDown={(e) => handleTeclado(e, row.index, "ipc")}
              onPaste={(e) => handlePegado(e, row.index, "ipc")}
              data-row={row.index}
              data-col="ipc"
              className={inputClassName}
            />
          ),
      },
      {
        id: "inflacionMensual",
        header: "Inflación mensual",
        cell: ({ row }) =>
          soloLectura ? (
            formatoPorcentaje(row.original.inflacionMensual)
          ) : (
            <input
              type="number"
              step="0.01"
              value={row.original.inflacionMensual}
              onChange={(e) =>
                actualizarCampoRequerido(row.original.anio, row.original.mes, "inflacionMensual", e.target.value)
              }
              onKeyDown={(e) => handleTeclado(e, row.index, "inflacionMensual")}
              onPaste={(e) => handlePegado(e, row.index, "inflacionMensual")}
              data-row={row.index}
              data-col="inflacionMensual"
              className={inputClassName}
            />
          ),
      },
      {
        id: "inflacionInteranual",
        header: "Inflación interanual (%)",
        cell: ({ row }) =>
          soloLectura ? (
            formatoOpcional(row.original.inflacionInteranual)
          ) : (
            <input
              type="number"
              step="0.01"
              value={row.original.inflacionInteranual ?? ""}
              onChange={(e) =>
                actualizarCampoOpcional(row.original.anio, row.original.mes, "inflacionInteranual", e.target.value)
              }
              onKeyDown={(e) => handleTeclado(e, row.index, "inflacionInteranual")}
              onPaste={(e) => handlePegado(e, row.index, "inflacionInteranual")}
              data-row={row.index}
              data-col="inflacionInteranual"
              className={inputClassName}
            />
          ),
      },
      {
        id: "promedioAnualIpc",
        header: "Promedio anual IPC",
        cell: ({ row }) =>
          soloLectura ? (
            (row.original.promedioAnualIpc ?? "-")
          ) : (
            <input
              type="number"
              step="0.01"
              value={row.original.promedioAnualIpc ?? ""}
              onChange={(e) =>
                actualizarCampoOpcional(row.original.anio, row.original.mes, "promedioAnualIpc", e.target.value)
              }
              onKeyDown={(e) => handleTeclado(e, row.index, "promedioAnualIpc")}
              data-row={row.index}
              data-col="promedioAnualIpc"
              className={inputClassName}
            />
          ),
      },
      {
        id: "variacionInteranualPromedio",
        header: "Variación interanual promedio (%)",
        cell: ({ row }) =>
          soloLectura ? (
            formatoOpcional(row.original.variacionInteranualPromedio)
          ) : (
            <input
              type="number"
              step="0.01"
              value={row.original.variacionInteranualPromedio ?? ""}
              onChange={(e) =>
                actualizarCampoOpcional(
                  row.original.anio,
                  row.original.mes,
                  "variacionInteranualPromedio",
                  e.target.value,
                )
              }
              onKeyDown={(e) => handleTeclado(e, row.index, "variacionInteranualPromedio")}
              data-row={row.index}
              data-col="variacionInteranualPromedio"
              className={inputClassName}
            />
          ),
      },
    ]

    if (soloLectura) return columnasBase

    return [
      ...columnasBase,
      {
        id: "acciones",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setPeriodoAEliminar(row.original)}
            aria-label="Eliminar período"
            title="Eliminar período"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="size-4" />
          </button>
        ),
      },
    ]
  }, [soloLectura])

  const table = useReactTable({
    data: filas,
    columns: columnas,
    getRowId: (fila) => `${fila.anio}-${fila.mes}`,
    getCoreRowModel: getCoreRowModel(),
  })

  if (entradas.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay períodos cargados.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {!soloLectura && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleAgregarFila} className="w-fit">
            Agregar nueva fila
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleEliminarUltimaFila}
            disabled={!ultimaFilaEsNueva}
            className="w-fit"
          >
            Eliminar última fila
          </Button>
          <Button
          type="button"
          onClick={() => setConfirmarGuardado(true)}
          disabled={!huboCambios || guardarMasivoMutation.isPending}
          className="w-fit"
        >
          {guardarMasivoMutation.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
        </div>
      )}

      <div className={alturaMaxima ? "overflow-y-auto" : undefined} style={alturaMaxima ? { maxHeight: alturaMaxima } : undefined}>
        <Table>
         <TableHeader className="bg-gray-300/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="border-x border-gray-200 text-center">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      

      <ConfirmDialog
        open={periodoAEliminar !== null}
        onOpenChange={(open) => !open && setPeriodoAEliminar(null)}
        title="¿Eliminar este período?"
        description={
          periodoAEliminar
            ? `Se va a eliminar ${MESES[periodoAEliminar.mes - 1]} ${periodoAEliminar.anio}. Esta acción no se puede deshacer.`
            : undefined
        }
        detalle={periodoAEliminar && <DetalleEntradaIpc entrada={periodoAEliminar} />}
        confirmLabel="Eliminar"
        variant="destructive"
        loading={eliminarMutation.isPending}
        onConfirm={confirmarEliminar}
      />

      <ConfirmDialog
        open={confirmarGuardado}
        onOpenChange={setConfirmarGuardado}
        title="¿Guardar los cambios?"
        description={`Se van a aplicar las modificaciones en ${filasModificadas.length} período${filasModificadas.length === 1 ? "" : "s"}.`}
        detalle={
          <ul className="list-disc space-y-1 pl-4">
            {filasModificadas.map((fila) => (
              <li key={`${fila.anio}-${fila.mes}`}>
                {MESES[fila.mes - 1]} {fila.anio}
              </li>
            ))}
          </ul>
        }
        confirmLabel="Guardar"
        loading={guardarMasivoMutation.isPending}
        onConfirm={confirmarGuardarCambios}
      />
    </div>
  )
}
