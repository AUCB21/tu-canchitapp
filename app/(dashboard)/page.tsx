import { getCanchasConDisponibilidad } from '@/lib/queries/canchas'
import { getDashboardStats } from '@/lib/queries/dashboard'
import { CourtGrid } from '@/components/court-selector/CourtGrid'
import { DateNavigator } from '@/components/DateNavigator'
import { StatCard } from '@/components/StatCard'
import { formatARS } from '@/lib/utils'

interface HomePageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { date: dateParam } = await searchParams

  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date())

  const selectedDate = dateParam ?? today
  const dateObj = new Date(selectedDate + 'T00:00:00-03:00')

  const [canchas, stats] = await Promise.all([
    getCanchasConDisponibilidad(dateObj),
    getDashboardStats(dateObj),
  ])

  function formatMinutes(min: number | null): string {
    if (min === null) return '—'
    if (min < 60) return `${min} min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Canchas</h1>
        <DateNavigator selectedDate={selectedDate} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Reservas hoy"
          value={String(stats.totalReservas)}
        />
        <StatCard
          label="Ingresos del día"
          value={formatARS(stats.ingresosDia)}
          accent="text-emerald-400"
        />
        <StatCard
          label="Canchas en juego"
          value={String(stats.canchasOcupadas)}
          accent={stats.canchasOcupadas > 0 ? 'text-amber-400' : undefined}
        />
        <StatCard
          label="Próxima reserva"
          value={formatMinutes(stats.minutosProxima)}
          sub={stats.minutosProxima !== null ? 'hasta el próximo turno' : 'sin turnos restantes'}
        />
      </div>

      <CourtGrid canchas={canchas} dateParam={selectedDate} />
    </div>
  )
}
