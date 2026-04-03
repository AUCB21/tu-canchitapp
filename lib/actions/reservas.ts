'use server'

import { db } from '@/db'
import { reservas } from '@/db/schema'
import { and, eq, gt, lt, ne } from 'drizzle-orm'
import { requireRole } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { ConflictError } from '@/lib/errors'
import type { InferSelectModel } from 'drizzle-orm'

export type Reserva = InferSelectModel<typeof reservas>

export async function createReserva(data: {
  canchaId: number
  clienteId: number
  inicio: Date
  fin: Date
  precio: number
  notas?: string
  esRecurrente?: boolean
  serieId?: number
}): Promise<{ ok: true; reserva: Reserva } | { ok: false; error: string }> {
  const session = await requireRole('staff')

  try {
    const result = await db.transaction(async (tx) => {
      // Conflict check with SELECT FOR UPDATE
      const conflicts = await tx
        .select({ id: reservas.id })
        .from(reservas)
        .where(
          and(
            eq(reservas.canchaId, data.canchaId),
            ne(reservas.estado, 'cancelada'),
            lt(reservas.inicio, data.fin),
            gt(reservas.fin, data.inicio)
          )
        )
        .for('update')

      if (conflicts.length > 0) {
        throw new ConflictError('Horario ya reservado')
      }

      const [reserva] = await tx
        .insert(reservas)
        .values({
          canchaId: data.canchaId,
          clienteId: data.clienteId,
          inicio: data.inicio,
          fin: data.fin,
          precio: data.precio.toString(),
          notas: data.notas,
          esRecurrente: data.esRecurrente ?? false,
          serieId: data.serieId,
          creadoPor: parseInt(session.user.id),
        })
        .returning()

      return reserva
    })

    revalidatePath('/reservas')
    revalidatePath('/')
    return { ok: true, reserva: result }
  } catch (err) {
    if (err instanceof ConflictError) {
      return { ok: false, error: err.message }
    }
    throw err
  }
}

export async function updateReserva(
  id: number,
  data: Partial<{ estado: 'confirmada' | 'pendiente_pago' | 'cancelada'; notas: string; precio: number }>
): Promise<Reserva> {
  await requireRole('staff')

  const updateData: Record<string, unknown> = {}
  if (data.estado !== undefined) updateData.estado = data.estado
  if (data.notas !== undefined) updateData.notas = data.notas
  if (data.precio !== undefined) updateData.precio = data.precio.toString()

  const [reserva] = await db
    .update(reservas)
    .set(updateData)
    .where(eq(reservas.id, id))
    .returning()

  revalidatePath('/reservas')
  revalidatePath('/')
  return reserva
}

export async function cancelReserva(id: number): Promise<void> {
  await requireRole('staff')

  await db
    .update(reservas)
    .set({ estado: 'cancelada' })
    .where(eq(reservas.id, id))

  revalidatePath('/reservas')
  revalidatePath('/')
}
