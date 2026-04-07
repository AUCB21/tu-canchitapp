'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { toast } from 'sonner'
import { toArgTime, formatARS } from '@/lib/utils'
import type { Reserva } from '@/lib/queries/reservas'
import { StarIcon, XIcon } from 'lucide-react'
import { cancelReserva } from '@/lib/actions/reservas'
import { cn } from '@/lib/utils'
import { PaymentForm } from '@/components/forms/PaymentForm'

const DAY_START_HOUR = 8

interface BookingBlockProps {
  reserva: Reserva
  courtIndex: number
  totalCourts: number
}

// Color system: pending > recurrente > confirmed
const BLOCK_COLORS = {
  pending:    'bg-gradient-to-b from-amber-400 to-orange-600 border-amber-300/30 shadow-amber-900/30',
  recurrente: 'bg-gradient-to-b from-blue-500 to-blue-700   border-blue-400/30   shadow-blue-900/30',
  confirmed:  'bg-gradient-to-b from-emerald-500 to-emerald-700 border-emerald-400/30 shadow-emerald-900/30',
}

export function BookingBlock({ reserva, courtIndex }: BookingBlockProps) {
  const [detail, setDetail] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const startHour = reserva.inicio.getHours() + reserva.inicio.getMinutes() / 60
  const endHour   = reserva.fin.getHours()   + reserva.fin.getMinutes()   / 60
  const rowStart  = Math.round((startHour - DAY_START_HOUR) * 2) + 2
  const rowSpan   = Math.max(1, Math.round((endHour - startHour) * 2))

  const isPending     = reserva.estado === 'pendiente_pago'
  const isRecurrente  = reserva.esRecurrente
  const colorKey      = isPending ? 'pending' : isRecurrente ? 'recurrente' : 'confirmed'
  const colors        = BLOCK_COLORS[colorKey]

  async function handleCancel() {
    if (!confirm('¿Cancelar esta reserva?')) return
    setCancelling(true)
    try {
      await cancelReserva(reserva.id)
      toast.success('Reserva cancelada')
    } catch {
      toast.error('No se pudo cancelar la reserva')
    } finally {
      setCancelling(false)
      setDetail(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDetail(true)}
        style={{ gridColumn: courtIndex + 2, gridRow: `${rowStart} / span ${rowSpan}` }}
        className={cn(
          'relative m-0.5 rounded-lg border p-1.5 text-left text-xs font-semibold text-white shadow-md',
          'transition-all duration-150 hover:brightness-110 hover:shadow-lg hover:-translate-y-px active:scale-[0.98]',
          colors,
        )}
        aria-label={`Reserva de ${reserva.cliente.nombre} a las ${toArgTime(reserva.inicio)}`}
      >
        <div className="truncate leading-tight text-[11px] font-bold">
          {isRecurrente && <StarIcon className="inline h-2.5 w-2.5 mr-0.5 mb-0.5 opacity-90" />}
          {reserva.cliente.nombre}
        </div>
        {rowSpan >= 2 && (
          <div className="mt-0.5 truncate opacity-80 text-[9px] font-medium">
            {toArgTime(reserva.inicio)}–{toArgTime(reserva.fin)}
          </div>
        )}
        {rowSpan >= 3 && (
          <div className="mt-0.5 opacity-70 text-[9px]">{formatARS(reserva.precio)}</div>
        )}
        {isPending && (
          <span className="absolute top-0.5 right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white/80" />
          </span>
        )}
      </button>

      {/* Detail modal */}
      {detail && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setDetail(false)}
        >
          <div
            className="animate-fade-up w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/clientes/${reserva.clienteId}`}
                  className="font-bold text-sm hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {reserva.cliente.nombre}
                </Link>
                {reserva.cliente.telefono && (
                  <p className="text-xs text-muted-foreground">{reserva.cliente.telefono}</p>
                )}
              </div>
              <button onClick={() => setDetail(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Cancha', value: reserva.cancha.nombre },
                { label: 'Precio', value: formatARS(reserva.precio) },
                { label: 'Inicio', value: toArgTime(reserva.inicio) },
                { label: 'Fin',    value: toArgTime(reserva.fin) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="font-semibold mt-0.5">{value}</p>
                </div>
              ))}
              {reserva.notas && (
                <div className="col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notas</p>
                  <p className="font-medium mt-0.5">{reserva.notas}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</p>
                <p className={cn(
                  'font-semibold mt-0.5 capitalize',
                  reserva.estado === 'confirmada'     && 'text-emerald-500',
                  reserva.estado === 'pendiente_pago' && 'text-amber-500',
                )}>
                  {reserva.estado.replace('_', ' ')}
                </p>
              </div>
              {isRecurrente && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tipo</p>
                  <p className="font-semibold mt-0.5 flex items-center gap-1 text-blue-400">
                    <StarIcon className="h-3 w-3" /> Turno fijo
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <PaymentForm
                reservaId={reserva.id}
                precioTotal={parseFloat(reserva.precio)}
                onSuccess={() => setDetail(false)}
              />
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors"
              >
                {cancelling ? 'Cancelando…' : 'Cancelar reserva'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
