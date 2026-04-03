// Time axis — left column of the BookingGrid, 08:00–24:00
export function TimeAxis() {
  const hours = Array.from({ length: 17 }, (_, i) => 8 + i) // 8..24

  return (
    <>
      {/* Empty top-left corner cell */}
      <div
        style={{ gridColumn: 1, gridRow: 1 }}
        className="sticky top-0 z-20 bg-card border-b border-r border-border"
      />
      {hours.map((hour, index) => (
        <div
          key={hour}
          style={{
            gridColumn: 1,
            gridRow: `${index * 2 + 2} / span 2`,
          }}
          className="sticky left-0 z-10 flex items-start justify-end border-r border-border bg-card pr-2 pt-0.5"
        >
          <span className="text-[10px] font-semibold tabular-nums text-muted-foreground/60 leading-none -translate-y-[0.5px]">
            {String(hour).padStart(2, '0')}:00
          </span>
        </div>
      ))}
    </>
  )
}
