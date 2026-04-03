'use client'

import { useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { ClienteAutocomplete } from '@/components/clientes/ClienteAutocomplete'
import { createReserva } from '@/lib/actions/reservas'
import type { Cliente } from '@/lib/actions/clientes'
import type { Cancha } from '@/lib/queries/canchas'
import { argToUTC } from '@/lib/utils'
import { XIcon, PlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookingFormProps {
  canchas: Pick<Cancha, 'id' | 'nombre'>[]
  defaultCanchaId?: number
  defaultDate: string   // "YYYY-MM-DD"
  defaultHora?: string  // "HH:mm"
  onSuccess?: () => void
}

/** Add `minutes` to a "HH:mm" string, clamped at "24:00" */
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.min(Math.floor(total / 60), 24)
  const newM = newH === 24 ? 0 : total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

export function BookingForm({
  canchas,
  defaultCanchaId,
  defaultDate,
  defaultHora,
  onSuccess,
}: BookingFormProps) {
  const [open, setOpen] = useState(false)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [canchaId, setCanchaId] = useState<number>(defaultCanchaId ?? canchas[0]?.id ?? 0)
  const [date, setDate] = useState(defaultDate)
  const [horaInicio, setHoraInicio] = useState(defaultHora ?? '20:00')
  const [horaFin, setHoraFin] = useState(() => addMinutes(defaultHora ?? '20:00', 60))
  const [precio, setPrecio] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function resetForm() {
    setCliente(null)
    setCanchaId(defaultCanchaId ?? canchas[0]?.id ?? 0)
    setDate(defaultDate)
    setHoraInicio(defaultHora ?? '20:00')
    setHoraFin(addMinutes(defaultHora ?? '20:00', 60))
    setPrecio('')
    setNotas('')
    setError('')
  }

  function handleClose() {
    setOpen(false)
    resetForm()
  }

  function handleInicioChange(value: string) {
    setHoraInicio(value)
    // Auto-adjust fin to maintain the same duration (default 1h)
    setHoraFin(addMinutes(value, 60))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cliente) { setError('Seleccioná un cliente'); return }
    if (!precio || isNaN(parseFloat(precio))) { setError('Ingresá un precio válido'); return }

    const inicio = argToUTC(date, horaInicio)
    const fin = argToUTC(date, horaFin)

    if (fin <= inicio) {
      setError('La hora de fin debe ser posterior al inicio')
      return
    }

    setError('')
    startTransition(async () => {
      const result = await createReserva({
        canchaId,
        clienteId: cliente.id,
        inicio,
        fin,
        precio: parseFloat(precio),
        notas: notas || undefined,
      })

      if (!result.ok) {
        toast.error(`Conflicto: ${result.error}`)
        setError(result.error)
        return
      }

      toast.success('Reserva creada')
      handleClose()
      onSuccess?.()
    })
  }

  return (
    <>
      <button
        type="button"
        id="btn-nueva-reserva"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Nueva reserva
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold">Nueva reserva</h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {/* Cliente */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Cliente *</label>
                <ClienteAutocomplete value={cliente} onChange={setCliente} />
              </div>

              {/* Cancha */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Cancha *</label>
                <select
                  id="booking-cancha"
                  value={canchaId}
                  onChange={(e) => setCanchaId(parseInt(e.target.value))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {canchas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Date + time */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-3 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground">Fecha *</label>
                  <input
                    type="date"
                    id="booking-fecha"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Inicio *</label>
                  <input
                    type="time"
                    id="booking-inicio"
                    value={horaInicio}
                    onChange={(e) => handleInicioChange(e.target.value)}
                    min="08:00"
                    max="23:30"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Fin *</label>
                  <input
                    type="time"
                    id="booking-fin"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    min="08:30"
                    max="24:00"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Duration shortcuts */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Duración:</span>
                {[60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setHoraFin(addMinutes(horaInicio, mins))}
                    className={cn(
                      'rounded px-2 py-0.5 text-xs border transition-colors',
                      horaFin === addMinutes(horaInicio, mins)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-accent border-border'
                    )}
                  >
                    {mins === 60 ? '1h' : mins === 90 ? '1h 30m' : '2h'}
                  </button>
                ))}
              </div>

              {/* Precio */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Precio (ARS) *</label>
                <input
                  type="number"
                  id="booking-precio"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  min="0"
                  step="100"
                  placeholder="0"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Notas */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Notas</label>
                <textarea
                  id="booking-notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  placeholder="Notas opcionales…"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
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
                    'flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground',
                    'hover:bg-primary/90 disabled:opacity-50'
                  )}
                >
                  {isPending ? 'Guardando…' : 'Guardar reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
