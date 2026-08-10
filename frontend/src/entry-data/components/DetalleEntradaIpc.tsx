import type { IpcEntryEditable } from "@/interfaces/ipc"

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-muted-foreground">{etiqueta}</span>
      <span className="font-medium text-foreground">{valor}</span>
    </div>
  )
}

export default function DetalleEntradaIpc({ entrada }: { entrada: IpcEntryEditable }) {
  return (
    <div className="divide-y divide-border rounded-md border border-border px-3">
      <Fila etiqueta="IPC" valor={entrada.ipc === null ? "-" : String(entrada.ipc)} />
      <Fila etiqueta="Inflación mensual" valor={entrada.inflacionMensual === null ? "-" : String(entrada.inflacionMensual)} />
      <Fila
        etiqueta="Inflación interanual"
        valor={entrada.inflacionInteranual === null ? "-" : String(entrada.inflacionInteranual)}
      />
      <Fila
        etiqueta="Promedio anual IPC"
        valor={entrada.promedioAnualIpc === null ? "-" : String(entrada.promedioAnualIpc)}
      />
      <Fila
        etiqueta="Variación interanual promedio"
        valor={entrada.variacionInteranualPromedio === null ? "-" : String(entrada.variacionInteranualPromedio)}
      />
    </div>
  )
}
