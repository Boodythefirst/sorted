// src/components/participant/unsorted-cards.tsx
"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { Card } from "@/components/ui/card"
import { SortableCard } from "./sortable-card"
import type { Card as CardType } from "@/types/session"

interface UnsortedCardsProps {
  cards: CardType[]
}

export function UnsortedCards({ cards }: UnsortedCardsProps) {
  const { setNodeRef } = useDroppable({
    id: "unsorted",
  })

  return (
    <Card className="p-4">
      <div className="font-semibold mb-4">
        Unsorted Cards ({cards.length})
      </div>
      <div
        ref={setNodeRef}
        className="min-h-[100px] p-4 rounded-lg bg-muted/50"
      >
        <SortableContext items={cards} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
        {cards.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-4">
            No unsorted cards
          </div>
        )}
      </div>
    </Card>
  )
}