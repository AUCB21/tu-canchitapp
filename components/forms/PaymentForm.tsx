'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { logPago } from '@/lib/actions/pagos'
import { cn } from '@/lib/utils'
import { BanknoteIcon, SmartphoneIcon, XIcon } from 'lucide-react'

interface PaymentFormProps {
  reservaId: number
  precioTotal: number  // for display/context
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function PaymentForm({ reservaId, precioTotal, onSuccess, trigger }: PaymentFormProps) {
  const [open, setOpen] = useState(false)
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState<'efectivo' | 'transferencia'>('efectivo')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleClose() {
    setOpen(false)
    setMonto('')
    setMetodo('efectivo')
    setNotas('')
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(monto)
    if (!monto || isNaN(amount) || amount <= 0) {
      setError('Ingresá un monto válido')
      return
    }
    setError('')
    startTransition(async () => {
      await logPago({ reservaId, monto: amount, metodo, notas: notas || undefined })
      toast.success('Pago registrado')
      handleClose()
      onSuccess?.()
    })
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger ?? (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <BanknoteIcon className="h-3.5 w-3.5" />
            Registrar pago
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-sm rounded-xl border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold">Registrar pago</h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Monto (ARS) *</label>
                <input
                  type="number"
                  id="pago-monto"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  min="1"
                  step="100"
                  placeholder={precioTotal.toString()}
                  autoFocus
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Método *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['efectivo', 'transferencia'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetodo(m)}
                      className={cn(
                        'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                        metodo === m
                          ? 'border-primary bg-primary/10 font-medium text-primary'
                          : 'hover:bg-accent'
                      )}
                    >
                      {m === 'efectivo'
                        ? <BanknoteIcon className="h-4 w-4" />
                        : <SmartphoneIcon className="h-4 w-4" />
                      }
                      <span className="capitalize">{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Notas</label>
                <input
                  type="text"
                  id="pago-notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Opcional…"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
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
                  className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isPending ? 'Guardando…' : 'Guardar pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
