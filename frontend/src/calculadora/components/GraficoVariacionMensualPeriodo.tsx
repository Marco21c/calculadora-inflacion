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
    <div className="mt-6 md:mt-2">
      <ReactEChartsCore echarts={echarts} option={option} style={{ height: 120 }} notMerge />
    </div>
  )
}
