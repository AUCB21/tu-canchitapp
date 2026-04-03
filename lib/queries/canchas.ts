import { db } from '@/db'
import { canchas, reservas } from '@/db/schema'
import { and, eq, gte, lt, ne, sql } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

export type Cancha = InferSelectModel<typeof canchas>

export type Disponibilidad = 'libre' | 'parcial' | 'llena'

export type CanchaConDisponibilidad = Cancha & {
  disponibilidad: Disponibilidad
}

export async function getCanchas(): Promise<Cancha[]> {
  return db
    .select()
    .from(canchas)
    .where(eq(canchas.activa, true))
    .orderBy(canchas.orden)
}

export async function getCanchasConDisponibilidad(
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

  // Operating hours 08:00–24:00 = 16 one-hour slots
  const TOTAL_SLOTS = 16

  return todas.map((cancha) => {
    const ocupados = countMap.get(cancha.id) ?? 0
    let disponibilidad: Disponibilidad

    if (ocupados === 0) {
      disponibilidad = 'libre'
    } else if (ocupados >= TOTAL_SLOTS) {
      disponibilidad = 'llena'
    } else {
      disponibilidad = 'parcial'
    }

    return { ...cancha, disponibilidad }
  })
}
