// src/components/sessions/category-container.tsx
"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SortableCard } from "./sortable-card"
import type { Category } from "@/types/session"

interface CategoryContainerProps {
  category: Category
}

export function CategoryContainer({ category }: CategoryContainerProps) {
  const { setNodeRef } = useDroppable({
    id: category.id,
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{category.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className="space-y-2 min-h-[200px] p-4 rounded-lg bg-muted/50"
        >
          <SortableContext
            items={category.cards}
            strategy={verticalListSortingStrategy}
          >
            {category.cards.map((card) => (
              <SortableCard key={card.id} card={card} />
            ))}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  )
}