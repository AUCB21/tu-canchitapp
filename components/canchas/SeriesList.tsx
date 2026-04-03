'use client'

import { useState, useTransition } from 'react'
import { cancelSerie } from '@/lib/actions/series'
import type { SerieConRelaciones } from '@/lib/queries/series'
import { formatARS } from '@/lib/utils'
import { StarIcon, Trash2Icon } from 'lucide-react'

const DIAS_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface CancelSerieButtonProps {
  serieId: number
}

function CancelSerieButton({ serieId }: CancelSerieButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    if (!confirm('¿Cancelar este turno fijo? Se cancelarán todas las reservas futuras.')) return
    startTransition(async () => {
      await cancelSerie(serieId, new Date())
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
      {isPending ? 'Cancelando…' : 'Cancelar serie'}
    </button>
  )
}

interface SeriesListProps {
  series: SerieConRelaciones[]
}

export function SeriesList({ series }: SeriesListProps) {
  if (series.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No hay turnos fijos activos</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border divide-y">
      {series.map((serie) => (
        <div key={serie.id} className="flex items-center gap-4 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <StarIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{serie.cliente.nombre}</p>
              <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                {DIAS_LABEL[serie.diaSemana]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {serie.cancha.nombre} · {serie.horaInicio}–{serie.horaFin} · {formatARS(serie.precio)}
            </p>
            {serie.cliente.telefono && (
              <p className="text-xs text-muted-foreground">{serie.cliente.telefono}</p>
            )}
          </div>
          <CancelSerieButton serieId={serie.id} />
        </div>
      ))}
    </div>
  )
}
