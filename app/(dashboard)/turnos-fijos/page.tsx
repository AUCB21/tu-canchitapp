import { getSeries } from '@/lib/queries/series'
import { getCanchas } from '@/lib/queries/canchas'
import { SeriesForm } from '@/components/forms/SeriesForm'
import { SeriesList } from '@/components/canchas/SeriesList'

export default async function TurnosFijosPage() {
  const [series, canchas] = await Promise.all([getSeries(), getCanchas()])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Turnos Fijos</h1>
          <p className="text-sm text-muted-foreground">
            {series.length} {series.length === 1 ? 'turno activo' : 'turnos activos'}
          </p>
        </div>
        <SeriesForm canchas={canchas} />
      </div>
      <SeriesList series={series} />
    </div>
  )
}
