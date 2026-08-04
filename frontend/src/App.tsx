
import { useState } from 'react'
import './App.css'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Calculator, ChevronLeft, ChevronRight, Database } from 'lucide-react'
import Calculadora from './calculadora/pages/Calculadora'
import CargaDatos from './entry-data/pages/CargaDatos'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const enlaces = [
  { to: '/', label: 'Vista calculadora', exacto: true, Icono: Calculator },
  { to: '/admin', label: 'Ingreso de datos', exacto: false, Icono: Database },
]

function App() {
  const [colapsado, setColapsado] = useState(false)

  return (
    <>
    <div className="flex min-h-screen">
      <aside
        className={cn(
          'flex shrink-0 flex-col gap-1 border-r border-border bg-white py-6 transition-all',
          colapsado ? 'w-20 px-2' : 'w-72 px-4',
        )}
      >
        <div className={cn('mb-3 flex items-center', colapsado ? 'justify-center' : 'justify-between px-3')}>
          {!colapsado && (
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Menú</h2>
          )}
          <button
            type="button"
            onClick={() => setColapsado((valor) => !valor)}
            aria-label={colapsado ? 'Expandir menú' : 'Colapsar menú'}
            title={colapsado ? 'Expandir menú' : 'Colapsar menú'}
            className="rounded-lg p-1.5 text-foreground/60 hover:bg-muted hover:text-foreground"
          >
            {colapsado ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {enlaces.map((enlace) => (
          <NavLink
            key={enlace.to}
            to={enlace.to}
            end={enlace.exacto}
            title={enlace.label}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground',
                colapsado && 'justify-center px-0',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
              )
            }
          >
            <enlace.Icono className="size-4 shrink-0" />
            {!colapsado && <span>{enlace.label}</span>}
          </NavLink>
        ))}
      </aside>

      <div className="flex-1 my-5 px-20 py-4">
        <Routes>
          <Route path="/" element={<Calculadora />} />
          <Route path="/admin" element={<CargaDatos />} />
        </Routes>
      </div>
    </div>
    <Toaster />
    </>
  )
}

export default App
