import { Router } from "express"
import { borrarIpc, cargaMasivaIpc, crearIpc, obtenerIpcs } from "../controller/ipcController.js"

export const ipcEntriesRouter = Router()

ipcEntriesRouter.get("/", obtenerIpcs)
ipcEntriesRouter.post("/", crearIpc)
ipcEntriesRouter.put("/bulk", cargaMasivaIpc)
ipcEntriesRouter.delete("/:anio/:mes", borrarIpc)
