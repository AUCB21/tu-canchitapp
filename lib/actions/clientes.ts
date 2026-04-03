'use server'

import { db } from '@/db'
import { clientes } from '@/db/schema'
import { ilike, or } from 'drizzle-orm'
import { requireRole } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import type { InferSelectModel } from 'drizzle-orm'

export type Cliente = InferSelectModel<typeof clientes>

export async function searchClientes(query: string): Promise<Cliente[]> {
  await requireRole('staff')

  const term = `%${query}%`
  return db
    .select()
    .from(clientes)
    .where(or(ilike(clientes.nombre, term), ilike(clientes.telefono, term)))
    .limit(20)
    .orderBy(clientes.nombre)
}

export async function createCliente(data: {
  nombre: string
  telefono?: string
}): Promise<Cliente> {
  await requireRole('staff')

  const [cliente] = await db
    .insert(clientes)
    .values({
      nombre: data.nombre.trim(),
      telefono: data.telefono?.trim() || null,
    })
    .returning()

  revalidatePath('/clientes')
  return cliente
}
