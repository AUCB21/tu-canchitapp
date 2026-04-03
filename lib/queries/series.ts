import { db } from '@/db'
import { seriesRecurrentes, clientes, canchas } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

export type SerieConRelaciones = InferSelectModel<typeof seriesRecurrentes> & {
  cliente: Pick<InferSelectModel<typeof clientes>, 'id' | 'nombre' | 'telefono'>
  cancha: Pick<InferSelectModel<typeof canchas>, 'id' | 'nombre' | 'tipo'>
}

/** Return all active series with cancha and cliente info. */
export async function getSeries(): Promise<SerieConRelaciones[]> {
  const rows = await db
    .select({
      id: seriesRecurrentes.id,
      canchaId: seriesRecurrentes.canchaId,
      clienteId: seriesRecurrentes.clienteId,
      diaSemana: seriesRecurrentes.diaSemana,
      horaInicio: seriesRecurrentes.horaInicio,
      horaFin: seriesRecurrentes.horaFin,
      precio: seriesRecurrentes.precio,
      fechaInicio: seriesRecurrentes.fechaInicio,
      fechaFin: seriesRecurrentes.fechaFin,
      activa: seriesRecurrentes.activa,
      createdAt: seriesRecurrentes.createdAt,
      clienteNombre: clientes.nombre,
      clienteTelefono: clientes.telefono,
      canchaNombre: canchas.nombre,
      canchaTipo: canchas.tipo,
    })
    .from(seriesRecurrentes)
    .innerJoin(clientes, eq(seriesRecurrentes.clienteId, clientes.id))
    .innerJoin(canchas, eq(seriesRecurrentes.canchaId, canchas.id))
    .where(eq(seriesRecurrentes.activa, true))
    .orderBy(seriesRecurrentes.diaSemana, seriesRecurrentes.horaInicio)

  return rows.map((r) => ({
    id: r.id,
    canchaId: r.canchaId,
    clienteId: r.clienteId,
    diaSemana: r.diaSemana,
    horaInicio: r.horaInicio,
    horaFin: r.horaFin,
    precio: r.precio,
    fechaInicio: r.fechaInicio,
    fechaFin: r.fechaFin,
    activa: r.activa,
    createdAt: r.createdAt,
    cliente: { id: r.clienteId, nombre: r.clienteNombre, telefono: r.clienteTelefono },
    cancha: { id: r.canchaId, nombre: r.canchaNombre, tipo: r.canchaTipo },
  }))
}
