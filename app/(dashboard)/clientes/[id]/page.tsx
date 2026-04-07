import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireRole } from '@/lib/auth-utils'
import { getClienteConHistorial } from '@/lib/queries/clientes'
import { formatARS, toArgDateShort, toArgTime } from '@/lib/utils'
import { ArrowLeftIcon, PhoneIcon, CalendarIcon, RepeatIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const ESTADO_BADGE: Record<string, string> = {
  confirmada: 'bg-emerald-500/15 text-emerald-400',
  pendiente_pago: 'bg-amber-500/15 text-amber-400',
  cancelada: 'bg-muted text-muted-foreground line-through',
}

const ESTADO_LABEL: Record<string, string> = {
  confirmada: 'Confirmada',
  pendiente_pago: 'Pendiente',
  cancelada: 'Cancelada',
}

export default async function ClienteHistorialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole('staff')
  const { id } = await params
  const clienteId = parseInt(id, 10)
  if (isNaN(clienteId)) notFound()

  const data = await getClienteConHistorial(clienteId)
  if (!data) notFound()

  const { cliente, reservasHistorial, totalGastado } = data
  const activas = reservasHistorial.filter((r) => r.estado !== 'cancelada')
  const proximas = activas.filter((r) => r.inicio > new Date())
  const pasadas = activas.filter((r) => r.inicio <= new Date())

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Volver a Clientes
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-black text-primary">
          {cliente.nombre.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{cliente.nombre}</h1>
          {cliente.telefono && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <PhoneIcon className="h-3.5 w-3.5" />
              {cliente.telefono}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total reservas</p>
          <p className="text-2xl font-black tabular-nums">{activas.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Próximas</p>
          <p className="text-2xl font-black tabular-nums text-emerald-400">{proximas.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total gastado</p>
          <p className="text-lg font-black tabular-nums">{formatARS(totalGastado)}</p>
        </div>
      </div>

      {/* Bookings table */}
      {reservasHistorial.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-muted-foreground">
          <CalendarIcon className="h-8 w-8 opacity-30" />
          <p className="text-sm">Sin reservas registradas</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cancha</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Horario</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pagado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reservasHistorial.map((r) => (
                <tr key={r.id} className={cn('hover:bg-muted/20 transition-colors', r.estado === 'cancelada' && 'opacity-40')}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {r.esRecurrente && <RepeatIcon className="h-3 w-3 text-blue-400 shrink-0" />}
                      <span>{toArgDateShort(r.inicio)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.cancha.nombre}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums text-muted-foreground">
                    {toArgTime(r.inicio)}–{toArgTime(r.fin)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', ESTADO_BADGE[r.estado])}>
                      {ESTADO_LABEL[r.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={cn(r.totalPagado >= parseFloat(r.precio) ? 'text-emerald-400' : 'text-amber-400')}>
                      {formatARS(r.totalPagado)}
                    </span>
                    <span className="text-xs text-muted-foreground"> / {formatARS(r.precio)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
