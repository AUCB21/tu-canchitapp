import { CourtCard } from './CourtCard'
import type { CanchaConDisponibilidad } from '@/lib/queries/canchas'

interface CourtGridProps {
  canchas: CanchaConDisponibilidad[]
  dateParam: string
}

function gridClass(count: number): string {
  if (count === 1) return 'grid-cols-1'
  if (count <= 2) return 'grid-cols-2'
  if (count <= 4) return 'grid-cols-2'
  return ''
}

export function CourtGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          {/* Pitch skeleton */}
          <div className="animate-shimmer w-full" style={{ aspectRatio: '116 / 61' }} />
          {/* Info strip skeleton */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="h-4 w-14 rounded animate-shimmer" />
            <div className="h-4 w-12 rounded-full animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CourtGrid({ canchas, dateParam }: CourtGridProps) {
  if (canchas.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-muted-foreground">
        {/* Mini pitch SVG */}
        <svg viewBox="0 0 80 50" className="h-12 w-20 opacity-20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="76" height="46" rx="2" />
          <circle cx="40" cy="25" r="8" />
          <line x1="40" y1="2" x2="40" y2="48" />
          <rect x="2" y="15" width="10" height="20" />
          <rect x="68" y="15" width="10" height="20" />
        </svg>
        <p className="text-sm font-medium">Sin canchas configuradas</p>
        <a href="/configuracion/canchas" className="text-xs text-primary underline underline-offset-2">
          Agregar desde Configuración
        </a>
      </div>
    )
  }

  const useAutoFill = canchas.length >= 5

  return (
    <div
      className={`grid gap-4 ${useAutoFill ? '' : gridClass(canchas.length)}`}
      style={useAutoFill ? { gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' } : undefined}
    >
      {canchas.map((cancha, i) => (
        <div key={cancha.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
          <CourtCard cancha={cancha} dateParam={dateParam} />
        </div>
      ))}
    </div>
  )
}
