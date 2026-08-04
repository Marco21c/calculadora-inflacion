import axios from "axios";
import type { IpcEntry } from "@/interfaces/ipc";

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const MESES_ABREVIADOS: Record<string, number> = {
  ene: 1,
  feb: 2,
  mar: 3,
  abr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  sept: 9,
  oct: 10,
  nov: 11,
  dic: 12,
}

const IPC_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSd3mpW-EyxI96kLL_T6Ao-RvQLHXtpD96S9Jvtpz1FKXvkEm_e-qR1qn-vXrRWWzsNetmFZHoxstYY/pub?output=csv"



function splitCsvLine(line: string): string[] {
  const valores: string[] = []
  let actual = ""
  let entreComillas = false
  for (const char of line) {
    if (char === '"') {
      entreComillas = !entreComillas
    } else if (char === "," && !entreComillas) {
      valores.push(actual.trim())
      actual = ""
    } else {
      actual += char
    }
  }
  valores.push(actual.trim())
  return valores
}

function parseCsv(csv: string): Record<string, string>[] {
  const lineas = csv.split("\n").filter((linea) => linea.trim().length > 0)
  if (lineas.length === 0) return []
  const encabezados = splitCsvLine(lineas[0])
  return lineas.slice(1).map((linea) => {
    const valores = splitCsvLine(linea)
    const fila: Record<string, string> = {}
    encabezados.forEach((encabezado, i) => {
      fila[encabezado] = valores[i] ?? ""
    })
    return fila
  })
}

function parsearNumero(valor: string | undefined): number | null {
  if (!valor) return null
  const normalizado = valor.replace(/\./g, "").replace(",", ".")
  const numero = Number(normalizado)
  return Number.isNaN(numero) ? null : numero
}

function parsearFecha(fecha: string | undefined): { anio: number; mes: number } | null {
  if (!fecha) return null
  const [mesAbreviado, anioAbreviado] = fecha.split("-")
  const mes = MESES_ABREVIADOS[mesAbreviado?.toLowerCase().trim() ?? ""]
  if (!mes || !anioAbreviado) return null
  return { anio: 2000 + parseInt(anioAbreviado, 10), mes }
}

export async function fetchIpcData(): Promise<IpcEntry[]> {
  const { data: csv } = await axios.get<string>(IPC_CSV_URL, { responseType: "text" })
  const filas = parseCsv(csv)

  const entradas: IpcEntry[] = []
  for (const fila of filas) {
    const fecha = parsearFecha(fila["Fecha"])
    const variacionMensual = parsearNumero(fila["Auxiliar"])
    if (!fecha || variacionMensual === null) continue
    entradas.push({
      anio: fecha.anio,
      mes: fecha.mes,
      variacionMensual,
      inflacionInteranual: parsearNumero(fila["Inflación interanual"]),
    })
  }
  entradas.sort((a, b) => a.anio - b.anio || a.mes - b.mes)
  return entradas
}

export function getAniosDisponibles(ipcData: IpcEntry[]): number[] {
  const anios = new Set(ipcData.map((entrada) => entrada.anio))
  return Array.from(anios).sort((a, b) => a - b)
}

export function getMesesDisponibles(ipcData: IpcEntry[], anio: number): number[] {
  return ipcData.filter((entrada) => entrada.anio === anio).map((entrada) => entrada.mes)
}

export function formatoMoneda(valor: number): string {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatoPorcentaje(valor: number): string {
  return `${valor.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`
}
