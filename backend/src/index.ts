import express from "express"
import cors from "cors"
import { ipcEntriesRouter } from "./routes/ipcEntries.js"

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN ?? "http://localhost:5173"

const app = express()

app.use(cors({ 
  origin: FRONTEND_ORIGIN 
}))

app.use(express.json())

app.use("/api/ipc-entries", ipcEntriesRouter)

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Backend escuchando en http://localhost:${PORT}`)
  })
}

export default app