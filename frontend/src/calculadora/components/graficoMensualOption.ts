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

  const datos = valores.map((valor, indice) => {
    const esExtremo = indice === 0 || indice === ultimoIndice
    // "left"/"right" en vez de "top": así el label queda centrado en la
    // misma altura que el punto, adentro del margen reservado del grid
    // (left/right más abajo), en vez de arriba del punto — que se cortaba
    // cuando el valor quedaba cerca del techo del eje Y (pasaba justo con
    // el último mes cuando era el pico del período).
    const posicion: "left" | "right" = indice === 0 ? "left" : "right"
    return {
      value: valor,
      label: esExtremo
        ? {
            show: true,
            position: posicion,
            align: posicion,
            formatter: () => `${categorias[indice]}\n${valor.toFixed(1)}%`,
            fontSize: 11,
            lineHeight: 14,
            color: COLOR_MUTED,
          }
        : { show: false },
    }
  })

  return {
    grid: { left: 58, right: 58, top: 20, bottom: 20 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
      valueFormatter: (valor: number) => `${valor.toFixed(1)}%`,
      textStyle: { color: "#0b0b0b" },
    },
    xAxis: { type: "category", data: categorias, show: false, boundaryGap: false },
    yAxis: { type: "value", show: false },
    series: [
      {
        type: "line",
        data: datos,
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
