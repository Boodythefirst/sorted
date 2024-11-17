// src/components/participant/participant-sorting-view.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParticipantStore } from "@/store/participant-store"
import { Loading } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Card as CardType, Category } from "@/types/session"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "../ui/badge"

interface ParticipantSortingViewProps {
  code: string
}

export function ParticipantSortingView({ code }: ParticipantSortingViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { currentSession, error, isLoading, joinSession, submitSort } = useParticipantStore()
  const [unsortedCards, setUnsortedCards] = useState<CardType[]>([])
  const [categoryCards, setCategoryCards] = useState<Record<string, CardType[]>>({})
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draggedCard, setDraggedCard] = useState<CardType | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")

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

  const handleAddCategory = async () => {
    if (!currentSession?.allowNewCategories) return
    
    if (!newCategoryName.trim()) {
      toast({
        variant: "destructive",
        description: "Category name cannot be empty",
      })
      return
    }

    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: newCategoryName.trim(),
      cards: []
    }

    setCategoryCards(prev => ({
      ...prev,
      [newCategory.id]: []
    }))
    
    setIsAddingCategory(false)
    setNewCategoryName("")

    toast({
      description: "New category added",
    })
  }

  const handleDragStart = (e: React.DragEvent, card: CardType) => {
    setDraggedCard(card)
    
    const dragPreview = document.createElement('div')
    dragPreview.className = 'fixed pointer-events-none bg-background border rounded-lg shadow-lg p-4 w-[200px]'
    dragPreview.innerHTML = card.text
    document.body.appendChild(dragPreview)
    
    e.dataTransfer.setDragImage(dragPreview, 100, 30)
    
    e.currentTarget.classList.add('opacity-50', 'border-primary', 'border-2', 'border-dashed')
    
    requestAnimationFrame(() => {
      document.body.removeChild(dragPreview)
    })
  }

  const handleDrop = (categoryId: string | 'unsorted') => {
    if (!draggedCard) return

    // Find where the card is coming from
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
  }

  const handleSubmit = async () => {
    if (unsortedCards.length > 0) {
      toast({
        variant: "destructive",
        description: "Please sort all cards before submitting",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const participantSort = {
        sessionId: currentSession!.sessionId,
        participantId: crypto.randomUUID(),
        categories: Object.entries(categoryCards).map(([categoryId, cards]) => ({
          id: categoryId,
          name: currentSession!.categories.find(c => c.id === categoryId)?.name || 
                Object.entries(categoryCards).find(([id]) => id === categoryId)?.[1][0]?.category || '',
          cardIds: cards.map(card => card.id)
        }))
      }
      
      await submitSort(participantSort)
      router.push('/sort/complete')
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to submit sort",
      })
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

  const allCategories = [
    ...currentSession.categories,
    ...Object.keys(categoryCards)
      .filter(id => !currentSession.categories.find(c => c.id === id))
      .map(id => ({
        id,
        name: categoryCards[id][0]?.category || 'Custom Category',
        cards: categoryCards[id]
      }))
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">{currentSession.title}</h1>
        <p className="text-muted-foreground">
          {currentSession.description}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="outline">
            {currentSession.type.charAt(0).toUpperCase() + currentSession.type.slice(1)} Sort
          </Badge>
          {currentSession.allowNewCategories && (
            <Badge variant="outline">Custom Categories Allowed</Badge>
          )}
        </div>
      </div>

      <Card className="p-4 mb-8">
        <div className="font-semibold mb-4">
          Unsorted Cards ({unsortedCards.length})
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleDrop('unsorted')
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg min-h-[100px]"
        >
          {unsortedCards.map((card) => (
            <Card
              key={card.id}
              draggable
              onDragStart={(e) => handleDragStart(e, card)}
              className="p-4 cursor-move hover:border-primary/50 transition-colors"
            >
              {card.text}
            </Card>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Categories</h2>
        {currentSession.allowNewCategories && (
          <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category to sort cards into
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>
                  Add Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allCategories.map((category) => (
          <Card key={category.id} className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">{category.name}</h3>
            </div>
            <div
              className="flex-1 p-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(category.id)
              }}
            >
              <div className="bg-muted/50 rounded-lg p-4 min-h-[300px] space-y-2">
                {categoryCards[category.id]?.map((card) => (
                  <Card
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                    className="p-4 cursor-move hover:border-primary/50 transition-colors"
                  >
                    {card.text}
                  </Card>
                ))}
                {(!categoryCards[category.id] || categoryCards[category.id].length === 0) && (
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