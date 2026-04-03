'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { cancelSerie } from '@/lib/actions/series'
import type { SerieConRelaciones } from '@/lib/queries/series'
import { formatARS } from '@/lib/utils'
import { StarIcon, Trash2Icon, CalendarIcon } from 'lucide-react'
import { addDays, getDay, nextDay, format } from 'date-fns'
import { es } from 'date-fns/locale'

const DIAS_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/** Returns the next date (Argentina local) that falls on `diaSemana` (0=Sun..6=Sat) */
function nextOccurrence(diaSemana: number): string {
  const now = new Date()
  const todayDow = now.getDay()
  const daysAhead = (diaSemana - todayDow + 7) % 7
  const target = addDays(now, daysAhead === 0 ? 7 : daysAhead)
  return format(target, "EEE dd/MM", { locale: es })
}

interface CancelSerieButtonProps {
  serieId: number
}

function CancelSerieButton({ serieId }: CancelSerieButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    if (!confirm('¿Cancelar este turno fijo? Se cancelarán todas las reservas futuras.')) return
    startTransition(async () => {
      await cancelSerie(serieId, new Date())
      toast.success('Turno fijo cancelado')
    })
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
    >
      <Trash2Icon className="h-3.5 w-3.5" />
      {isPending ? 'Cancelando…' : 'Cancelar'}
    </button>
  )
}

interface SeriesListProps {
  series: SerieConRelaciones[]
}

export function SeriesList({ series }: SeriesListProps) {
  if (series.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
        <StarIcon className="h-8 w-8 opacity-30" />
        <p className="text-sm">No hay turnos fijos activos</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border divide-y">
      {series.map((serie) => {
        const proxima = nextOccurrence(serie.diaSemana)
        return (
          <div key={serie.id} className="flex items-center gap-4 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <StarIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium truncate">{serie.cliente.nombre}</p>
                <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  {DIAS_LABEL[serie.diaSemana]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {serie.cancha.nombre} · {serie.horaInicio}–{serie.horaFin} · {formatARS(serie.precio)}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-0.5">
                <CalendarIcon className="h-3 w-3" />
                Próximo: <span className="capitalize">{proxima}</span>
              </p>
            </div>
            <CancelSerieButton serieId={serie.id} />
          </div>
        )
      })}
    </div>
  )
}
