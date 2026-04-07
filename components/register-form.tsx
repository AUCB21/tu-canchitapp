'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null)

  if (state === 'CONFIRM_EMAIL') {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Revisá tu email</CardTitle>
          <CardDescription>Te enviamos un link de confirmación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Hacé click en el link que te enviamos para activar tu cuenta.
          </p>
          <Link href="/login" className="text-sm text-foreground hover:underline font-medium">
            ← Volver al inicio
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Completá tus datos para registrarte</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
          </div>
          {state && state !== 'CONFIRM_EMAIL' && <p className="text-sm text-destructive">{state}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-foreground hover:underline font-medium">
              Ingresá
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
