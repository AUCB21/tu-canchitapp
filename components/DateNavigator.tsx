'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface DateNavigatorProps {
  selectedDate: string // "YYYY-MM-DD"
}

export function DateNavigator({ selectedDate }: DateNavigatorProps) {
  const router = useRouter()
  const date = parseISO(selectedDate)

  const label = format(date, "EEE dd/MM/yyyy", { locale: es })

  function navigate(days: number) {
    const next = addDays(date, days)
    router.push(`/?date=${format(next, 'yyyy-MM-dd')}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(-1)}
        aria-label="Día anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[160px] text-center text-sm font-medium capitalize">
        {label}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(1)}
        aria-label="Día siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
