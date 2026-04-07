import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NavClient } from '@/components/NavClient'
import { PageTransition } from '@/components/PageTransition'

async function signOutAction() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

async function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
      >
        Salir
      </button>
    </form>
  )
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, user.id)).limit(1)
  if (!usuario) redirect('/login')

  const isAdmin = usuario.rol === 'admin'

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
        email={user.email ?? ''}
        signOutButton={<SignOutButton />}
      />
      <div className="pt-14 md:pt-0 md:pl-56">
        <main className="mx-auto max-w-5xl px-4 py-6 md:px-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
