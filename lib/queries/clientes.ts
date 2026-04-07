import { db } from '@/db'
import { clientes, reservas, canchas, pagos } from '@/db/schema'
import { and, eq, desc, ilike, or, sql } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'
import { cache } from 'react'

export type Cliente = InferSelectModel<typeof clientes>

/** Cliente with CRM aggregates for the list page */
export type ClienteEnriquecido = Cliente & {
  ultimaReserva: Date | null
  totalReservas: number
  deuda: number
}

/**
 * Fetches active clientes with per-client aggregates:
 * - last non-cancelled reservation date
 * - count of non-cancelled reservations
 * - outstanding debt (precio - paid for pendiente_pago reservations)
 */
export async function getClientesEnriquecidos(query?: string): Promise<ClienteEnriquecido[]> {
  const baseFilter = query?.trim()
    ? and(
        eq(clientes.activa, true),
        or(ilike(clientes.nombre, `%${query.trim()}%`), ilike(clientes.telefono, `%${query.trim()}%`))
      )
    : eq(clientes.activa, true)

  const rows = await db
    .select({
      id: clientes.id,
      nombre: clientes.nombre,
      telefono: clientes.telefono,
      activa: clientes.activa,
      createdAt: clientes.createdAt,
      ultimaReserva: sql<Date | null>`MAX(CASE WHEN ${reservas.estado} != 'cancelada' THEN ${reservas.inicio} END)`,
      totalReservas: sql<number>`count(CASE WHEN ${reservas.estado} != 'cancelada' THEN 1 END)::int`,
      deuda: sql<string>`COALESCE(SUM(
        CASE WHEN ${reservas.estado} = 'pendiente_pago'
          THEN ${reservas.precio}::numeric - COALESCE((
            SELECT SUM(${pagos.monto}::numeric)
            FROM ${pagos}
            WHERE ${pagos.reservaId} = ${reservas.id}
          ), 0)
          ELSE 0
        END
      ), 0)`,
    })
    .from(clientes)
    .leftJoin(reservas, eq(reservas.clienteId, clientes.id))
    .where(baseFilter)
    .groupBy(clientes.id)
    .orderBy(clientes.nombre)
    .limit(50)

  return rows.map((r) => ({
    ...r,
    deuda: parseFloat(r.deuda),
  }))
}

export type ReservaHistorial = Pick<
  InferSelectModel<typeof reservas>,
  'id' | 'inicio' | 'fin' | 'estado' | 'precio' | 'esRecurrente'
> & {
  cancha: Pick<InferSelectModel<typeof canchas>, 'id' | 'nombre'>
  totalPagado: number
}

export type ClienteConHistorial = {
  cliente: Cliente
  reservasHistorial: ReservaHistorial[]
  totalGastado: number
}

export const getClienteConHistorial = cache(async function getClienteConHistorial(
  id: number
): Promise<ClienteConHistorial | null> {
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, id))
    .limit(1)

  if (!cliente || !cliente.activa) return null

  const rows = await db
    .select({
      id: reservas.id,
      inicio: reservas.inicio,
      fin: reservas.fin,
      estado: reservas.estado,
      precio: reservas.precio,
      esRecurrente: reservas.esRecurrente,
      canchaId: canchas.id,
      canchaNombre: canchas.nombre,
      totalPagado: sql<string>`COALESCE(SUM(${pagos.monto}), 0)`,
    })
    .from(reservas)
    .innerJoin(canchas, eq(reservas.canchaId, canchas.id))
    .leftJoin(pagos, eq(pagos.reservaId, reservas.id))
    .where(eq(reservas.clienteId, id))
    .groupBy(reservas.id, canchas.id, canchas.nombre)
    .orderBy(desc(reservas.inicio))

  const reservasHistorial: ReservaHistorial[] = rows.map((r) => ({
    id: r.id,
    inicio: r.inicio,
    fin: r.fin,
    estado: r.estado,
    precio: r.precio,
    esRecurrente: r.esRecurrente,
    cancha: { id: r.canchaId, nombre: r.canchaNombre },
    totalPagado: parseFloat(r.totalPagado),
  }))

  const totalGastado = reservasHistorial.reduce((sum, r) => sum + r.totalPagado, 0)

  return { cliente, reservasHistorial, totalGastado }
})
