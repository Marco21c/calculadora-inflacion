import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Calculadora from './calculadora/pages/Calculadora'
import { Toaster } from '@/components/ui/sonner'

// Build público (VPS): solo la calculadora. No importa nada de entry-data/,
// así ese código nunca llega al bundle que se sirve acá.
function PublicApp() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/calculadora" replace />} />
        <Route
          path="/calculadora"
          element={
            <div className="mx-auto my-6 max-w-6xl py-4">
              <Calculadora />
            </div>
          }
        />
      </Routes>
      <Toaster />
    </>
  )
}

export default PublicApp
