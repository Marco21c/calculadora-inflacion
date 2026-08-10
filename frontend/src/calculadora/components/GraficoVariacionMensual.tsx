import ReactEChartsCore from "echarts-for-react/esm/core"
import type { IpcEntry } from "@/interfaces/ipc"
import echarts from "@/lib/echarts-core"
import { MESES_ABREVIADOS } from "../utils/ipc"
import { construirOptionVariacionMensual } from "./graficoMensualOption"

interface GraficoVariacionMensualProps {
  entradas: IpcEntry[]
}

export default function GraficoVariacionMensual({ entradas }: GraficoVariacionMensualProps) {
  const option = construirOptionVariacionMensual(entradas)

  return (
    <div className="rounded-2xl border border-border bg-white px-6 py-5">
      <h3 className="text-sm font-semibold text-foreground">IPC - Variaciones mensuales</h3>
      <h3 className="mb-3 text-sm text-foreground">
        San Salvador de Jujuy {MESES_ABREVIADOS[entradas[0]?.mes - 1]} {entradas[0]?.anio} -{" "}
        {MESES_ABREVIADOS[entradas[entradas.length - 1]?.mes - 1]} {entradas[entradas.length - 1]?.anio}
      </h3>
      <ReactEChartsCore echarts={echarts} option={option} style={{ height: 320 }} notMerge />
    </div>
  )
}
