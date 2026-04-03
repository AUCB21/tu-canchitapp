'use server'

import { db } from '@/db'
import { canchas } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { requireRole } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function createCancha(data: {
  nombre: string
  tipo: 'futbol5' | 'futbol7'
  capacidad?: number
}) {
  await requireRole('admin')

  // Place at the end of the current list
  const [{ maxOrden }] = await db
    .select({ maxOrden: sql<number | null>`COALESCE(MAX(${canchas.orden}), -1)` })
    .from(canchas)

  const [cancha] = await db
    .insert(canchas)
    .values({ ...data, capacidad: data.capacidad ?? 10, orden: (maxOrden ?? -1) + 1 })
    .returning()

  revalidatePath('/')
  revalidatePath('/configuracion/canchas')
  return cancha
}

export async function updateCancha(
  id: number,
  data: Partial<{ nombre: string; tipo: 'futbol5' | 'futbol7'; capacidad: number; activa: boolean }>
) {
  await requireRole('admin')

  const [cancha] = await db
    .update(canchas)
    .set(data)
    .where(eq(canchas.id, id))
    .returning()

  revalidatePath('/')
  revalidatePath('/configuracion/canchas')
  return cancha
}

export async function deleteCancha(id: number) {
  await requireRole('admin')

  await db.update(canchas).set({ activa: false }).where(eq(canchas.id, id))

  revalidatePath('/')
  revalidatePath('/configuracion/canchas')
}

export async function reorderCanchas(ids: number[]) {
  await requireRole('admin')

  await Promise.all(
    ids.map((id, index) =>
      db.update(canchas).set({ orden: index }).where(eq(canchas.id, id))
    )
  )

  revalidatePath('/')
  revalidatePath('/configuracion/canchas')
}
