import ReactEChartsCore from "echarts-for-react/esm/core"
import type { EChartsOption } from "echarts-for-react"
import type { VariacionAnual } from "../utils/calculos"
import echarts from "@/lib/echarts-core"

const COLOR_SERIE = "#2ad663"
const COLOR_MUTED = "#898781"
const COLOR_GRID = "#e1e0d9"
const COLOR_BASELINE = "#c3c2b7"
const COLOR_TEXTO = "#52514e"

interface GraficoVariacionAnualProps {
  variacionAnual: VariacionAnual[]
}

export default function GraficoVariacionAnual({ variacionAnual }: GraficoVariacionAnualProps) {
  const categorias = variacionAnual.map((item) => String(item.anio))
  const valores = variacionAnual.map((item) => Number(item.variacion.toFixed(1)))

  const option: EChartsOption = {
    grid: { left: 48, right: 16, top: 16, bottom: 32 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
      valueFormatter: (valor: number) => `${valor.toFixed(1)}%`,
      textStyle: { color: "#0b0b0b" },
    },
    xAxis: {
      type: "category",
      data: categorias,
      axisLine: { lineStyle: { color: COLOR_GRID } },
      axisTick: { show: false },
      axisLabel: { color: COLOR_MUTED, fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: COLOR_MUTED, fontSize: 11, formatter: (valor: number) => `${valor.toFixed(1)}%` },
      splitLine: { lineStyle: { color: COLOR_GRID } },
    },
    series: [
      {
        type: "line",
        data: valores,
        lineStyle: { color: COLOR_SERIE, width: 2 },
        itemStyle: { color: COLOR_SERIE },
        symbol: "circle",
        symbolSize: 8,
        areaStyle: { color: COLOR_SERIE, opacity: 0.1 },
        markLine: {
          symbol: "none",
          silent: true,
          label: { show: false },
          lineStyle: { color: COLOR_BASELINE, width: 1, type: "solid" },
          data: [{ yAxis: 0 }],
        },
      },
    ],
    textStyle: { color: COLOR_TEXTO, fontFamily: "inherit" },
  }

  return (
    <div className="rounded-2xl border border-border bg-white px-6 py-5">
      <h3 className="text-sm font-semibold text-foreground">Evolución de la inflación anual</h3>
      <h3 className="mb-3 text-sm  text-foreground"> San Salvador de Jujuy {variacionAnual[0]?.anio} - {variacionAnual[variacionAnual.length - 1]?.anio}</h3>
      <ReactEChartsCore echarts={echarts} option={option} style={{ height: 320 }} notMerge />
    </div>
  )
}
