'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { MenuIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
}

interface NavClientProps {
  links: NavLink[]
  email: string
}

export function NavClient({ links, email }: NavClientProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              isActive(link.href)
                ? 'bg-accent font-semibold text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger button */}
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setMobileOpen((v) => !v)}
        className="flex sm:hidden items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-30 border-b bg-card shadow-lg sm:hidden">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2.5 text-sm transition-colors',
                  isActive(link.href)
                    ? 'bg-accent font-semibold text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t mt-2 pt-2">
              <p className="px-3 py-1 text-xs text-muted-foreground">{email}</p>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
