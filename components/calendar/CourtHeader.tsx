import type { Cancha } from '@/lib/queries/canchas'

interface CourtHeaderProps {
  canchas: Pick<Cancha, 'id' | 'nombre' | 'tipo'>[]
}

export function CourtHeader({ canchas }: CourtHeaderProps) {
  return (
    <>
      {canchas.map((cancha, index) => (
        <div
          key={cancha.id}
          style={{ gridColumn: index + 2, gridRow: 1 }}
          className="sticky top-0 z-20 flex flex-col items-center justify-center border-b border-l bg-card px-2 py-2"
        >
          <span className="text-xs font-semibold truncate max-w-full">{cancha.nombre}</span>
          <span className="text-[10px] text-muted-foreground capitalize">
            {cancha.tipo === 'futbol5' ? 'Fútbol 5' : 'Fútbol 7'}
          </span>
        </div>
      ))}
    </>
  )
}
