import { db } from '@/db'
import { reservas, clientes, canchas } from '@/db/schema'
import { and, eq, gte, lt, ne } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

export type Reserva = InferSelectModel<typeof reservas> & {
  cliente: Pick<InferSelectModel<typeof clientes>, 'id' | 'nombre' | 'telefono'>
  cancha: Pick<InferSelectModel<typeof canchas>, 'id' | 'nombre'>
}

/**
 * Get all non-cancelled reservations for a specific court on a given date.
 * `date` is an Argentine-local date parsed as midnight UTC-3.
 */
export async function getReservasForDay(
  canchaId: number,
  date: Date
): Promise<Reserva[]> {
  // The day boundaries (Argentina is UTC-3 permanently)
  const startOfDay = new Date(`${date.toISOString().slice(0, 10)}T00:00:00-03:00`)
  const endOfDay = new Date(`${date.toISOString().slice(0, 10)}T23:59:59-03:00`)

  const rows = await db
    .select({
      id: reservas.id,
      canchaId: reservas.canchaId,
      clienteId: reservas.clienteId,
      inicio: reservas.inicio,
      fin: reservas.fin,
      estado: reservas.estado,
      precio: reservas.precio,
      notas: reservas.notas,
      serieId: reservas.serieId,
      esRecurrente: reservas.esRecurrente,
      creadoPor: reservas.creadoPor,
      createdAt: reservas.createdAt,
      clienteNombre: clientes.nombre,
      clienteTelefono: clientes.telefono,
      canchaIdInner: canchas.id,
      canchaNombre: canchas.nombre,
    })
    .from(reservas)
    .innerJoin(clientes, eq(reservas.clienteId, clientes.id))
    .innerJoin(canchas, eq(reservas.canchaId, canchas.id))
    .where(
      and(
        eq(reservas.canchaId, canchaId),
        gte(reservas.inicio, startOfDay),
        lt(reservas.inicio, endOfDay),
        ne(reservas.estado, 'cancelada')
      )
    )
    .orderBy(reservas.inicio)

  return rows.map((r) => ({
    id: r.id,
    canchaId: r.canchaId,
    clienteId: r.clienteId,
    inicio: r.inicio,
    fin: r.fin,
    estado: r.estado,
    precio: r.precio,
    notas: r.notas,
    serieId: r.serieId,
    esRecurrente: r.esRecurrente,
    creadoPor: r.creadoPor,
    createdAt: r.createdAt,
    cliente: { id: r.clienteId, nombre: r.clienteNombre, telefono: r.clienteTelefono },
    cancha: { id: r.canchaIdInner, nombre: r.canchaNombre },
  }))
}

/**
 * Get all non-cancelled reservations for all courts on a given date.
 * Used by the calendar page when showing all courts at once.
 */
export async function getReservasForDayAllCanchas(date: Date): Promise<Reserva[]> {
  const startOfDay = new Date(`${date.toISOString().slice(0, 10)}T00:00:00-03:00`)
  const endOfDay = new Date(`${date.toISOString().slice(0, 10)}T23:59:59-03:00`)

  const rows = await db
    .select({
      id: reservas.id,
      canchaId: reservas.canchaId,
      clienteId: reservas.clienteId,
      inicio: reservas.inicio,
      fin: reservas.fin,
      estado: reservas.estado,
      precio: reservas.precio,
      notas: reservas.notas,
      serieId: reservas.serieId,
      esRecurrente: reservas.esRecurrente,
      creadoPor: reservas.creadoPor,
      createdAt: reservas.createdAt,
      clienteNombre: clientes.nombre,
      clienteTelefono: clientes.telefono,
      canchaIdInner: canchas.id,
      canchaNombre: canchas.nombre,
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
    id: r.id,
    canchaId: r.canchaId,
    clienteId: r.clienteId,
    inicio: r.inicio,
    fin: r.fin,
    estado: r.estado,
    precio: r.precio,
    notas: r.notas,
    serieId: r.serieId,
    esRecurrente: r.esRecurrente,
    creadoPor: r.creadoPor,
    createdAt: r.createdAt,
    cliente: { id: r.clienteId, nombre: r.clienteNombre, telefono: r.clienteTelefono },
    cancha: { id: r.canchaIdInner, nombre: r.canchaNombre },
  }))
}
