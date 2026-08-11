import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Calculadora from './calculadora/pages/Calculadora'
import CargaDatos from './entry-data/pages/CargaDatos'
import { Toaster } from '@/components/ui/sonner'
import LayoutConSidebar from '@/components/LayoutConSidebar'

// Build admin (Vercel): calculadora + carga de datos, con el sidebar.
function AdminApp() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/administrador" replace />} />

        <Route path="/administrador" element={<LayoutConSidebar />}>
          <Route index element={<Calculadora />} />
          <Route path="ingreso" element={<CargaDatos />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default AdminApp
