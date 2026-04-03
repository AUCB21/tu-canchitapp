import { CourtCard } from './CourtCard'
import type { CanchaConDisponibilidad } from '@/lib/queries/canchas'

interface CourtGridProps {
  canchas: CanchaConDisponibilidad[]
  dateParam: string
}

function gridClass(count: number): string {
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  if (count <= 4) return 'grid-cols-2'
  // 5+ courts: auto-fill with min 160px, handled via inline style
  return ''
}

export function CourtGrid({ canchas, dateParam }: CourtGridProps) {
  if (canchas.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        No hay canchas configuradas. El administrador debe agregar canchas desde{' '}
        <a href="/configuracion/canchas" className="underline">
          Configuración
        </a>
        .
      </p>
    )
  }

  const useAutoFill = canchas.length >= 5

  return (
    <div
      className={`grid gap-4 ${useAutoFill ? '' : gridClass(canchas.length)}`}
      style={
        useAutoFill
          ? { gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }
          : undefined
      }
    >
      {canchas.map((cancha) => (
        <CourtCard key={cancha.id} cancha={cancha} dateParam={dateParam} />
      ))}
    </div>
  )
}
