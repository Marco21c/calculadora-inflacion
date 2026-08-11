
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Calculadora from './calculadora/pages/Calculadora'
import CargaDatos from './entry-data/pages/CargaDatos'
import { Toaster } from '@/components/ui/sonner'
import LayoutConSidebar from '@/components/LayoutConSidebar'

function App() {
  return (
    <>
    <Routes>
       <Route path="/" element={<Navigate to="/calculadora" replace />} />

      <Route
        path="/calculadora"
        element={
          <div className="mx-auto my-6 max-w-6xl  py-4">
            <Calculadora />
          </div>
        }
      />

      <Route path="/administrador" element={<LayoutConSidebar />}>
        <Route index element={<Calculadora />} />
        <Route path="ingreso" element={<CargaDatos />} />
      </Route>
    </Routes>
    <Toaster />
    </>
  )
}

export default App
