import { db } from '@/db'
import { clientes, reservas, canchas, pagos } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'
import { cache } from 'react'

export type Cliente = InferSelectModel<typeof clientes>

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
