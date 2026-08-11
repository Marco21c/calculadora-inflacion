import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Calculator, ChevronLeft, ChevronRight, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

const enlaces = [
  { to: '/administrador', label: 'Vista calculadora', exacto: true, Icono: Calculator },
  { to: '/administrador/ingreso', label: 'Ingreso de datos', exacto: false, Icono: Database },
]

export default function Sidebar() {
  const [colapsado, setColapsado] = useState(false)

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col gap-1 border-r border-border bg-white py-6 transition-all',
        colapsado ? 'w-20 px-2' : 'w-72 px-4',
      )}
    >
      <div className={cn('mb-3 flex items-center', colapsado ? 'justify-center' : 'justify-between px-3')}>
        {!colapsado && (
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Menú</h2>
        )}
        <button
          type="button"
          onClick={() => setColapsado((valor) => !valor)}
          aria-label={colapsado ? 'Expandir menú' : 'Colapsar menú'}
          title={colapsado ? 'Expandir menú' : 'Colapsar menú'}
          className="rounded-lg p-1.5 text-foreground/60 hover:bg-muted hover:text-foreground"
        >
          {colapsado ? <ChevronRight className="size-5 cursor-pointer" /> : <ChevronLeft className="size-5 cursor-pointer" />}
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
              'flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground',
              colapsado && 'justify-center px-0',
              isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
            )
          }
        >
          <enlace.Icono className="size-5 shrink-0" />
          {!colapsado && <span>{enlace.label}</span>}
        </NavLink>
      ))}
    </aside>
  )
}
