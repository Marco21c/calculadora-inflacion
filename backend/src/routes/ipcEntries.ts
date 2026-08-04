import { Router } from "express"
import { borrarEntrada, crearEntrada, obtenerEntradas } from "../controller/ipcController.js"

export const ipcEntriesRouter = Router()

ipcEntriesRouter.get("/", obtenerEntradas)
ipcEntriesRouter.post("/", crearEntrada)
ipcEntriesRouter.delete("/:anio/:mes", borrarEntrada)
