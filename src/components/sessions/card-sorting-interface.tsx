// src/components/sessions/card-sorting-interface.tsx
"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Card } from "@/components/ui/card"
import { CategoryContainer } from "./category-container"
import { SortableCard } from "./sortable-card"
import type { Session, Card as CardType } from "@/types/session"
import { useSessionStore } from "@/store/session-store"

interface CardSortingInterfaceProps {
  session: Session
}

export function CardSortingInterface({ session }: CardSortingInterfaceProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const updateSession = useSessionStore((state) => state.updateSession)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeCardId = active.id as string
    const overCategoryId = over.id as string
    
    if (active.id !== over.id) {
      const updatedCategories = session.categories.map(category => {
        if (category.id === overCategoryId) {
          // Find the card in its current category
          let activeCard: CardType | undefined
          const oldCategoryIndex = session.categories.findIndex(cat => 
            cat.cards.some(card => card.id === activeCardId)
          )
          
          if (oldCategoryIndex !== -1) {
            const oldCategory = session.categories[oldCategoryIndex]
            const cardIndex = oldCategory.cards.findIndex(card => card.id === activeCardId)
            activeCard = oldCategory.cards[cardIndex]
            
            // Remove card from old category
            session.categories[oldCategoryIndex].cards.splice(cardIndex, 1)
          }
          
          if (activeCard) {
            // Add card to new category
            return {
              ...category,
              cards: [...category.cards, activeCard]
            }
          }
        }
        return category
      })
      
      try {
        await updateSession(session.id, {
          categories: updatedCategories
        })
      } catch (error) {
        console.error('Failed to update session:', error)
      }
    }
    
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {session.categories.map((category) => (
          <CategoryContainer key={category.id} category={category} />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <Card className="p-4 cursor-grabbing">
            {session.categories
              .flatMap((cat) => cat.cards)
              .find((card) => card.id === activeId)?.text}
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}