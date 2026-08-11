import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-6xl font-bold text-blue-900/80">404</h1>
      <p className="text-lg text-muted-foreground">La página que buscás no existe.</p>
      <Link
        to="/"
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
