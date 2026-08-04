import { useEffect, useMemo, useState } from "react"
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MESES } from "@/calculadora/data/ipc"
import type { IpcEntry } from "@/interfaces/ipc"
import { eliminarEntrada, guardarEntradasMasivo } from "../data/ipcAdmin"

interface TablaIpcProps {
  entradas: IpcEntry[]
  onActualizado: () => void
}

const inputClassName =
  "h-8 w-24 rounded-md border border-input bg-white px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type CampoRequerido = "ipc" | "inflacionMensual"
type CampoOpcional = "inflacionInteranual" | "promedioAnualIpc" | "variacionInteranualPromedio"

export default function TablaIpc({ entradas, onActualizado }: TablaIpcProps) {
  const [filas, setFilas] = useState<IpcEntry[]>(entradas)
  const [guardando, setGuardando] = useState(false)

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

  async function handleEliminar(anio: number, mes: number) {
    try {
      await eliminarEntrada(anio, mes)
      toast.success(`Período ${MESES[mes - 1]} ${anio} eliminado.`)
      onActualizado()
    } catch {
      toast.error("No se pudo eliminar el período. Intentá nuevamente.")
    }
  }

  async function handleGuardarCambios() {
    setGuardando(true)
    try {
      await guardarEntradasMasivo(filas)
      toast.success("Cambios guardados.")
      onActualizado()
    } catch {
      toast.error("No se pudieron guardar los cambios. Intentá nuevamente.")
    } finally {
      setGuardando(false)
    }
  }

  const columnas = useMemo<ColumnDef<IpcEntry>[]>(
    () => [
      {
        id: "periodo",
        header: "Período",
        cell: ({ row }) => `${MESES[row.original.mes - 1]} ${row.original.anio}`,
      },
      {
        id: "ipc",
        header: "IPC",
        cell: ({ row }) => (
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
        cell: ({ row }) => (
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
        cell: ({ row }) => (
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
        cell: ({ row }) => (
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
        cell: ({ row }) => (
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
      {
        id: "acciones",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => handleEliminar(row.original.anio, row.original.mes)}
            className="text-sm text-red-600 hover:underline"
          >
            Eliminar
          </button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

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
      <Table>
        <TableHeader>
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
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button type="button" onClick={handleGuardarCambios} disabled={!huboCambios || guardando} className="w-fit">
        {guardando ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  )
}
