'use server'

import { db } from '@/db'
import { pagos, reservas } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { requireRole } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import type { InferSelectModel } from 'drizzle-orm'

export type Pago = InferSelectModel<typeof pagos>

export async function logPago(data: {
  reservaId: number
  monto: number
  metodo: 'efectivo' | 'transferencia'
  notas?: string
}): Promise<Pago> {
  await requireRole('staff')

  return await db.transaction(async (tx) => {
    // Insert payment
    const [pago] = await tx
      .insert(pagos)
      .values({
        reservaId: data.reservaId,
        monto: data.monto.toString(),
        metodo: data.metodo,
        notas: data.notas,
      })
      .returning()

    // Check total paid vs booking price
    const [{ totalPagado }] = await tx
      .select({ totalPagado: sql<string>`COALESCE(SUM(monto), 0)` })
      .from(pagos)
      .where(eq(pagos.reservaId, data.reservaId))

    const [reserva] = await tx
      .select({ precio: reservas.precio })
      .from(reservas)
      .where(eq(reservas.id, data.reservaId))

    const total = parseFloat(totalPagado)
    const precio = parseFloat(reserva.precio)

    const nuevoEstado = total >= precio ? 'confirmada' : 'pendiente_pago'

    await tx
      .update(reservas)
      .set({ estado: nuevoEstado })
      .where(eq(reservas.id, data.reservaId))

    revalidatePath('/pagos')
    revalidatePath('/reservas')
    return pago
  })
}
