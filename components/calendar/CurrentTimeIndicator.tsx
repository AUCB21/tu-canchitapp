'use client'

import { useEffect, useState } from 'react'

const DAY_START_HOUR = 8
const SLOT_MINUTES = 30
const TOTAL_SLOTS = ((24 - DAY_START_HOUR) * 60) / SLOT_MINUTES // 32
const TOTAL_COURTS = 1 // used for col-span; overridden via prop

interface CurrentTimeIndicatorProps {
  numCourts: number
  selectedDate: string // "YYYY-MM-DD" — only show on today
}

function getArgentineDate(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date())
}

function getCurrentArgHourMinute(): { hour: number; minute: number } {
  const d = new Date()
  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0')
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0')
  return { hour, minute }
}

export function CurrentTimeIndicator({ numCourts, selectedDate }: CurrentTimeIndicatorProps) {
  const [now, setNow] = useState(getCurrentArgHourMinute)
  const isToday = selectedDate === getArgentineDate()

  useEffect(() => {
    if (!isToday) return
    const interval = setInterval(() => setNow(getCurrentArgHourMinute()), 60_000)
    return () => clearInterval(interval)
  }, [isToday])

  if (!isToday) return null

  const { hour, minute } = now
  if (hour < DAY_START_HOUR || hour >= 24) return null

  // fractional slot position (each slot = 30 min)
  const slotFrac = ((hour - DAY_START_HOUR) * 60 + minute) / SLOT_MINUTES
  // row 1 = header, rows 2..33 = slots
  // We use a fractional position via a span that covers one slot row with a top offset %
  const slotRow = Math.floor(slotFrac) + 2
  const offsetPercent = (slotFrac % 1) * 100

  return (
    <div
      style={{
        gridColumn: `2 / span ${numCourts}`,
        gridRow: slotRow,
        top: `${offsetPercent}%`,
        zIndex: 15,
        pointerEvents: 'none',
      }}
      className="relative"
      aria-hidden="true"
    >
      <div className="absolute left-0 right-0 flex items-center" style={{ top: `${offsetPercent}%` }}>
        <div className="h-2 w-2 rounded-full bg-red-500 shrink-0 -ml-1" />
        <div className="flex-1 h-px bg-red-500 opacity-80" />
      </div>
    </div>
  )
}
