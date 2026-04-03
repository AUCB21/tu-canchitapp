export default function CalendarLoading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-7 w-36 rounded-lg animate-shimmer" />
        <div className="h-9 w-52 rounded-full animate-shimmer" />
      </div>
      {/* Calendar skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Header row */}
        <div className="flex h-[52px] border-b border-border">
          <div className="w-[52px] shrink-0 border-r border-border" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 border-l border-border p-2">
              <div className="h-4 w-16 mx-auto rounded animate-shimmer" />
            </div>
          ))}
        </div>
        {/* Body shimmer */}
        <div className="animate-shimmer h-full" />
      </div>
    </div>
  )
}
