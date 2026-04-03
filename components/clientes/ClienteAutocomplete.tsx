'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { searchClientes, createCliente, type Cliente } from '@/lib/actions/clientes'
import { cn } from '@/lib/utils'
import { UserIcon, PlusIcon, SearchIcon } from 'lucide-react'

interface ClienteAutocompleteProps {
  value: Cliente | null
  onChange: (cliente: Cliente | null) => void
  disabled?: boolean
}

export function ClienteAutocomplete({ value, onChange, disabled }: ClienteAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Cliente[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [newTelefono, setNewTelefono] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const data = await searchClientes(q)
      setResults(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setShowNew(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleSelect(c: Cliente) {
    onChange(c)
    setQuery('')
    setOpen(false)
    setResults([])
  }

  function handleClear() {
    onChange(null)
    setQuery('')
    setResults([])
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function handleCreate() {
    if (!newNombre.trim()) return
    setCreating(true)
    try {
      const c = await createCliente({ nombre: newNombre, telefono: newTelefono || undefined })
      handleSelect(c)
      setShowNew(false)
      setNewNombre('')
      setNewTelefono('')
    } finally {
      setCreating(false)
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
        <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{value.nombre}</p>
          {value.telefono && (
            <p className="text-xs text-muted-foreground">{value.telefono}</p>
          )}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground ml-2 shrink-0"
          >
            Cambiar
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar cliente por nombre o teléfono…"
          className={cn(
            'w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
            'disabled:opacity-50'
          )}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && (query.length > 0 || showNew) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {results.length > 0 && (
            <ul className="max-h-48 overflow-y-auto py-1">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="font-medium">{c.nombre}</span>
                      {c.telefono && (
                        <span className="ml-2 text-xs text-muted-foreground">{c.telefono}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {results.length === 0 && query && !loading && (
            <p className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</p>
          )}

          <div className="border-t p-2">
            {!showNew ? (
              <button
                type="button"
                onClick={() => { setShowNew(true); setNewNombre(query) }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-primary hover:bg-accent"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Crear &quot;{query || 'nuevo cliente'}&quot;
              </button>
            ) : (
              <div className="space-y-2 p-1">
                <input
                  autoFocus
                  type="text"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Nombre *"
                  className="w-full rounded border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  type="text"
                  value={newTelefono}
                  onChange={(e) => setNewTelefono(e.target.value)}
                  placeholder="Teléfono (opcional)"
                  className="w-full rounded border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={creating || !newNombre.trim()}
                    className="flex-1 rounded bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creating ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
