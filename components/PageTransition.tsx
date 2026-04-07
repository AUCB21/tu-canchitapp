'use client'

import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // key={pathname} forces React to remount this div on every route change,
  // re-triggering the CSS fade-up entrance animation. This is intentional —
  // without it, navigating between pages would not replay the animation.
  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  )
}
