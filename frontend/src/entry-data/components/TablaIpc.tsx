import { useEffect, useMemo, useState } from "react"
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MESES, formatoPorcentaje } from "@/calculadora/data/ipc"
import type { IpcEntry } from "@/interfaces/ipc"
import { useEliminarEntradaMutation, useGuardarEntradasMasivoMutation } from "../hooks/ipcEntriesQueries"

interface TablaIpcProps {
  entradas: IpcEntry[]
  soloLectura?: boolean
  alturaMaxima?: number
}

const MESES_ABREVIADOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

const inputClassName =
  "text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

type CampoRequerido = "ipc" | "inflacionMensual"
type CampoOpcional = "inflacionInteranual" | "promedioAnualIpc" | "variacionInteranualPromedio"

function formatoOpcional(valor: number | null): string {
  return valor === null ? "-" : formatoPorcentaje(valor)
}

export default function TablaIpc({ entradas, soloLectura = false, alturaMaxima }: TablaIpcProps) {
  const [filas, setFilas] = useState<IpcEntry[]>(entradas)
  const eliminarMutation = useEliminarEntradaMutation()
  const guardarMasivoMutation = useGuardarEntradasMasivoMutation()

  useEffect(() => {
    setFilas(entradas)
  }, [entradas])

  const huboCambios = useMemo(() => JSON.stringify(filas) !== JSON.stringify(entradas), [filas, entradas])

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

  function handleEliminar(anio: number, mes: number) {
    eliminarMutation.mutate(
      { anio, mes },
      {
        onSuccess: () => toast.success(`Período ${MESES[mes - 1]} ${anio} eliminado.`),
        onError: () => toast.error("No se pudo eliminar el período. Intentá nuevamente."),
      },
    )
  }

  function handleGuardarCambios() {
    guardarMasivoMutation.mutate(filas, {
      onSuccess: () => toast.success("Cambios guardados."),
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
              className={inputClassName}
            />
          ),
      },
      {
        id: "inflacionMensual",
        header: "Inflación mensual (%)",
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
            onClick={() => handleEliminar(row.original.anio, row.original.mes)}
            aria-label="Eliminar período"
            title="Eliminar período"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="size-4" />
          </button>
        ),
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {!soloLectura && (
        <Button
          type="button"
          onClick={handleGuardarCambios}
          disabled={!huboCambios || guardarMasivoMutation.isPending}
          className="w-fit"
        >
          {guardarMasivoMutation.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      )}
    </div>
  )
}
