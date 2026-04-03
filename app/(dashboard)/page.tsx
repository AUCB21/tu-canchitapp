import { getCanchasConDisponibilidad } from '@/lib/queries/canchas'
import { CourtGrid } from '@/components/court-selector/CourtGrid'
import { DateNavigator } from '@/components/DateNavigator'

interface HomePageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { date: dateParam } = await searchParams

  // Default to today in Argentina time
  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date()) // returns "YYYY-MM-DD"

  const selectedDate = dateParam ?? today

  const canchas = await getCanchasConDisponibilidad(new Date(selectedDate + 'T00:00:00-03:00'))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Canchas</h1>
        <DateNavigator selectedDate={selectedDate} />
      </div>
      <CourtGrid canchas={canchas} dateParam={selectedDate} />
    </div>
  )
}
