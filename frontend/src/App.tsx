
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Calculadora from './calculadora/pages/Calculadora'
import CargaDatos from './entry-data/pages/CargaDatos'
import { Toaster } from '@/components/ui/sonner'
function App() {
  return (
    <>
    <div className="flex flex-col min-h-screen  my-5 mx-80 px-20 py-4 ">
      <Routes>
        <Route path="/" element={<Calculadora />} />
        <Route path="/admin" element={<CargaDatos />} />
      </Routes>
    </div>
    <Toaster />
    </>
  )
}

export default App
