// src/components/sessions/sortable-card.tsx
"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import type { Card as CardType } from "@/types/session"

interface SortableCardProps {
  card: CardType
}

export function SortableCard({ card }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 cursor-move border-2 hover:border-primary/50 transition-colors"
      {...attributes}
      {...listeners}
    >
      {card.text}
    </Card>
  )
}