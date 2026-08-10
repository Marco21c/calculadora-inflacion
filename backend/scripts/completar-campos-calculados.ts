import { prisma } from "../src/db/prisma.js"
import type { IpcEntry } from "../src/interfaces/ipc.js"

const APLICAR = process.argv.includes("--aplicar")

function calcularInflacionInteranual(entradas: IpcEntry[], anio: number, mes: number, ipcActual: number): number | null {
  const anterior = entradas.find((e) => e.anio === anio - 1 && e.mes === mes)
  if (!anterior) return null
  return (ipcActual / anterior.ipc - 1) * 100
}

function calcularPromedioAnualIpc(ultimos11: IpcEntry[], ipcActual: number): number {
  const valores = [...ultimos11.map((e) => e.ipc), ipcActual]
  return valores.reduce((s, v) => s + v, 0) / valores.length
}

function calcularVariacionInteranualPromedio(ultimos11: IpcEntry[], interanualActual: number | null): number | null {
  const valores = [...ultimos11.map((e) => e.inflacionInteranual), interanualActual].filter(
    (v): v is number => v !== null,
  )
  if (valores.length === 0) return null
  return valores.reduce((s, v) => s + v, 0) / valores.length
}

async function main() {
  const entradas: IpcEntry[] = await prisma.ipcEntry.findMany({ orderBy: [{ anio: "asc" }, { mes: "asc" }] })

  // Paso 1: completar inflacionInteranual faltante (no depende de otros campos calculados).
  const interanualCorregida = new Map<string, number>()
  for (const entrada of entradas) {
    if (entrada.inflacionInteranual !== null) continue
    const valor = calcularInflacionInteranual(entradas, entrada.anio, entrada.mes, entrada.ipc)
    if (valor !== null) interanualCorregida.set(`${entrada.anio}-${entrada.mes}`, valor)
  }

  const cambios: {
    anio: number
    mes: number
    campo: string
    anterior: number | null
    nuevo: number
  }[] = []

  for (let i = 0; i < entradas.length; i++) {
    const entrada = entradas[i]
    const clave = `${entrada.anio}-${entrada.mes}`
    const interanualEfectiva = interanualCorregida.get(clave) ?? entrada.inflacionInteranual

    if (interanualCorregida.has(clave)) {
      cambios.push({
        anio: entrada.anio,
        mes: entrada.mes,
        campo: "inflacionInteranual",
        anterior: entrada.inflacionInteranual,
        nuevo: interanualCorregida.get(clave) as number,
      })
    }

    const ultimos11 = entradas.slice(Math.max(0, i - 11), i)

    // promedioAnualIpc: completar si falta, o corregir si quedó inconsistente
    // con el ipc ya corregido (factor > 100x = resabio del bug de escala).
    const promedioInconsistente =
      entrada.promedioAnualIpc !== null && Math.abs(entrada.promedioAnualIpc / entrada.ipc) > 100
    if (entrada.promedioAnualIpc === null || promedioInconsistente) {
      const nuevo = calcularPromedioAnualIpc(ultimos11, entrada.ipc)
      cambios.push({
        anio: entrada.anio,
        mes: entrada.mes,
        campo: "promedioAnualIpc",
        anterior: entrada.promedioAnualIpc,
        nuevo,
      })
    }

    // variacionInteranualPromedio: completar si falta.
    if (entrada.variacionInteranualPromedio === null) {
      const nuevo = calcularVariacionInteranualPromedio(ultimos11, interanualEfectiva)
      if (nuevo !== null) {
        cambios.push({
          anio: entrada.anio,
          mes: entrada.mes,
          campo: "variacionInteranualPromedio",
          anterior: null,
          nuevo,
        })
      }
    }
  }

  console.log(`Total de cambios: ${cambios.length}`)
  const porCampo = new Map<string, number>()
  for (const c of cambios) porCampo.set(c.campo, (porCampo.get(c.campo) ?? 0) + 1)
  console.log("Por campo:", Object.fromEntries(porCampo))
  console.log()
  console.log("Primeros 10:")
  cambios.slice(0, 10).forEach((c) =>
    console.log(`${c.anio}-${c.mes} ${c.campo}: ${c.anterior} -> ${c.nuevo.toFixed(2)}`),
  )
  console.log("...")
  console.log("Últimos 10:")
  cambios.slice(-10).forEach((c) =>
    console.log(`${c.anio}-${c.mes} ${c.campo}: ${c.anterior} -> ${c.nuevo.toFixed(2)}`),
  )

  if (!APLICAR) {
    console.log("\n(dry run — no se escribió nada. Correr con --aplicar para guardar los cambios)")
    return
  }

  // Agrupar por período para hacer un solo update por fila.
  const porPeriodo = new Map<string, { anio: number; mes: number; datos: Record<string, number> }>()
  for (const c of cambios) {
    const clave = `${c.anio}-${c.mes}`
    if (!porPeriodo.has(clave)) porPeriodo.set(clave, { anio: c.anio, mes: c.mes, datos: {} })
    porPeriodo.get(clave)!.datos[c.campo] = c.nuevo
  }

  await prisma.$transaction(
    Array.from(porPeriodo.values()).map(({ anio, mes, datos }) =>
      prisma.ipcEntry.update({ where: { anio_mes: { anio, mes } }, data: datos }),
    ),
    { timeout: 30000 },
  )
  console.log(`\nAplicado: ${porPeriodo.size} períodos actualizados.`)
}

main().finally(() => prisma.$disconnect())
