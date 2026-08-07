export function calcularSiguientePeriodo(
  entradas: { anio: number; mes: number }[],
): { mes: number; anio: number } | null {
  if (entradas.length === 0) return null
  const ultimo = entradas.reduce((max, entrada) =>
    entrada.anio > max.anio || (entrada.anio === max.anio && entrada.mes > max.mes) ? entrada : max,
  )
  return ultimo.mes === 12 ? { mes: 1, anio: ultimo.anio + 1 } : { mes: ultimo.mes + 1, anio: ultimo.anio }
}
