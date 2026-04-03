'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CourtForm } from './CourtForm'
import { deleteCancha, reorderCanchas } from '@/lib/actions/canchas'
import type { Cancha } from '@/lib/queries/canchas'

const TIPO_LABEL: Record<string, string> = {
  futbol5: 'Fútbol 5',
  futbol7: 'Fútbol 7',
}

function SortableRow({ cancha }: { cancha: Cancha }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cancha.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 font-medium">{cancha.nombre}</span>
      <Badge variant="secondary">{TIPO_LABEL[cancha.tipo]}</Badge>
      <CourtForm
        cancha={cancha}
        trigger={
          <Button variant="ghost" size="icon" aria-label={`Editar ${cancha.nombre}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Eliminar ${cancha.nombre}`}
        onClick={() => deleteCancha(cancha.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}

interface CourtListProps {
  initialCanchas: Cancha[]
}

export function CourtList({ initialCanchas }: CourtListProps) {
  const [items, setItems] = useState(initialCanchas)

  useEffect(() => {
    setItems(initialCanchas)
  }, [initialCanchas])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((c) => c.id === active.id)
    const newIndex = items.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)

    setItems(reordered)
    reorderCanchas(reordered.map((c) => c.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((cancha) => (
            <SortableRow key={cancha.id} cancha={cancha} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
