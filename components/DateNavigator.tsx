'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface DateNavigatorProps {
  selectedDate: string  // "YYYY-MM-DD"
  basePath?: string     // defaults to "/"
}

export function DateNavigator({ selectedDate, basePath = '/' }: DateNavigatorProps) {
  const router = useRouter()
  const date  = parseISO(selectedDate)
  const label = format(date, 'EEE dd/MM/yyyy', { locale: es })

  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date())
  const isToday = selectedDate === today

  function navigate(days: number) {
    const next    = addDays(date, days)
    const dateStr = format(next, 'yyyy-MM-dd')
    const sep     = basePath.includes('?') ? '&' : '?'
    router.push(`${basePath}${sep}date=${dateStr}`)
  }

  return (
    <div className="flex items-center rounded-full border-2 border-primary/25 bg-card p-0.5 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        aria-label="Día anterior"
        className="h-7 w-7 rounded-full hover:bg-primary/10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5 px-2">
        {isToday && (
          <span
            className="animate-pulse-dot h-2 w-2 rounded-full bg-emerald-500 shrink-0"
            aria-label="Hoy"
          />
        )}
        <span className="min-w-[140px] text-center text-sm font-bold capitalize tabular-nums">
          {label}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(1)}
        aria-label="Día siguiente"
        className="h-7 w-7 rounded-full hover:bg-primary/10"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
