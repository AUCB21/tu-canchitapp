import { getCanchas } from '@/lib/queries/canchas'
import { getReservasForDayAllCanchas } from '@/lib/queries/reservas'
import { BookingGrid } from '@/components/calendar/BookingGrid'
import { BookingForm } from '@/components/forms/BookingForm'
import { DateNavigator } from '@/components/DateNavigator'

interface ReservasPageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function ReservasPage({ searchParams }: ReservasPageProps) {
  const { date: dateParam } = await searchParams

  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date())

  const selectedDate = dateParam ?? today
  const dateObj = new Date(selectedDate + 'T00:00:00-03:00')

  const [canchas, reservas] = await Promise.all([
    getCanchas(),
    getReservasForDayAllCanchas(dateObj),
  ])

  // Display date formatted
  const displayDate = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Calendario</h1>
          <p className="text-sm text-muted-foreground capitalize">{displayDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <DateNavigator selectedDate={selectedDate} />
          <BookingForm
            canchas={canchas}
            defaultDate={selectedDate}
          />
        </div>
      </div>

      <BookingGrid canchas={canchas} reservas={reservas} />
    </div>
  )
}
