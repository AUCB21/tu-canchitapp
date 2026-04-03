import type { Cancha } from '@/lib/queries/canchas'

interface CourtHeaderProps {
  canchas: Pick<Cancha, 'id' | 'nombre' | 'tipo'>[]
}

// Each court gets a distinct gradient header — cycles through 6 palettes
const GRADIENTS = [
  'from-sky-600 to-sky-800',
  'from-violet-600 to-violet-800',
  'from-emerald-600 to-emerald-800',
  'from-amber-600 to-amber-800',
  'from-rose-600 to-rose-800',
  'from-indigo-600 to-indigo-800',
]

export function CourtHeader({ canchas }: CourtHeaderProps) {
  return (
    <>
      {canchas.map((cancha, index) => (
        <div
          key={cancha.id}
          style={{ gridColumn: index + 2, gridRow: 1 }}
          className={`sticky top-0 z-20 flex flex-col items-center justify-center gap-0.5 border-b border-l border-white/10 px-2 py-2 bg-gradient-to-b ${GRADIENTS[index % GRADIENTS.length]}`}
        >
          <span className="text-[11px] font-black text-white truncate max-w-full uppercase tracking-tight drop-shadow">
            {cancha.nombre}
          </span>
          <span className="text-[9px] leading-none text-white/70 font-semibold uppercase tracking-widest">
            {cancha.tipo === 'futbol5' ? 'F5' : 'F7'}
          </span>
        </div>
      ))}
    </>
  )
}
