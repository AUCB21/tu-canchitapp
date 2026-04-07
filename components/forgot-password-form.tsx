'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ForgotPasswordForm() {
  const [error, formAction, isPending] = useActionState(forgotPasswordAction, null)

  // null after submit = success (action returns null on success)
  const submitted = error === null && !isPending

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>Te enviamos un link para restablecer tu contraseña</CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="space-y-4">
            <p className="text-sm text-emerald-500">
              Revisá tu email — te enviamos un link para restablecer tu contraseña.
            </p>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="tu@email.com" required autoComplete="email" />
            </div>
            {typeof error === 'string' && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Enviando...' : 'Enviar link'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-foreground hover:underline font-medium">
                ← Volver al inicio
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
