import { useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ConfirmDialog from "@/components/ConfirmDialog"
import { MESES, MESES_ABREVIADOS } from "@/calculadora/utils/ipc"
import {
  calcularInflacionInteranual,
  calcularPromedioAnualIpc,
  calcularVariacionInteranualPromedio,
} from "@/calculadora/utils/calculos"
import type { IpcEntry, IpcEntryEditable } from "@/interfaces/ipc"
import { useEliminarEntradaMutation, useGuardarEntradasMasivoMutation } from "../hooks/ipcEntriesQueries"
import DetalleEntradaIpc from "./DetalleEntradaIpc"
import { calcularSiguientePeriodo } from "../utils/calcularSiguientePeriodo"

interface TablaIpcProps {
  entradas: IpcEntry[]
  soloLectura?: boolean
  alturaMaxima?: number
}

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

function filaVacia(anio: number, mes: number): IpcEntryEditable {
  return {
    anio,
    mes,
    ipc: null,
    inflacionMensual: null,
    inflacionInteranual: null,
    promedioAnualIpc: null,
    variacionInteranualPromedio: null,
  }
}

function formatoOpcional(valor: number | null): string {
  return valor === null ? "-" : String(valor)
}

function filaTieneCamposObligatorios(fila: IpcEntryEditable): boolean {
  return fila.ipc !== null && Number.isFinite(fila.ipc) && fila.inflacionMensual !== null && Number.isFinite(fila.inflacionMensual)
}

function aIpcEntry(fila: IpcEntryEditable): IpcEntry {
  // Solo se llama después de validar con filaTieneCamposObligatorios.
  return {
    ...fila,
    ipc: fila.ipc as number,
    inflacionMensual: fila.inflacionMensual as number,
  }
}

function entradasCompletas(filas: IpcEntryEditable[]): IpcEntry[] {
  return filas.filter((fila): fila is IpcEntry => fila.ipc !== null && fila.inflacionMensual !== null)
}

// Recalcula, para la fila en `indice`, solo lo que quedó afectado por lo que
// se acaba de tocar en esa misma fila: si cambió el ipc, se recalculan su
// inflación interanual y su promedio anual de IPC; si cambió (o quedó
// recalculada) la inflación interanual, se recalcula su variación interanual
// promedio. No toca ninguna otra fila.
function conDerivadosRecalculados(
  filas: IpcEntryEditable[],
  indice: number,
  ipcTocado: boolean,
  interanualTocado: boolean,
): IpcEntryEditable[] {
  if (!ipcTocado && !interanualTocado) return filas

  let fila = filas[indice]
  const anteriores = entradasCompletas(filas.slice(0, indice))

  if (ipcTocado && fila.ipc !== null) {
    fila = {
      ...fila,
      inflacionInteranual: calcularInflacionInteranual(anteriores, fila.anio, fila.mes, fila.ipc),
      promedioAnualIpc: calcularPromedioAnualIpc(anteriores, fila.ipc),
    }
    interanualTocado = true
  }

  if (interanualTocado) {
    fila = {
      ...fila,
      variacionInteranualPromedio: calcularVariacionInteranualPromedio(anteriores, fila.inflacionInteranual),
    }
  }

  const resultado = [...filas]
  resultado[indice] = fila
  return resultado
}

interface EstadoEdicion {
  filas: IpcEntryEditable[]
  historial: IpcEntryEditable[][]
  futuro: IpcEntryEditable[][]
}

type AccionEdicion =
  | { type: "reset"; filas: IpcEntryEditable[] }
  | { type: "aplicar"; actualizador: (prev: IpcEntryEditable[]) => IpcEntryEditable[] }
  | { type: "deshacer" }
  | { type: "rehacer" }

function reducerEdicion(estado: EstadoEdicion, accion: AccionEdicion): EstadoEdicion {
  switch (accion.type) {
    case "reset":
      return { filas: accion.filas, historial: [], futuro: [] }
    case "aplicar":
      return {
        filas: accion.actualizador(estado.filas),
        historial: [...estado.historial, estado.filas],
        futuro: [],
      }
    case "deshacer": {
      if (estado.historial.length === 0) return estado
      return {
        filas: estado.historial[estado.historial.length - 1],
        historial: estado.historial.slice(0, -1),
        futuro: [...estado.futuro, estado.filas],
      }
    }
    case "rehacer": {
      if (estado.futuro.length === 0) return estado
      return {
        filas: estado.futuro[estado.futuro.length - 1],
        futuro: estado.futuro.slice(0, -1),
        historial: [...estado.historial, estado.filas],
      }
    }
  }
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
  const [{ filas, historial, futuro }, dispatch] = useReducer(reducerEdicion, {
    filas: entradas,
    historial: [],
    futuro: [],
  })
  const [periodoAEliminar, setPeriodoAEliminar] = useState<IpcEntryEditable | null>(null)
  const [confirmarGuardado, setConfirmarGuardado] = useState(false)
  const eliminarMutation = useEliminarEntradaMutation()
  const guardarMasivoMutation = useGuardarEntradasMasivoMutation()

  useEffect(() => {
    dispatch({ type: "reset", filas: entradas })
  }, [entradas])

  function aplicarCambio(actualizador: (prev: IpcEntryEditable[]) => IpcEntryEditable[]) {
    dispatch({ type: "aplicar", actualizador })
  }

  function deshacer() {
    dispatch({ type: "deshacer" })
  }

  function rehacer() {
    dispatch({ type: "rehacer" })
  }

  const huboCambios = useMemo(() => JSON.stringify(filas) !== JSON.stringify(entradas), [filas, entradas])

  const entradasPorClave = useMemo(() => {
    const mapa = new Map<string, IpcEntry>()
    entradas.forEach((entrada) => mapa.set(`${entrada.anio}-${entrada.mes}`, entrada))
    return mapa
  }, [entradas])

  const filasModificadas = useMemo(
    () =>
      filas.filter((fila) => {
        const original = entradasPorClave.get(`${fila.anio}-${fila.mes}`)
        return JSON.stringify(fila) !== JSON.stringify(original)
      }),
    [filas, entradasPorClave],
  )

  const ultimaFilaEsNueva = useMemo(() => {
    const ultima = filas[filas.length - 1]
    if (!ultima) return false
    return !entradas.some((entrada) => entrada.anio === ultima.anio && entrada.mes === ultima.mes)
  }, [filas, entradas])

  const campoFueModificado = useCallback(
    (fila: IpcEntryEditable, campo: ColumnaNavegable): boolean => {
      const original = entradasPorClave.get(`${fila.anio}-${fila.mes}`)
      // Fila nueva (todavía no guardada): se resalta cualquier campo ya cargado.
      if (!original) return fila[campo] !== null
      return fila[campo] !== original[campo]
    },
    [entradasPorClave],
  )

  function actualizarCampo(anio: number, mes: number, campo: ColumnaNavegable, valor: string) {
    const numero = valor.trim() === "" ? null : Number(valor)
    if (numero !== null && Number.isNaN(numero)) return
    aplicarCambio((prev) => {
      const indice = prev.findIndex((fila) => fila.anio === anio && fila.mes === mes)
      if (indice === -1) return prev
      const actualizado = prev.map((fila, i) => (i === indice ? { ...fila, [campo]: numero } : fila))
      return conDerivadosRecalculados(actualizado, indice, campo === "ipc", campo === "inflacionInteranual")
    })
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

    aplicarCambio((prev) => {
      let resultado = [...prev]

      for (let indice = filaIndex; indice < resultado.length && indice - filaIndex < filasPegadas.length; indice++) {
        const valoresColumnas = filasPegadas[indice - filaIndex].split("\t")
        let filaActualizada = resultado[indice]
        let ipcTocado = false
        let interanualTocado = false

        valoresColumnas.forEach((valorTexto, offsetColumna) => {
          const columnaActual = COLUMNAS_NAVEGABLES[columnaInicioIndex + offsetColumna]
          if (!columnaActual) return

          const numero = parsearNumeroPegado(valorTexto)
          filaActualizada = { ...filaActualizada, [columnaActual]: numero }
          if (columnaActual === "ipc") ipcTocado = true
          if (columnaActual === "inflacionInteranual") interanualTocado = true
        })

        resultado[indice] = filaActualizada
        resultado = conDerivadosRecalculados(resultado, indice, ipcTocado, interanualTocado)
      }

      return resultado
    })
  }

  function handleAgregarFila() {
    const siguiente = calcularSiguientePeriodo(filas)
    if (!siguiente) {
      toast.error("No se pudo calcular el próximo período.")
      return
    }
    aplicarCambio((prev) => [...prev, filaVacia(siguiente.anio, siguiente.mes)])
  }

  function handleEliminarUltimaFila() {
    if (!ultimaFilaEsNueva) return
    aplicarCambio((prev) => prev.slice(0, -1))
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

  function handleAbrirConfirmacion() {
    const filasInvalidas = filasModificadas.filter((fila) => !filaTieneCamposObligatorios(fila))
    if (filasInvalidas.length > 0) {
      toast.error(
        `Hay ${filasInvalidas.length === 1 ? "un período" : `${filasInvalidas.length} períodos`} con IPC o inflación mensual inválidos. Completá esos campos antes de guardar.`,
      )
      return
    }
    setConfirmarGuardado(true)
  }

  function confirmarGuardarCambios() {
    const porGuardar = filasModificadas.map((fila) => aIpcEntry(fila))
    guardarMasivoMutation.mutate(porGuardar, {
      onSuccess: () => {
        toast.success("Cambios guardados.")
        setConfirmarGuardado(false)
      },
      onError: () => toast.error("No se pudieron guardar los cambios. Intentá nuevamente."),
    })
  }

  const claseInput = useCallback(
    (fila: IpcEntryEditable, campo: ColumnaNavegable): string =>
      campoFueModificado(fila, campo) ? `${inputClassName} bg-amber-100` : inputClassName,
    [campoFueModificado],
  )

  const columnas = useMemo<ColumnDef<IpcEntryEditable>[]>(() => {
    const columnasBase: ColumnDef<IpcEntryEditable>[] = [
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
              value={row.original.ipc ?? ""}
              onChange={(e) => actualizarCampo(row.original.anio, row.original.mes, "ipc", e.target.value)}
              onKeyDown={(e) => handleTeclado(e, row.index, "ipc")}
              onPaste={(e) => handlePegado(e, row.index, "ipc")}
              data-row={row.index}
              data-col="ipc"
              className={claseInput(row.original, "ipc")}
            />
          ),
      },
      {
        id: "inflacionMensual",
        header: "Inflación mensual",
        cell: ({ row }) =>
          soloLectura ? (
            row.original.inflacionMensual
          ) : (
            <input
              type="number"
              step="0.01"
              value={row.original.inflacionMensual ?? ""}
              onChange={(e) =>
                actualizarCampo(row.original.anio, row.original.mes, "inflacionMensual", e.target.value)
              }
              onKeyDown={(e) => handleTeclado(e, row.index, "inflacionMensual")}
              onPaste={(e) => handlePegado(e, row.index, "inflacionMensual")}
              data-row={row.index}
              data-col="inflacionMensual"
              className={claseInput(row.original, "inflacionMensual")}
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
                actualizarCampo(row.original.anio, row.original.mes, "inflacionInteranual", e.target.value)
              }
              onKeyDown={(e) => handleTeclado(e, row.index, "inflacionInteranual")}
              onPaste={(e) => handlePegado(e, row.index, "inflacionInteranual")}
              data-row={row.index}
              data-col="inflacionInteranual"
              className={claseInput(row.original, "inflacionInteranual")}
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
                actualizarCampo(row.original.anio, row.original.mes, "promedioAnualIpc", e.target.value)
              }
              onKeyDown={(e) => handleTeclado(e, row.index, "promedioAnualIpc")}
              onPaste={(e) => handlePegado(e, row.index, "promedioAnualIpc")}
              data-row={row.index}
              data-col="promedioAnualIpc"
              className={claseInput(row.original, "promedioAnualIpc")}
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
                actualizarCampo(
                  row.original.anio,
                  row.original.mes,
                  "variacionInteranualPromedio",
                  e.target.value,
                )
              }
              onKeyDown={(e) => handleTeclado(e, row.index, "variacionInteranualPromedio")}
              onPaste={(e) => handlePegado(e, row.index, "variacionInteranualPromedio")}
              data-row={row.index}
              data-col="variacionInteranualPromedio"
              className={claseInput(row.original, "variacionInteranualPromedio")}
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
  }, [soloLectura, claseInput, entradas])

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
          <Button
            type="button"
            variant="outline"
            onClick={deshacer}
            disabled={historial.length === 0}
            title="Deshacer"
            aria-label="Deshacer"
            className="w-fit"
          >
           Deshacer
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={rehacer}
            disabled={futuro.length === 0}
            title="Rehacer"
            aria-label="Rehacer"
            className="w-fit"
          >
           Rehacer
          </Button>
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
          onClick={handleAbrirConfirmacion}
          disabled={!huboCambios || guardarMasivoMutation.isPending}
          className="w-fit"
        >
          {guardarMasivoMutation.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
        </div>
      )}

      <div className={alturaMaxima ? "overflow-y-auto" : undefined} style={alturaMaxima ? { maxHeight: alturaMaxima } : undefined}>
        <Table>
         <TableHeader className="bg-gray-200/80 text-semibold">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-200">
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
              <TableRow key={row.id} className="border-gray-200">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="border-x border-gray-200/80 text-center">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
