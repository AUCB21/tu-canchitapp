// Time axis — left column of the BookingGrid, 08:00–24:00
export function TimeAxis() {
  const hours = Array.from({ length: 17 }, (_, i) => 8 + i) // 8..24

  return (
    <>
      {/* Empty top-left cell (aligns with CourtHeader) */}
      <div
        style={{ gridColumn: 1, gridRow: 1 }}
        className="sticky top-0 z-20 bg-background border-b border-r"
      />
      {hours.map((hour, index) => (
        <div
          key={hour}
          style={{ gridColumn: 1, gridRow: index + 2 }}
          className="sticky left-0 z-10 flex items-start justify-end border-r border-border bg-background pr-2 pt-1"
        >
          <span className="text-[10px] font-medium tabular-nums text-muted-foreground leading-none">
            {String(hour).padStart(2, '0')}:00
          </span>
        </div>
      ))}
    </>
  )
}
