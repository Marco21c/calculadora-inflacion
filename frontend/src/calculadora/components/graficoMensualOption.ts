import type { EChartsOption } from "echarts-for-react"
import type { IpcEntry } from "@/interfaces/ipc"
import { MESES_ABREVIADOS } from "../utils/ipc"

const COLOR_SERIE = "#2a78d6"
const COLOR_MUTED = "#898781"
const COLOR_GRID = "#e1e0d9"
const COLOR_BASELINE = "#c3c2b7"

export function construirOptionVariacionMensual(entradas: IpcEntry[]): EChartsOption {
  const categorias = entradas.map((entrada) => `${MESES_ABREVIADOS[entrada.mes - 1]} ${entrada.anio}`)
  const valores = entradas.map((entrada) => Number((entrada.inflacionMensual * 100).toFixed(1)))

  return {
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
    textStyle: { color: "#52514e", fontFamily: "inherit" },
  }
}

// Sparkline: sin ejes ni grilla visibles, con el mismo hover (tooltip +
// crosshair) que el gráfico grande — así se puede ver el valor de cualquier
// mes sin amontonar labels fijos cuando el período es largo. Los únicos
// labels fijos son los de los extremos (primer y último mes del período).
export function construirOptionSparklineMensual(entradas: IpcEntry[]): EChartsOption {
  const categorias = entradas.map((entrada) => `${MESES_ABREVIADOS[entrada.mes - 1]} ${entrada.anio}`)
  const valores = entradas.map((entrada) => Number((entrada.inflacionMensual * 100).toFixed(1)))
  const ultimoIndice = valores.length - 1

  // Texto de los extremos como "graphic" con posición fija en píxeles
  // (esquinas del contenedor), en vez de label pegado al punto: si el
  // label sigue la altura del dato, con rangos grandes (más variación de
  // valores) el extremo puede terminar muy cerca del techo o el piso del
  // eje Y y el label se corta contra el borde del gráfico. Fijo siempre
  // se ve, sin importar dónde caiga el punto verticalmente.
  const textoPrimero = `${categorias[0]}\n${valores[0].toFixed(1)}%`
  const textoUltimo = `${categorias[ultimoIndice]}\n${valores[ultimoIndice].toFixed(1)}%`

  return {
    grid: { left: 12, right: 12, top: 24, bottom: 4 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
      valueFormatter: (valor: number) => `${valor.toFixed(1)}%`,
      textStyle: { color: "#0b0b0b" },
    },
    xAxis: { type: "category", data: categorias, show: false, boundaryGap: false },
    yAxis: { type: "value", show: false },
    graphic: {
      elements: [
        {
          type: "text",
          left: 4,
          top: 2,
          style: { text: textoPrimero, fontSize: 11, lineHeight: 14, fill: COLOR_MUTED, align: "left" },
        },
        {
          type: "text",
          right: 4,
          top: 2,
          style: { text: textoUltimo, fontSize: 11, lineHeight: 14, fill: COLOR_MUTED, align: "right" },
        },
      ],
    },
    series: [
      {
        type: "line",
        data: valores,
        lineStyle: { color: COLOR_SERIE, width: 2 },
        itemStyle: { color: COLOR_SERIE },
        symbol: "circle",
        symbolSize: (_valor: unknown, params: { dataIndex: number }) =>
          params.dataIndex === 0 || params.dataIndex === ultimoIndice ? 6 : 0,
        areaStyle: { color: COLOR_SERIE, opacity: 0.1 },
      },
    ],
  }
}
