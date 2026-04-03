'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCancha, updateCancha } from '@/lib/actions/canchas'
import type { Cancha } from '@/lib/queries/canchas'
import { useState } from 'react'

type ActionState = { error?: string } | null

async function createAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await createCancha({
      nombre: formData.get('nombre') as string,
      tipo: formData.get('tipo') as 'futbol5' | 'futbol7',
    })
    return null
  } catch {
    return { error: 'Error al crear la cancha' }
  }
}

async function editAction(
  id: number,
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await updateCancha(id, {
      nombre: formData.get('nombre') as string,
      tipo: formData.get('tipo') as 'futbol5' | 'futbol7',
    })
    return null
  } catch {
    return { error: 'Error al actualizar la cancha' }
  }
}

interface CourtFormProps {
  cancha?: Cancha
  trigger: React.ReactElement
}

export function CourtForm({ cancha, trigger }: CourtFormProps) {
  const [open, setOpen] = useState(false)

  const boundAction = cancha
    ? editAction.bind(null, cancha.id)
    : createAction

  const [state, formAction, isPending] = useActionState(boundAction, null)

  function handleSuccess(formData: FormData) {
    formAction(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{cancha ? 'Editar cancha' : 'Nueva cancha'}</DialogTitle>
        </DialogHeader>
        <form action={handleSuccess} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Cancha 1"
              defaultValue={cancha?.nombre}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select name="tipo" defaultValue={cancha?.tipo ?? 'futbol5'} required>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Tipo de cancha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="futbol5">Fútbol 5</SelectItem>
                <SelectItem value="futbol7">Fútbol 7</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
