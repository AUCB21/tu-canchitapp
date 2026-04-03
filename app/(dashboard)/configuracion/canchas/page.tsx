import { requireRole } from '@/lib/auth-utils'
import { getCanchas } from '@/lib/queries/canchas'
import { CourtList } from '@/components/canchas/CourtList'
import { CourtForm } from '@/components/canchas/CourtForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function ConfiguracionCanchasPage() {
  await requireRole('admin')
  const canchas = await getCanchas()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Configuración de canchas</h1>
          <p className="text-sm text-muted-foreground">
            Arrastrá para reordenar. El orden se refleja en la pantalla principal.
          </p>
        </div>
        <CourtForm
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva cancha
            </Button>
          }
        />
      </div>

      {canchas.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No hay canchas. Agregá la primera con el botón &quot;Nueva cancha&quot;.
        </p>
      ) : (
        <CourtList initialCanchas={canchas} />
      )}
    </div>
  )
}
