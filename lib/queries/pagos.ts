import { db } from '@/db'
import { pagos, reservas, clientes, canchas } from '@/db/schema'
import { and, gte, lt, sql, ne, eq } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

export interface ResumenDiario {
  total: number
  efectivo: number
  transferencia: number
  reservas: number
}

export interface ReservaDiaria {
  id: number
  clienteNombre: string
  canchaNombre: string
  inicio: Date
  fin: Date
  precio: string
  estado: string
  totalPagado: number
}

/**
 * Daily revenue summary for the admin pagos page.
 * `date` must be midnight Argentina time.
 */
export async function getResumenDiario(date: Date): Promise<ResumenDiario> {
  const startOfDay = new Date(`${date.toISOString().slice(0, 10)}T00:00:00-03:00`)
  const endOfDay = new Date(`${date.toISOString().slice(0, 10)}T23:59:59-03:00`)

  // Aggregate payments for bookings that START on this day
  const [result] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${pagos.monto}), 0)`,
      efectivo: sql<string>`COALESCE(SUM(${pagos.monto}) FILTER (WHERE ${pagos.metodo} = 'efectivo'), 0)`,
      transferencia: sql<string>`COALESCE(SUM(${pagos.monto}) FILTER (WHERE ${pagos.metodo} = 'transferencia'), 0)`,
    })
    .from(pagos)
    .innerJoin(reservas, sql`${pagos.reservaId} = ${reservas.id}`)
    .where(
      and(
        gte(reservas.inicio, startOfDay),
        lt(reservas.inicio, endOfDay),
        ne(reservas.estado, 'cancelada')
      )
    )

  // Count distinct non-cancelled bookings for the day
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(reservas)
    .where(
      and(
        gte(reservas.inicio, startOfDay),
        lt(reservas.inicio, endOfDay),
        ne(reservas.estado, 'cancelada')
      )
    )

  return {
    total: parseFloat(result.total),
    efectivo: parseFloat(result.efectivo),
    transferencia: parseFloat(result.transferencia),
    reservas: count,
  }
}

/**
 * Non-cancelled bookings for a given day with total paid amounts.
 */
export async function getReservasDelDia(date: Date): Promise<ReservaDiaria[]> {
  const startOfDay = new Date(`${date.toISOString().slice(0, 10)}T00:00:00-03:00`)
  const endOfDay = new Date(`${date.toISOString().slice(0, 10)}T23:59:59-03:00`)

  const rows = await db
    .select({
      id: reservas.id,
      clienteNombre: clientes.nombre,
      canchaNombre: canchas.nombre,
      inicio: reservas.inicio,
      fin: reservas.fin,
      precio: reservas.precio,
      estado: reservas.estado,
      totalPagado: sql<string>`COALESCE((
        SELECT SUM(p.monto) FROM pagos p WHERE p.reserva_id = ${reservas.id}
      ), 0)`,
    })
    .from(reservas)
    .innerJoin(clientes, eq(reservas.clienteId, clientes.id))
    .innerJoin(canchas, eq(reservas.canchaId, canchas.id))
    .where(
      and(
        gte(reservas.inicio, startOfDay),
        lt(reservas.inicio, endOfDay),
        ne(reservas.estado, 'cancelada')
      )
    )
    .orderBy(reservas.inicio)

  return rows.map((r) => ({
    ...r,
    totalPagado: parseFloat(r.totalPagado),
  }))
}

