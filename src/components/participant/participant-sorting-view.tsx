// src/components/participant/participant-sorting-view.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParticipantStore } from "@/store/participant-store"
import { Loading } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Card as CardType } from "@/types/session"

interface ParticipantSortingViewProps {
  code: string
}

export function ParticipantSortingView({ code }: ParticipantSortingViewProps) {
  const router = useRouter()
  const { currentSession, error, isLoading, joinSession, submitSort } = useParticipantStore()
  const [unsortedCards, setUnsortedCards] = useState<CardType[]>([])
  const [categoryCards, setCategoryCards] = useState<Record<string, CardType[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draggedCard, setDraggedCard] = useState<CardType | null>(null)
  const [draggedOverCategory, setDraggedOverCategory] = useState<string | null>(null)

  useEffect(() => {
    const initSession = async () => {
      if (!currentSession) {
        try {
          await joinSession(code)
        } catch (error) {
          console.error('Failed to join session:', error)
          router.push('/join')
        }
      }
    }

    initSession()
  }, [code, currentSession, joinSession, router])

  useEffect(() => {
    if (currentSession) {
      setUnsortedCards(currentSession.cards)
      const initialCategoryCards: Record<string, CardType[]> = {}
      currentSession.categories.forEach(category => {
        initialCategoryCards[category.id] = []
      })
      setCategoryCards(initialCategoryCards)
    }
  }, [currentSession])

  const handleDragStart = (e: React.DragEvent, card: CardType) => {
    setDraggedCard(card)
    
    // Create a custom drag image
    const dragPreview = document.createElement('div')
    dragPreview.className = 'fixed pointer-events-none bg-background border rounded-lg shadow-lg p-4 w-[200px]'
    dragPreview.innerHTML = card.text
    document.body.appendChild(dragPreview)
    
    // Set the custom drag image
    e.dataTransfer.setDragImage(dragPreview, 100, 30)
    
    // Add drag styling
    e.currentTarget.classList.add('opacity-50', 'border-primary', 'border-2', 'border-dashed')
    
    // Remove the preview element after drag starts
    requestAnimationFrame(() => {
      document.body.removeChild(dragPreview)
    })
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50', 'border-primary', 'border-2', 'border-dashed')
    setDraggedOverCategory(null)
  }

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDraggedOverCategory(categoryId)
  }

  const handleDragLeave = () => {
    setDraggedOverCategory(null)
  }

  const handleDrop = (categoryId: string | 'unsorted') => {
    if (!draggedCard) return

    // Find the current location of the card
    let sourceContainer = 'unsorted'
    if (!unsortedCards.find(c => c.id === draggedCard.id)) {
      Object.entries(categoryCards).forEach(([id, cards]) => {
        if (cards.find(c => c.id === draggedCard.id)) {
          sourceContainer = id
        }
      })
    }

    // Don't do anything if dropped in the same container
    if (sourceContainer === categoryId) return

    // Remove from source
    if (sourceContainer === 'unsorted') {
      setUnsortedCards(prev => prev.filter(c => c.id !== draggedCard.id))
    } else {
      setCategoryCards(prev => ({
        ...prev,
        [sourceContainer]: prev[sourceContainer].filter(c => c.id !== draggedCard.id)
      }))
    }

    // Add to destination
    if (categoryId === 'unsorted') {
      setUnsortedCards(prev => [...prev, draggedCard])
    } else {
      setCategoryCards(prev => ({
        ...prev,
        [categoryId]: [...prev[categoryId], draggedCard]
      }))
    }

    setDraggedOverCategory(null)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const participantSort = {
        sessionId: currentSession!.sessionId,
        participantId: crypto.randomUUID(),
        categories: Object.entries(categoryCards).map(([categoryId, cards]) => ({
          id: categoryId,
          name: currentSession!.categories.find(c => c.id === categoryId)?.name || '',
          cardIds: cards.map(card => card.id)
        }))
      }
      
      await submitSort(participantSort)
      router.push('/sort/complete')
    } catch (error) {
      console.error('Failed to submit sort:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !currentSession) {
    return <Loading />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Card Sorting Session</h1>
        <p className="text-muted-foreground">
          Drag cards into categories that make sense to you. All cards must be sorted before submitting.
        </p>
      </div>

      {/* Unsorted Cards */}
      <Card className="p-4 mb-8">
        <div className="font-semibold mb-4">
          Unsorted Cards ({unsortedCards.length})
        </div>
        <div
          onDragOver={(e) => handleDragOver(e, 'unsorted')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            e.preventDefault()
            handleDrop('unsorted')
          }}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-lg min-h-[100px] transition-colors ${
            draggedOverCategory === 'unsorted' 
              ? 'bg-primary/10 border-2 border-dashed border-primary' 
              : 'bg-muted/50'
          }`}
        >
          {unsortedCards.map((card) => (
            <Card
              key={card.id}
              draggable
              onDragStart={(e) => handleDragStart(e, card)}
              onDragEnd={handleDragEnd}
              className="p-4 cursor-move hover:border-primary/50 transition-colors active:cursor-grabbing"
            >
              {card.text}
            </Card>
          ))}
        </div>
      </Card>

      {/* Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentSession.categories.map((category) => (
          <Card key={category.id} className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">{category.name}</h3>
            </div>
            <div
              className="flex-1 p-4"
              onDragOver={(e) => handleDragOver(e, category.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(category.id)
              }}
            >
              <div 
                className={`rounded-lg p-4 min-h-[300px] space-y-2 transition-colors ${
                  draggedOverCategory === category.id 
                    ? 'bg-primary/10 border-2 border-dashed border-primary' 
                    : 'bg-muted/50'
                }`}
              >
                {categoryCards[category.id]?.map((card) => (
                  <Card
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                    onDragEnd={handleDragEnd}
                    className="p-4 cursor-move hover:border-primary/50 transition-colors active:cursor-grabbing"
                  >
                    {card.text}
                  </Card>
                ))}
                {categoryCards[category.id]?.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Drop cards here
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={unsortedCards.length > 0 || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Sort"}
        </Button>
      </div>
    </div>
  )
}