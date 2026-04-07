import { db } from '@/db'
import { reservas, pagos } from '@/db/schema'
import { and, eq, gte, lt, ne, sql } from 'drizzle-orm'
import { cache } from 'react'

export interface DashboardStats {
  totalReservas: number
  ingresosDia: number
  canchasOcupadas: number
  minutosProxima: number | null
}

export const getDashboardStats = cache(async function getDashboardStats(
  date: Date
): Promise<DashboardStats> {
  const dateStr = date.toISOString().slice(0, 10)
  const startOfDay = new Date(`${dateStr}T00:00:00-03:00`)
  const endOfDay = new Date(`${dateStr}T23:59:59-03:00`)

  // Current time in Argentina
  const now = new Date()

  // 1. Total non-cancelled reservations for the day
  const [{ count: totalReservas }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reservas)
    .where(
      and(
        gte(reservas.inicio, startOfDay),
        lt(reservas.inicio, endOfDay),
        ne(reservas.estado, 'cancelada')
      )
    )

  // 2. Total payments collected for bookings starting this day
  const [{ total }] = await db
    .select({ total: sql<string>`COALESCE(SUM(${pagos.monto}), 0)` })
    .from(pagos)
    .innerJoin(reservas, eq(pagos.reservaId, reservas.id))
    .where(
      and(
        gte(reservas.inicio, startOfDay),
        lt(reservas.inicio, endOfDay),
        ne(reservas.estado, 'cancelada')
      )
    )

  // 3. Courts with an active reservation right now (inicio <= now < fin)
  const nowIso = now.toISOString()
  const [{ count: canchasOcupadas }] = await db
    .select({ count: sql<number>`count(DISTINCT ${reservas.canchaId})::int` })
    .from(reservas)
    .where(
      and(
        sql`${reservas.inicio} <= ${nowIso}::timestamptz`,
        sql`${reservas.fin} > ${nowIso}::timestamptz`,
        ne(reservas.estado, 'cancelada')
      )
    )

  // 4. Minutes until next reservation (null if none remaining today)
  const [nextRow] = await db
    .select({ inicio: reservas.inicio })
    .from(reservas)
    .where(
      and(
        sql`${reservas.inicio} >= ${nowIso}::timestamptz`,
        lt(reservas.inicio, endOfDay),
        ne(reservas.estado, 'cancelada')
      )
    )
    .orderBy(reservas.inicio)
    .limit(1)

  const minutosProxima = nextRow
    ? Math.round((nextRow.inicio.getTime() - now.getTime()) / 60000)
    : null

  return {
    totalReservas,
    ingresosDia: parseFloat(total),
    canchasOcupadas,
    minutosProxima,
  }
})
