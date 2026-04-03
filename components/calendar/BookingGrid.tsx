'use client'

import { TimeAxis } from './TimeAxis'
import { CourtHeader } from './CourtHeader'
import { BookingBlock } from './BookingBlock'
import type { Reserva } from '@/lib/queries/reservas'
import type { Cancha } from '@/lib/queries/canchas'

// Operating range: 08:00-24:00 = 16 hours, 30-min slots = 32 slot rows
const DAY_START_HOUR = 8
const DAY_END_HOUR = 24
const SLOT_MINUTES = 30
const TOTAL_SLOTS = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES // 32

interface BookingGridProps {
  canchas: Pick<Cancha, 'id' | 'nombre' | 'tipo'>[]
  reservas: Reserva[]
}

export function BookingGrid({ canchas, reservas }: BookingGridProps) {
  const numCourts = canchas.length

  if (numCourts === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Sin canchas activas</p>
      </div>
    )
  }

  // Group reservas by cancha
  const reservasByCanchaId = new Map<number, Reserva[]>()
  for (const r of reservas) {
    if (!reservasByCanchaId.has(r.canchaId)) reservasByCanchaId.set(r.canchaId, [])
    reservasByCanchaId.get(r.canchaId)!.push(r)
  }

  // Grid: col 1 = time axis, cols 2..N+1 = courts
  // Row 1 = header, rows 2..33 = 30-min slots
  return (
    <div
      className="relative overflow-auto rounded-lg border bg-card"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `52px repeat(${numCourts}, minmax(100px, 1fr))`,
          gridTemplateRows: `40px repeat(${TOTAL_SLOTS}, 28px)`,
          minWidth: `${52 + numCourts * 100}px`,
        }}
      >
        {/* Time axis */}
        <TimeAxis />

        {/* Court headers */}
        <CourtHeader canchas={canchas} />

        {/* Hour grid lines (background cells) */}
        {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) =>
          canchas.map((cancha, courtIdx) => (
            <div
              key={`cell-${slotIdx}-${cancha.id}`}
              style={{ gridColumn: courtIdx + 2, gridRow: slotIdx + 2 }}
              className={`border-l border-b border-border/40 ${slotIdx % 2 === 0 ? 'bg-muted/20' : ''}`}
            />
          ))
        )}

        {/* Booking blocks */}
        {canchas.map((cancha, courtIndex) => {
          const courtReservas = reservasByCanchaId.get(cancha.id) ?? []
          return courtReservas.map((reserva) => (
            <BookingBlock
              key={reserva.id}
              reserva={reserva}
              courtIndex={courtIndex}
              totalCourts={numCourts}
            />
          ))
        })}
      </div>
    </div>
  )
}
