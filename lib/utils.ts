import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ARG_TZ = 'America/Argentina/Buenos_Aires'

/** Format ARS amount from string or number */
export function formatARS(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(num)
}

/** Format a UTC Date as "HH:mm" in Argentine time */
export function toArgTime(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: ARG_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/** Format a UTC Date as "Mié 02/04" in Argentine time */
export function toArgDateShort(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: ARG_TZ,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

/** Return "YYYY-MM-DD" for a Date in Argentine time */
export function toArgDateParam(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: ARG_TZ }).format(date)
}

/** Given "YYYY-MM-DD" and "HH:mm", return a UTC Date (interpreting as Argentina UTC-3) */
export function argToUTC(dateStr: string, timeStr: string): Date {
  // Argentina is always UTC-3
  return new Date(`${dateStr}T${timeStr}:00-03:00`)
}

