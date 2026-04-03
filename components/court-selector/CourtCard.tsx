'use client'

import type { CanchaConDisponibilidad } from '@/lib/queries/canchas'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STATUS: Record<
  CanchaConDisponibilidad['disponibilidad'],
  { border: string; badge: string; label: string }
> = {
  libre: {
    border: 'border-emerald-500/70 hover:border-emerald-400',
    badge: 'bg-emerald-500 text-white',
    label: 'Libre',
  },
  ocupada: {
    border: 'border-red-500/70 hover:border-red-400',
    badge: 'bg-red-500 text-white',
    label: 'Ocupada',
  },
}

const TIPO_BADGE: Record<string, string> = {
  futbol5: 'bg-sky-500/20 text-sky-300',
  futbol7: 'bg-violet-500/20 text-violet-300',
}

const TIPO_LABEL: Record<string, string> = {
  futbol5: 'Fútbol 5',
  futbol7: 'Fútbol 7',
}

/**
 * Portrait football pitch based on the provided reference SVG.
 * ViewBox: 0 0 61 116 (pitch 55×110 + 3px margin each side).
 * Grass: horizontal alternating stripes (dark/light green).
 * Lines: FIFA-proportioned — penalty area, goal area, penalty arc, corner arcs.
 */
/**
 * Landscape football pitch — reference SVG rotated 90°.
 * ViewBox: 0 0 116 61 (pitch 110×55 + 3px margin each side).
 * Grass: vertical alternating stripes (dark/light green).
 * Lines: same FIFA proportions, axes swapped (x↔y from portrait version).
 */
function FootballPitch() {
  // Vertical stripes (run top-to-bottom, alternate left-to-right)
  const stripes: Array<{ x: number; w: number; dark: boolean }> = []
  let x = 0
  let dark = true
  for (const w of [3, ...Array(21).fill(6)]) {
    stripes.push({ x, w, dark })
    x += w
    dark = !dark
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 116 61"
      className="w-full h-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/*
          Penalty left half — goal opens to the left (x=0).
          Axes swapped from portrait: original y→x, original x→y.
          penalty area: original "M 7.34 0 v 16.5 h 40.32 v -16.5"
            → "M 0 7.34 h 16.5 v 40.32 h -16.5"
          goal area: original "M 18.34 0 v 5.5 h 18.32 v -5.5"
            → "M 0 18.34 h 5.5 v 18.32 h -5.5"
          penalty spot: original cx=27.5 cy=11 → cx=11 cy=27.5
          penalty arc: original "M 22.95 16.5 a 9.1 9.1 0 0 0 9.1 0"
            → "M 16.5 22.95 a 9.1 9.1 0 0 1 0 9.1"
          goal frame: original translate(23.84 -2.5), path along y
            → translate(-2.5 23.84), path along x
        */}
        <g id="penalty-left">
          {/* Goal frame */}
          <g transform="translate(-2.5 23.84)">
            <path d="M 2.44 0 L 0 0 L 0 7.32 L 2.44 7.32" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.25" />
          </g>
          {/* Penalty area */}
          <path d="M 0 7.34 h 16.5 v 40.32 h -16.5" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.18" />
          {/* Goal area */}
          <path d="M 0 18.34 h 5.5 v 18.32 h -5.5" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.18" />
          {/* Penalty spot */}
          <circle cx="11" cy="27.5" r="0.3" fill="rgba(255,255,255,0.85)" />
          {/* Penalty arc */}
          <path d="M 16.5 22.95 a 9.1 9.1 0 0 1 0 9.1" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.18" />
        </g>
      </defs>

      {/* Vertical grass stripes */}
      {stripes.map(({ x: sx, w, dark: isDark }, i) => (
        <rect key={i} x={sx} y="0" width={w} height="61" fill={isDark ? '#3E7B3E' : '#4A934A'} />
      ))}

      {/* Pitch lines — translate(3,3) for margin */}
      <g fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.18" transform="translate(3 3)">
        {/* Boundary: 110 wide × 55 tall */}
        <path d="M 0 0 h 110 v 55 h -110 Z" />
        {/* Halfway line — vertical */}
        <path d="M 55 0 v 55" />
        {/* Center circle */}
        <circle r="9.1" cx="55" cy="27.5" />
        {/* Center dot */}
        <circle r="0.3" cx="55" cy="27.5" fill="rgba(255,255,255,0.85)" stroke="none" />
        {/* Left penalty half */}
        <use href="#penalty-left" />
        {/* Right penalty half — rotated 180° around center */}
        <use href="#penalty-left" transform="rotate(180, 55, 27.5)" />
        {/* Corner arcs — same path rotated to each corner */}
        <path d="M 1 0 a 3 3 0 0 0 -1 1" />
        <path d="M 1 0 a 3 3 0 0 0 -1 1" transform="translate(110 55) rotate(180, 0, 0)" />
        <path d="M 1 0 a 3 3 0 0 0 -1 1" transform="translate(0 55) rotate(270, 0, 0)" />
        <path d="M 1 0 a 3 3 0 0 0 -1 1" transform="translate(110 0) rotate(90, 0, 0)" />
      </g>
    </svg>
  )
}

interface CourtCardProps {
  cancha: CanchaConDisponibilidad
  dateParam: string
}

export function CourtCard({ cancha, dateParam }: CourtCardProps) {
  const { border, badge, label } = STATUS[cancha.disponibilidad]
  const slotsLibres = cancha.slotsTotales - cancha.slotsOcupados

  return (
    <Link
      href={`/reservas?canchaId=${cancha.id}&date=${dateParam}`}
      aria-label={`${cancha.nombre} — ${TIPO_LABEL[cancha.tipo]} — ${label}`}
      className={cn(
        'group flex flex-col rounded-xl border-2 bg-card overflow-hidden',
        'shadow-sm hover:shadow-xl transition-all duration-200',
        'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
        border,
      )}
    >
      {/* Pitch — landscape aspect matches 116:61 viewBox */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '116 / 61' }}>
        <FootballPitch />

        {/* Name overlay at bottom of pitch */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2.5 pt-6 pb-2">
          <p className="text-white text-xs font-black leading-tight drop-shadow tracking-tight truncate">
            {cancha.nombre}
          </p>
        </div>
      </div>

      {/* Info strip */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-card">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn(
            'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
            TIPO_BADGE[cancha.tipo],
          )}>
            {TIPO_LABEL[cancha.tipo]}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
            {slotsLibres}/{cancha.slotsTotales} hs libres
          </span>
        </div>

        <span className={cn(
          'shrink-0 animate-badge-pop rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
          badge,
        )}>
          {label}
        </span>
      </div>
    </Link>
  )
}
