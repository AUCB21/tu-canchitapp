import { db } from '@/db'
import { clientes } from '@/db/schema'
import { ilike, or } from 'drizzle-orm'
import { requireRole } from '@/lib/auth-utils'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireRole('staff')
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const results = query
    ? await db
        .select()
        .from(clientes)
        .where(or(ilike(clientes.nombre, `%${query}%`), ilike(clientes.telefono, `%${query}%`)))
        .orderBy(clientes.nombre)
        .limit(50)
    : await db.select().from(clientes).orderBy(clientes.nombre).limit(50)


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

      <div className="rounded-lg border">
        {results.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            {query ? 'Sin resultados para esa búsqueda.' : 'Aún no hay clientes cargados.'}
          </p>
        ) : (
          <ul className="divide-y">
            {results.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {c.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.nombre}</p>
                  {c.telefono && (
                    <p className="text-xs text-muted-foreground">{c.telefono}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Los clientes se crean automáticamente al registrar una reserva.
      </p>
    </div>
  )
}
