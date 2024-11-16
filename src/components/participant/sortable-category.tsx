// src/components/participant/sortable-category.tsx
"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SortableCard } from "./sortable-card"
import type { Card as CardType, Category } from "@/types/session"

interface SortableCategoryProps {
  category: Category
  cards: CardType[]
}

export function SortableCategory({ category, cards }: SortableCategoryProps) {
  const { setNodeRef } = useDroppable({
    id: category.id,
  })

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{category.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-3">
        <div
          ref={setNodeRef}
          className="min-h-[300px] overflow-y-auto p-4 rounded-lg bg-muted/50 space-y-2"
          style={{
            maxHeight: 'calc(70vh - 100px)',
          }}
        >
          <SortableContext items={cards} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} />
            ))}
          </SortableContext>
          {cards.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-4">
              Drop cards here
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}