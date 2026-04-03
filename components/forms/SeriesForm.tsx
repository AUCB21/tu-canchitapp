'use client'

import { useState, useTransition } from 'react'
import { ClienteAutocomplete } from '@/components/clientes/ClienteAutocomplete'
import { createSerie } from '@/lib/actions/series'
import type { Cliente } from '@/lib/actions/clientes'
import type { Cancha } from '@/lib/queries/canchas'
import { argToUTC } from '@/lib/utils'
import { XIcon, RepeatIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const DIAS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

interface SeriesFormProps {
  canchas: Pick<Cancha, 'id' | 'nombre'>[]
}

export function SeriesForm({ canchas }: SeriesFormProps) {
  const [open, setOpen] = useState(false)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [canchaId, setCanchaId] = useState<number>(canchas[0]?.id ?? 0)
  const [diaSemana, setDiaSemana] = useState(1)
  const [horaInicio, setHoraInicio] = useState('20:00')
  const [horaFin, setHoraFin] = useState('21:00')
  const [precio, setPrecio] = useState('')
  const [fechaInicio, setFechaInicio] = useState(() =>
    new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date())
  )
  const [fechaFin, setFechaFin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleClose() {
    setOpen(false)
    setCliente(null)
    setCanchaId(canchas[0]?.id ?? 0)
    setDiaSemana(1)
    setHoraInicio('20:00')
    setHoraFin('21:00')
    setPrecio('')
    setFechaFin('')
    setError('')
    setSuccess('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cliente) { setError('Seleccioná un cliente'); return }
    if (!precio || isNaN(parseFloat(precio))) { setError('Ingresá un precio válido'); return }

    const inicioTime = argToUTC(fechaInicio, horaInicio)
    const finTime = argToUTC(fechaInicio, horaFin)
    if (finTime <= inicioTime) { setError('La hora de fin debe ser posterior al inicio'); return }

    setError('')
    startTransition(async () => {
      const result = await createSerie({
        canchaId,
        clienteId: cliente.id,
        diaSemana: diaSemana as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        horaInicio,
        horaFin,
        precio: parseFloat(precio),
        fechaInicio: new Date(fechaInicio + 'T00:00:00-03:00'),
        fechaFin: fechaFin ? new Date(fechaFin + 'T23:59:59-03:00') : undefined,
      })

      setSuccess(`Turno fijo creado — ${result.reservasCreadas} reservas generadas`)
      setTimeout(handleClose, 1500)
    })
  }

  return (
    <>
      <button
        type="button"
        id="btn-nuevo-turno-fijo"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        <RepeatIcon className="h-3.5 w-3.5" />
        Nuevo turno fijo
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold flex items-center gap-2">
                <RepeatIcon className="h-4 w-4 text-blue-500" />
                Nuevo turno fijo
              </h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Cliente *</label>
                <ClienteAutocomplete value={cliente} onChange={setCliente} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Cancha *</label>
                  <select
                    id="serie-cancha"
                    value={canchaId}
                    onChange={(e) => setCanchaId(parseInt(e.target.value))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {canchas.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Día *</label>
                  <select
                    id="serie-dia"
                    value={diaSemana}
                    onChange={(e) => setDiaSemana(parseInt(e.target.value))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {DIAS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Hora inicio *</label>
                  <input
                    type="time"
                    id="serie-inicio"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Hora fin *</label>
                  <input
                    type="time"
                    id="serie-fin"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Precio por turno (ARS) *</label>
                <input
                  type="number"
                  id="serie-precio"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  min="0"
                  step="100"
                  placeholder="0"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Desde *</label>
                  <input
                    type="date"
                    id="serie-fecha-inicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Hasta <span className="text-muted-foreground/60">(vacío = 52 sem.)</span>
                  </label>
                  <input
                    type="date"
                    id="serie-fecha-fin"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
              )}
              {success && (
                <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-accent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    'flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white',
                    'hover:bg-blue-700 disabled:opacity-50'
                  )}
                >
                  {isPending ? 'Generando…' : 'Crear turno fijo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
