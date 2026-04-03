import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { NavClient } from '@/components/NavClient'

async function SignOutButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/login' })
      }}
    >
      <Button type="submit" variant="ghost" size="sm">
        Salir
      </Button>
    </form>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const isAdmin = session.user.rol === 'admin'

  const links = [
    { href: '/', label: 'Canchas' },
    { href: '/reservas', label: 'Calendario' },
    { href: '/turnos-fijos', label: 'Turnos Fijos' },
    { href: '/clientes', label: 'Clientes' },
    ...(isAdmin
      ? [
          { href: '/pagos', label: 'Pagos' },
          { href: '/configuracion/canchas', label: 'Config.' },
        ]
      : []),
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative border-b bg-card px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Site name — always visible */}
            <span className="font-semibold text-sm sm:text-base">
              Canchas
            </span>
            {/* Desktop nav + mobile hamburger */}
            <NavClient links={links} email={session.user.email ?? ''} />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden md:block">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
