
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Calculadora from './calculadora/pages/Calculadora'
import CargaDatos from './entry-data/pages/CargaDatos'
import { Toaster } from '@/components/ui/sonner'
import LayoutConSidebar from '@/components/LayoutConSidebar'

function App() {
  return (
    <>
    <Routes>
      <Route
        path="/"
        element={
          <div className="mx-auto my-6 max-w-6xl  py-4">
            <Calculadora />
          </div>
        }
      />

      <Route path="/admin" element={<LayoutConSidebar />}>
        <Route index element={<Calculadora />} />
        <Route path="ingreso" element={<CargaDatos />} />
      </Route>
    </Routes>
    <Toaster />
    </>
  )
}

export default App
