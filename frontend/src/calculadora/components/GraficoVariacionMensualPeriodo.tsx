import ReactEChartsCore from "echarts-for-react/esm/core"
import type { IpcEntry } from "@/interfaces/ipc"
import echarts from "@/lib/echarts-core"
import { construirOptionSparklineMensual } from "./graficoMensualOption"

interface GraficoVariacionMensualPeriodoProps {
  entradas: IpcEntry[]
}

export default function GraficoVariacionMensualPeriodo({ entradas }: GraficoVariacionMensualPeriodoProps) {
  if (entradas.length === 0) return null

  const option = construirOptionSparklineMensual(entradas)

  return (
    <div className="rounded-2xl border border-border ">
      <ReactEChartsCore echarts={echarts} option={option} style={{ height: 130 }} notMerge />
    </div>
  )
}
