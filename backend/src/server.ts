import app from "./index.js"

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`)
})
