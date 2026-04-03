import { CourtGridSkeleton } from '@/components/court-selector/CourtGrid'

export default function HomeLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-7 w-28 rounded-lg animate-shimmer" />
        <div className="h-9 w-52 rounded-full animate-shimmer" />
      </div>
      <CourtGridSkeleton />
    </div>
  )
}
