import { getResumenDiario } from '@/lib/queries/pagos'
import { requireRole } from '@/lib/auth-utils'
import { DateNavigator } from '@/components/DateNavigator'
import { formatARS } from '@/lib/utils'
import { BanknoteIcon, SmartphoneIcon, CalendarIcon, CircleDollarSignIcon } from 'lucide-react'

interface PagosPageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function PagosPage({ searchParams }: PagosPageProps) {
  await requireRole('admin')

  const { date: dateParam } = await searchParams

  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date())

  const selectedDate = dateParam ?? today
  const dateObj = new Date(selectedDate + 'T00:00:00-03:00')

  const resumen = await getResumenDiario(dateObj)

  const displayDate = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Resumen de Pagos</h1>
          <p className="text-sm text-muted-foreground capitalize">{displayDate}</p>
        </div>
        <DateNavigator selectedDate={selectedDate} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total */}
        <div className="col-span-2 rounded-xl border bg-card p-5 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <CircleDollarSignIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total del día</p>
              <p className="text-xl font-bold tabular-nums">{formatARS(resumen.total)}</p>
            </div>
          </div>
        </div>

        {/* Efectivo */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2.5">
              <BanknoteIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Efectivo</p>
              <p className="text-lg font-bold tabular-nums">{formatARS(resumen.efectivo)}</p>
            </div>
          </div>
        </div>

        {/* Transferencia */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5">
              <SmartphoneIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transferencia</p>
              <p className="text-lg font-bold tabular-nums">{formatARS(resumen.transferencia)}</p>
            </div>
          </div>
        </div>

        {/* Reservas */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2.5">
              <CalendarIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reservas</p>
              <p className="text-lg font-bold tabular-nums">{resumen.reservas}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Los pagos se registran desde el detalle de cada reserva en el calendario.
      </p>
    </div>
  )
}
