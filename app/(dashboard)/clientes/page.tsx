import { db } from '@/db'
import { clientes } from '@/db/schema'
import { ilike, or, and, eq } from 'drizzle-orm'
import { requireRole } from '@/lib/auth-utils'
import { ClienteList } from '@/components/clientes/ClienteList'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireRole('staff')
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const results = await db
    .select()
    .from(clientes)
    .where(
      query
        ? and(
            eq(clientes.activa, true),
            or(ilike(clientes.nombre, `%${query}%`), ilike(clientes.telefono, `%${query}%`))
          )
        : eq(clientes.activa, true)
    )
    .orderBy(clientes.nombre)
    .limit(50)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Clientes</h1>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar por nombre o teléfono…"
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Buscar
        </button>
      </form>

      <ClienteList initialClientes={results} />
    </div>
  )
}
