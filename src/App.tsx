
import './App.css'
import Calculadora from './calculadora/pages/Calculadora'
import { Toaster } from '@/components/ui/sonner'
function App() {
  return (
    <>
    <div className="flex flex-col min-h-screen  my-5 mx-80 px-20 py-4 ">

       <Calculadora />
    </div>
    <Toaster />
    </>
  )
}

export default App
