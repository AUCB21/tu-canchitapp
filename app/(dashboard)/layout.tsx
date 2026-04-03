import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/auth'
import { Button } from '@/components/ui/button'

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <nav className="flex items-center gap-4">
            <Link href="/" className="font-semibold">
              Canchas
            </Link>
            <Link href="/reservas" className="text-sm text-muted-foreground hover:text-foreground">
              Calendario
            </Link>
            <Link href="/turnos-fijos" className="text-sm text-muted-foreground hover:text-foreground">
              Turnos Fijos
            </Link>
            <Link href="/clientes" className="text-sm text-muted-foreground hover:text-foreground">
              Clientes
            </Link>
            {session.user.rol === 'admin' && (
              <>
                <Link
                  href="/pagos"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Pagos
                </Link>
                <Link
                  href="/configuracion/canchas"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Configuración
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
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
