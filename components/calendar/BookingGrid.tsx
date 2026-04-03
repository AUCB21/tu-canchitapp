'use client'

import { TimeAxis } from './TimeAxis'
import { CourtHeader } from './CourtHeader'
import { BookingBlock } from './BookingBlock'
import { CurrentTimeIndicator } from './CurrentTimeIndicator'
import type { Reserva } from '@/lib/queries/reservas'
import type { Cancha } from '@/lib/queries/canchas'
import { CalendarIcon } from 'lucide-react'

const DAY_START_HOUR = 8
const DAY_END_HOUR   = 24
const SLOT_MINUTES   = 30
const TOTAL_SLOTS    = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES // 32

interface BookingGridProps {
  canchas: Pick<Cancha, 'id' | 'nombre' | 'tipo'>[]
  reservas: Reserva[]
  selectedDate: string
}

export function BookingGrid({ canchas, reservas, selectedDate }: BookingGridProps) {
  const numCourts = canchas.length

  if (numCourts === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground">
        <CalendarIcon className="h-8 w-8 opacity-25" />
        <p className="text-sm font-medium">Sin canchas activas</p>
      </div>
    )
  }

  const reservasByCanchaId = new Map<number, Reserva[]>()
  for (const r of reservas) {
    if (!reservasByCanchaId.has(r.canchaId)) reservasByCanchaId.set(r.canchaId, [])
    reservasByCanchaId.get(r.canchaId)!.push(r)
  }

  return (
    <div
      className="relative overflow-auto rounded-xl border border-border bg-card shadow-xl"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `52px repeat(${numCourts}, minmax(100px, 1fr))`,
          gridTemplateRows: `52px repeat(${TOTAL_SLOTS}, 28px)`,
          minWidth: `${52 + numCourts * 100}px`,
        }}
      >
        <TimeAxis />
        <CourtHeader canchas={canchas} />

        {/* Grid cells */}
        {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) =>
          canchas.map((cancha, courtIdx) => (
            <div
              key={`cell-${slotIdx}-${cancha.id}`}
              style={{ gridColumn: courtIdx + 2, gridRow: slotIdx + 2 }}
              className={[
                'border-l border-b border-border/30',
                slotIdx % 2 === 0 ? 'bg-muted/10' : '',
                // Hour boundary — slightly stronger line every 2 slots
                slotIdx % 2 === 0 ? 'border-t-0' : '',
              ].join(' ')}
            />
          ))
        )}

        <CurrentTimeIndicator numCourts={numCourts} selectedDate={selectedDate} />

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
