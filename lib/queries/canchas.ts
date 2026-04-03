import { db } from '@/db'
import { canchas, reservas } from '@/db/schema'
import { and, eq, gte, lt, ne, sql } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'
import { cache } from 'react'

export type Cancha = InferSelectModel<typeof canchas>

export type Disponibilidad = 'libre' | 'ocupada'

export type CanchaConDisponibilidad = Cancha & {
  disponibilidad: Disponibilidad
  slotsOcupados: number  // booked 1-hr slots today
  slotsTotales: number   // total 1-hr slots in operating hours (08:00–24:00)
}

export const getCanchas = cache(async function getCanchas(): Promise<Cancha[]> {
  return db
    .select()
    .from(canchas)
    .where(eq(canchas.activa, true))
    .orderBy(canchas.orden)
})

export const getCanchasConDisponibilidad = cache(async function getCanchasConDisponibilidad(
  date: Date
): Promise<CanchaConDisponibilidad[]> {
  const todas = await getCanchas()

  // Day boundaries in UTC (Argentina is UTC-3, so 08:00 AR = 11:00 UTC)
  const startOfDay = new Date(date)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setUTCHours(23, 59, 59, 999)

  // Count non-cancelled bookings per court for this date
  const counts = await db
    .select({
      canchaId: reservas.canchaId,
      total: sql<number>`count(*)::int`,
    })
    .from(reservas)
    .where(
      and(
        gte(reservas.inicio, startOfDay),
        lt(reservas.inicio, endOfDay),
        ne(reservas.estado, 'cancelada')
      )
    )
    .groupBy(reservas.canchaId)

  const countMap = new Map(counts.map((c) => [c.canchaId, c.total]))
  const TOTAL_SLOTS = 16 // 08:00–24:00 = 16 hourly slots

  return todas.map((cancha) => {
    const slotsOcupados = Math.min(countMap.get(cancha.id) ?? 0, TOTAL_SLOTS)
    const disponibilidad: Disponibilidad = slotsOcupados > 0 ? 'ocupada' : 'libre'
    return { ...cancha, disponibilidad, slotsOcupados, slotsTotales: TOTAL_SLOTS }
  })
})
