'use server'

import { db } from '@/db'
import { seriesRecurrentes, reservas } from '@/db/schema'
import { and, eq, gt } from 'drizzle-orm'
import { requireRole } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { argToUTC } from '@/lib/utils'
import { addWeeks, getDay, nextDay, startOfDay, isAfter } from 'date-fns'
import type { InferSelectModel } from 'drizzle-orm'

export type SerieRecurrente = InferSelectModel<typeof seriesRecurrentes>

// Day of week mapping (0=SUN ... 6=SAT) same as JS Date.getDay()
type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6

function computeOccurrences(
  diaSemana: DiaSemana,
  horaInicio: string,
  horaFin: string,
  fechaInicio: Date,
  fechaFin: Date | null
): Array<{ inicio: Date; fin: Date }> {
  const occurrences: Array<{ inicio: Date; fin: Date }> = []

  // Find the first occurrence on or after fechaInicio with the correct weekday
  let current = startOfDay(fechaInicio)
  const dayOfCurrent = getDay(current)
  if (dayOfCurrent !== diaSemana) {
    // Advance to the next matching weekday
    const daysAhead = (diaSemana - dayOfCurrent + 7) % 7
    current = addWeeks(current, 0)
    current = new Date(current.getTime() + daysAhead * 24 * 60 * 60 * 1000)
  }

  // Generate up to 52 occurrences
  const endDate = fechaFin ?? addWeeks(fechaInicio, 52)

  while (!isAfter(current, endDate) && occurrences.length < 52) {
    const dateStr = current.toISOString().slice(0, 10)
    occurrences.push({
      inicio: argToUTC(dateStr, horaInicio),
      fin: argToUTC(dateStr, horaFin),
    })
    current = addWeeks(current, 1)
  }

  return occurrences
}

export async function createSerie(data: {
  canchaId: number
  clienteId: number
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
  precio: number
  fechaInicio: Date
  fechaFin?: Date
}): Promise<{ serieId: number; reservasCreadas: number }> {
  const session = await requireRole('staff')

  const result = await db.transaction(async (tx) => {
    // Insert the series definition
    const [serie] = await tx
      .insert(seriesRecurrentes)
      .values({
        canchaId: data.canchaId,
        clienteId: data.clienteId,
        diaSemana: data.diaSemana,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        precio: data.precio.toString(),
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin ?? null,
      })
      .returning()

    // Compute all occurrences
    const occurrences = computeOccurrences(
      data.diaSemana,
      data.horaInicio,
      data.horaFin,
      data.fechaInicio,
      data.fechaFin ?? null
    )

    if (occurrences.length > 0) {
      await tx.insert(reservas).values(
        occurrences.map((occ) => ({
          canchaId: data.canchaId,
          clienteId: data.clienteId,
          inicio: occ.inicio,
          fin: occ.fin,
          precio: data.precio.toString(),
          esRecurrente: true,
          serieId: serie.id,
          creadoPor: parseInt(session.user.id),
        }))
      )
    }

    return { serieId: serie.id, reservasCreadas: occurrences.length }
  })

  revalidatePath('/turnos-fijos')
  revalidatePath('/reservas')
  revalidatePath('/')
  return result
}

export async function cancelSerie(
  serieId: number,
  desdeInicio: Date
): Promise<{ canceladas: number }> {
  await requireRole('staff')

  const result = await db
    .update(reservas)
    .set({ estado: 'cancelada' })
    .where(
      and(
        eq(reservas.serieId, serieId),
        gt(reservas.inicio, desdeInicio)
      )
    )
    .returning({ id: reservas.id })

  // Mark series as inactive
  await db
    .update(seriesRecurrentes)
    .set({ activa: false })
    .where(eq(seriesRecurrentes.id, serieId))

  revalidatePath('/turnos-fijos')
  revalidatePath('/reservas')
  revalidatePath('/')
  return { canceladas: result.length }
}
