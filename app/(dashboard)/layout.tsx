import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/auth'
import { NavClient } from '@/components/NavClient'
import { PageTransition } from '@/components/PageTransition'

async function SignOutButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/login' })
      }}
    >
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
      >
        Salir
      </button>
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
    <div className="min-h-screen bg-background">
      <NavClient
        links={links}
        email={session.user.email ?? ''}
        signOutButton={<SignOutButton />}
      />
      {/* pt-14 accounts for fixed mobile top bar; md:pl-56 for fixed desktop sidebar */}
      <div className="pt-14 md:pt-0 md:pl-56">
        <main className="mx-auto max-w-5xl px-4 py-6 md:px-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
