'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { PencilIcon, Trash2Icon, PlusIcon, XIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createCliente,
  updateCliente,
  deleteCliente,
  checkDuplicates,
  type Cliente,
} from '@/lib/actions/clientes'
import type { ClienteEnriquecido } from '@/lib/queries/clientes'
import { formatARS, toArgDateShort } from '@/lib/utils'

interface ClienteListProps {
  initialClientes: ClienteEnriquecido[]
}

function avatar(nombre: string) {
  return nombre.charAt(0).toUpperCase()
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

interface InlineFormProps {
  initialNombre?: string
  initialTelefono?: string
  excludeId?: number
  onSave: (nombre: string, telefono: string) => Promise<void>
  onCancel: () => void
  isPending: boolean
}

function InlineForm({
  initialNombre = '',
  initialTelefono = '',
  excludeId,
  onSave,
  onCancel,
  isPending,
}: InlineFormProps) {
  const [nombre, setNombre] = useState(initialNombre)
  const [telefono, setTelefono] = useState(initialTelefono)
  const [dupes, setDupes] = useState<Cliente[]>([])

  const debouncedNombre = useDebounce(nombre, 400)
  const debouncedTelefono = useDebounce(telefono, 400)

  useEffect(() => {
    let cancelled = false
    if (!debouncedNombre.trim()) {
      // Return empty via a resolved promise to avoid synchronous setState
      Promise.resolve().then(() => { if (!cancelled) setDupes([]) })
    } else {
      checkDuplicates(debouncedNombre, debouncedTelefono || undefined, excludeId)
        .then((result) => { if (!cancelled) setDupes(result) })
    }
    return () => { cancelled = true }
  }, [debouncedNombre, debouncedTelefono, excludeId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    await onSave(nombre, telefono)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-primary/30 bg-card p-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Nombre *
          </label>
          <input
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            required
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Teléfono
          </label>
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="11-1234-5678"
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {dupes.length > 0 && (
        <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-2 text-xs text-amber-400">
          <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Similar a:{' '}
            {dupes.map((d, i) => (
              <span key={d.id}>
                {i > 0 && ', '}
                <strong>{d.nombre}</strong>
                {d.telefono && ` (${d.telefono})`}
              </span>
            ))}
          </span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
        >
          <XIcon className="h-3 w-3" /> Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending || !nombre.trim()}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <CheckIcon className="h-3 w-3" />
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export function ClienteList({ initialClientes }: ClienteListProps) {
  const [items, setItems] = useState(initialClientes)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setItems(initialClientes)
  }, [initialClientes])

  function handleCreate(nombre: string, telefono: string) {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const nuevo = await createCliente({ nombre, telefono: telefono || undefined })
        const enriched: ClienteEnriquecido = { ...nuevo, ultimaReserva: null, totalReservas: 0, deuda: 0 }
        setItems((prev) => [enriched, ...prev].sort((a, b) => a.nombre.localeCompare(b.nombre)))
        setCreating(false)
        resolve()
      })
    })
  }

  function handleUpdate(id: number, nombre: string, telefono: string) {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const updated = await updateCliente(id, { nombre, telefono: telefono || undefined })
        setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)))
        setEditingId(null)
        resolve()
      })
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteCliente(id)
      setItems((prev) => prev.filter((c) => c.id !== id))
      setConfirmDeleteId(null)
    })
  }

  return (
    <div className="space-y-3">
      {/* Create button / inline form */}
      {creating ? (
        <InlineForm
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
          isPending={isPending}
        />
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo cliente
        </button>
      )}

      {/* List */}
      <div className="rounded-lg border divide-y">
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Sin resultados.
          </p>
        ) : (
          items.map((c) => (
            <div key={c.id} className="px-4 py-3 space-y-2">
              {editingId === c.id ? (
                <InlineForm
                  initialNombre={c.nombre}
                  initialTelefono={c.telefono ?? ''}
                  excludeId={c.id}
                  onSave={(nombre, telefono) => handleUpdate(c.id, nombre, telefono)}
                  onCancel={() => setEditingId(null)}
                  isPending={isPending}
                />
              ) : confirmDeleteId === c.id ? (
                <div className="flex items-center justify-between gap-3 rounded-md bg-destructive/10 px-3 py-2">
                  <p className="text-xs text-destructive">
                    ¿Eliminar a <strong>{c.nombre}</strong>? Sus reservas no se borran.
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-md border px-2.5 py-1 text-xs hover:bg-accent"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={isPending}
                      className="rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-white hover:bg-destructive/90 disabled:opacity-50"
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/clientes/${c.id}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    {avatar(c.nombre)}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/clientes/${c.id}`}
                      className="text-sm font-medium truncate hover:text-primary transition-colors block"
                    >
                      {c.nombre}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      {c.telefono && (
                        <span className="text-xs text-muted-foreground">{c.telefono}</span>
                      )}
                      {c.totalReservas > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {c.totalReservas} reserva{c.totalReservas !== 1 && 's'}
                        </span>
                      )}
                      {c.ultimaReserva && (
                        <span className="text-xs text-muted-foreground">
                          Últ: {toArgDateShort(new Date(c.ultimaReserva))}
                        </span>
                      )}
                      {c.deuda > 0 && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          Deuda {formatARS(c.deuda)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={cn('flex items-center gap-1 shrink-0', isPending && 'opacity-50 pointer-events-none')}>
                    <button
                      onClick={() => { setEditingId(c.id); setConfirmDeleteId(null) }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      aria-label={`Editar ${c.nombre}`}
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { setConfirmDeleteId(c.id); setEditingId(null) }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label={`Eliminar ${c.nombre}`}
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
