'use client'

import { useState } from 'react'
import { toArgTime, formatARS } from '@/lib/utils'
import type { Reserva } from '@/lib/queries/reservas'
import { StarIcon, XIcon } from 'lucide-react'
import { cancelReserva } from '@/lib/actions/reservas'
import { cn } from '@/lib/utils'
import { PaymentForm } from '@/components/forms/PaymentForm'

// Operating range: 08:00-24:00 = 16 hours, each row = 1 hour
const DAY_START_HOUR = 8

interface BookingBlockProps {
  reserva: Reserva
  courtIndex: number  // 0-based, column = courtIndex + 2
  totalCourts: number
}

export function BookingBlock({ reserva, courtIndex }: BookingBlockProps) {
  const [detail, setDetail] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const startHour = reserva.inicio.getHours() + reserva.inicio.getMinutes() / 60
  const endHour = reserva.fin.getHours() + reserva.fin.getMinutes() / 60
  const rowStart = Math.round((startHour - DAY_START_HOUR) * 2) + 2 // 30-min slots in grid
  const rowSpan = Math.max(1, Math.round((endHour - startHour) * 2))

  const isRecurrente = reserva.esRecurrente
  const isPendiente = reserva.estado === 'pendiente_pago'

  async function handleCancel() {
    if (!confirm('¿Cancelar esta reserva?')) return
    setCancelling(true)
    try {
      await cancelReserva(reserva.id)
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
        style={{
          gridColumn: courtIndex + 2,
          gridRow: `${rowStart} / span ${rowSpan}`,
        }}
        className={cn(
          'relative m-0.5 rounded-md p-1.5 text-left text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-90 overflow-hidden',
          isRecurrente
            ? 'bg-blue-600 border border-blue-400/30'
            : 'bg-emerald-600 border border-emerald-400/30',
          isPendiente && 'ring-2 ring-amber-400'
        )}
        aria-label={`Reserva de ${reserva.cliente.nombre} a las ${toArgTime(reserva.inicio)}`}
      >
        <div className="truncate leading-tight">
          {isRecurrente && <StarIcon className="inline h-2.5 w-2.5 mr-0.5 mb-0.5" />}
          <span>{reserva.cliente.nombre}</span>
        </div>
        {rowSpan >= 2 && (
          <div className="mt-0.5 truncate opacity-80 text-[10px]">
            {toArgTime(reserva.inicio)}–{toArgTime(reserva.fin)}
          </div>
        )}
        {rowSpan >= 3 && (
          <div className="mt-0.5 opacity-75 text-[10px]">{formatARS(reserva.precio)}</div>
        )}
      </button>

      {/* Detail dialog */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDetail(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border bg-card shadow-xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-sm">{reserva.cliente.nombre}</h2>
                {reserva.cliente.telefono && (
                  <p className="text-xs text-muted-foreground">{reserva.cliente.telefono}</p>
                )}
              </div>
              <button
                onClick={() => setDetail(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Cancha</p>
                <p className="font-medium">{reserva.cancha.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Precio</p>
                <p className="font-medium">{formatARS(reserva.precio)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Inicio</p>
                <p className="font-medium">{toArgTime(reserva.inicio)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fin</p>
                <p className="font-medium">{toArgTime(reserva.fin)}</p>
              </div>
              {reserva.notas && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="font-medium">{reserva.notas}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <p className={cn(
                  'font-medium capitalize',
                  reserva.estado === 'confirmada' && 'text-emerald-600',
                  reserva.estado === 'pendiente_pago' && 'text-amber-600',
                )}>
                  {reserva.estado.replace('_', ' ')}
                </p>
              </div>
              {reserva.esRecurrente && (
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="font-medium flex items-center gap-1">
                    <StarIcon className="h-3 w-3 text-blue-500" /> Turno fijo
                  </p>
                </div>
              )}
            </div>


            <div className="flex gap-2">
              <PaymentForm
                reservaId={reserva.id}
                precioTotal={parseFloat(reserva.precio)}
                onSuccess={() => setDetail(false)}
              />
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive hover:bg-destructive/20 disabled:opacity-50"
              >
                {cancelling ? 'Cancelando…' : 'Cancelar reserva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
