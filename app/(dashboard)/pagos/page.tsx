import { getResumenDiario, getReservasDelDia } from '@/lib/queries/pagos'
import { requireRole } from '@/lib/auth-utils'
import { DateNavigator } from '@/components/DateNavigator'
import { PaymentForm } from '@/components/forms/PaymentForm'
import { formatARS, toArgTime } from '@/lib/utils'
import { BanknoteIcon, SmartphoneIcon, CalendarIcon, CircleDollarSignIcon, StarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PagosPageProps {
  searchParams: Promise<{ date?: string }>
}

const ESTADO_STYLES = {
  confirmada: 'bg-emerald-100 text-emerald-700',
  pendiente_pago: 'bg-amber-100 text-amber-700',
  cancelada: 'bg-red-100 text-red-700',
}
const ESTADO_LABEL = {
  confirmada: 'Confirmada',
  pendiente_pago: 'Pend. pago',
  cancelada: 'Cancelada',
}

export default async function PagosPage({ searchParams }: PagosPageProps) {
  await requireRole('admin')

  const { date: dateParam } = await searchParams

  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date())

  const selectedDate = dateParam ?? today
  const dateObj = new Date(selectedDate + 'T00:00:00-03:00')

  const [resumen, reservasDelDia] = await Promise.all([
    getResumenDiario(dateObj),
    getReservasDelDia(dateObj),
  ])

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

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      {/* Booking list */}
      <div>
        <h2 className="text-base font-semibold mb-3">Reservas del día</h2>
        {reservasDelDia.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
            <CalendarIcon className="h-7 w-7 opacity-30" />
            <p className="text-sm">Sin reservas para este día</p>
          </div>
        ) : (
          <div className="rounded-lg border divide-y">
            {reservasDelDia.map((r) => {
              const pagoCompleto = r.totalPagado >= parseFloat(r.precio)
              const estadoKey = r.estado as keyof typeof ESTADO_STYLES
              return (
                <div key={r.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{r.clienteNombre}</p>
                      <span className={cn(
                        'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                        ESTADO_STYLES[estadoKey] ?? 'bg-muted text-muted-foreground'
                      )}>
                        {ESTADO_LABEL[estadoKey] ?? r.estado}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.canchaNombre} · {toArgTime(r.inicio)}–{toArgTime(r.fin)} · {formatARS(r.precio)}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Pagado: {formatARS(r.totalPagado)}
                      {!pagoCompleto && (
                        <span className="ml-1 text-amber-600">
                          (falta {formatARS(parseFloat(r.precio) - r.totalPagado)})
                        </span>
                      )}
                    </p>
                  </div>
                  {!pagoCompleto && (
                    <PaymentForm
                      reservaId={r.id}
                      precioTotal={parseFloat(r.precio) - r.totalPagado}
                      trigger={
                        <button
                          type="button"
                          className="shrink-0 flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          <BanknoteIcon className="h-3.5 w-3.5" />
                          Cobrar
                        </button>
                      }
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
