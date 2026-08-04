import { Router } from "express"
import { borrarIpc, cargaMasivaIpc, crearIpc, obtenerIpcs } from "../controller/ipcController.js"

export const ipcEntriesRouter = Router()

ipcEntriesRouter.get("/", obtenerIpcs)
ipcEntriesRouter.post("/", crearIpc)
ipcEntriesRouter.post("/bulk", cargaMasivaIpc)
ipcEntriesRouter.delete("/:anio/:mes", borrarIpc)
