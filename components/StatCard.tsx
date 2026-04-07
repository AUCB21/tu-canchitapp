import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: string // Tailwind text color class for the value
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn('text-2xl font-black tabular-nums leading-tight', accent)}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  )
}
