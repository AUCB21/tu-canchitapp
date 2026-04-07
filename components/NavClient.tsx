'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import {
  MenuIcon, XIcon, SunIcon, MoonIcon,
  LayoutGridIcon, CalendarIcon, RepeatIcon,
  UsersIcon, ReceiptIcon, Settings2Icon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
}

interface NavClientProps {
  links: NavLink[]
  email: string
  signOutButton: React.ReactNode
}

const LINK_ICONS: Record<string, React.ElementType> = {
  '/': LayoutGridIcon,
  '/reservas': CalendarIcon,
  '/turnos-fijos': RepeatIcon,
  '/clientes': UsersIcon,
  '/pagos': ReceiptIcon,
  '/configuracion/canchas': Settings2Icon,
}

// Detect client-side mount without triggering React Compiler's set-state-in-effect rule
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

function useIsMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const mounted = useIsMounted()

  return (
    <button
      type="button"
      aria-label="Cambiar tema"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-sidebar-accent',
        className,
      )}
    >
      {!mounted
        ? <span className="h-4 w-4" />
        : theme === 'dark'
          ? <SunIcon className="h-4 w-4 text-sidebar-foreground/70" />
          : <MoonIcon className="h-4 w-4 text-sidebar-foreground/70" />
      }
    </button>
  )
}

function NavLinks({
  links,
  pathname,
  onClick,
}: {
  links: NavLink[]
  pathname: string
  onClick?: () => void
}) {
  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex flex-col gap-0.5">
      {links.map((link) => {
        const Icon = LINK_ICONS[link.href]
        const active = isActive(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function NavClient({ links, email, signOutButton }: NavClientProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-56 md:flex-col bg-sidebar border-r border-sidebar-border z-40">
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5 border-b border-sidebar-border">
          <span className="text-2xl leading-none">⚽</span>
          <span className="font-black text-base tracking-tight text-sidebar-foreground uppercase">
            Tu Canchitapp
          </span>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <NavLinks links={links} pathname={pathname} />
        </div>

        {/* User + sign out */}
        <div className="border-t border-sidebar-border px-3 py-4 space-y-2">
          <div className="flex items-center justify-between px-3">
            <p className="truncate text-xs text-sidebar-foreground/40">{email}</p>
            <ThemeToggle />
          </div>
          {signOutButton}
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b bg-sidebar text-sidebar-foreground px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">⚽</span>
          <span className="font-black tracking-tight text-sidebar-foreground uppercase text-sm">
            Tu Canchitapp
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 hover:bg-sidebar-accent transition-colors"
          >
            {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="flex w-64 flex-col bg-sidebar border-r border-sidebar-border pt-14">
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <NavLinks links={links} pathname={pathname} onClick={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-sidebar-border px-3 py-4 space-y-2">
              <p className="truncate px-3 text-xs text-sidebar-foreground/40">{email}</p>
              {signOutButton}
            </div>
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  )
}
