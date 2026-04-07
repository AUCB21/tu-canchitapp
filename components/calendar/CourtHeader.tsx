import type { Cancha } from '@/lib/queries/canchas'
import { cn } from '@/lib/utils'

interface CourtHeaderProps {
  canchas: Pick<Cancha, 'id' | 'nombre' | 'tipo'>[]
}

const TIPO_BADGE: Record<string, string> = {
  futbol5: 'bg-sky-500/20 text-sky-300',
  futbol7: 'bg-violet-500/20 text-violet-300',
}

export function CourtHeader({ canchas }: CourtHeaderProps) {
  return (
    <>
      {canchas.map((cancha, index) => (
        <div
          key={cancha.id}
          style={{ gridColumn: index + 2, gridRow: 1 }}
          className="sticky top-0 z-20 flex items-center justify-center gap-1.5 border-b border-l border-border/50 px-2 py-2 bg-sidebar"
        >
          <span className="text-[11px] font-black text-sidebar-foreground truncate max-w-full uppercase tracking-tight">
            {cancha.nombre}
          </span>
          <span className={cn(
            'shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
            TIPO_BADGE[cancha.tipo],
          )}>
            {cancha.tipo === 'futbol5' ? 'F5' : 'F7'}
          </span>
        </div>
      ))}
    </>
  )
}
