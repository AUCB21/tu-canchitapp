import { Badge } from '@/components/ui/badge'
import type { CanchaConDisponibilidad } from '@/lib/queries/canchas'
import Link from 'next/link'

const DISPONIBILIDAD_STYLES: Record<
  CanchaConDisponibilidad['disponibilidad'],
  { dot: string; label: string }
> = {
  libre: { dot: 'bg-green-500', label: 'Libre' },
  parcial: { dot: 'bg-yellow-400', label: 'Parcial' },
  llena: { dot: 'bg-red-500', label: 'Llena' },
}

const TIPO_LABEL: Record<string, string> = {
  futbol5: 'Fútbol 5',
  futbol7: 'Fútbol 7',
}

interface CourtCardProps {
  cancha: CanchaConDisponibilidad
  dateParam: string // ISO date string for URL param
}

export function CourtCard({ cancha, dateParam }: CourtCardProps) {
  const { dot, label } = DISPONIBILIDAD_STYLES[cancha.disponibilidad]

  return (
    <Link
      href={`/reservas?canchaId=${cancha.id}&date=${dateParam}`}
      aria-label={`${cancha.nombre} — ${TIPO_LABEL[cancha.tipo]} — ${label}`}
      className="flex min-h-[120px] min-w-[44px] flex-col justify-between rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-base font-semibold leading-tight">{cancha.nombre}</span>
        <Badge variant="secondary" className="shrink-0 text-xs">
          {TIPO_LABEL[cancha.tipo]}
        </Badge>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <span className={`h-3 w-3 rounded-full ${dot}`} aria-hidden="true" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </Link>
  )
}
