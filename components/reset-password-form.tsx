'use client'

import { useActionState } from 'react'
import { resetPasswordAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ResetPasswordForm() {
  const [error, formAction, isPending] = useActionState(resetPasswordAction, null)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Nueva contraseña</CardTitle>
        <CardDescription>Elegí una nueva contraseña para tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
