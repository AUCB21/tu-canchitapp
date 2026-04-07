'use server'

import { db } from '@/db'
import { clientes } from '@/db/schema'
import { eq, ilike, or, and, ne } from 'drizzle-orm'
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
    .where(
      and(
        eq(clientes.activa, true),
        or(ilike(clientes.nombre, term), ilike(clientes.telefono, term))
      )
    )
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

export async function updateCliente(
  id: number,
  data: { nombre: string; telefono?: string }
): Promise<Cliente> {
  await requireRole('staff')

  const [cliente] = await db
    .update(clientes)
    .set({
      nombre: data.nombre.trim(),
      telefono: data.telefono?.trim() || null,
    })
    .where(eq(clientes.id, id))
    .returning()

  revalidatePath('/clientes')
  return cliente
}

export async function deleteCliente(id: number): Promise<void> {
  await requireRole('staff')

  await db
    .update(clientes)
    .set({ activa: false })
    .where(eq(clientes.id, id))

  revalidatePath('/clientes')
}

export async function checkDuplicates(
  nombre: string,
  telefono?: string,
  excludeId?: number
): Promise<Cliente[]> {
  await requireRole('staff')

  const nombreTerm = `%${nombre.trim()}%`

  const conditions = telefono?.trim()
    ? or(ilike(clientes.nombre, nombreTerm), ilike(clientes.telefono, `%${telefono.trim()}%`))
    : ilike(clientes.nombre, nombreTerm)

  const rows = await db
    .select()
    .from(clientes)
    .where(and(eq(clientes.activa, true), conditions))
    .limit(3)
    .orderBy(clientes.nombre)

  return excludeId ? rows.filter((c) => c.id !== excludeId) : rows
}
