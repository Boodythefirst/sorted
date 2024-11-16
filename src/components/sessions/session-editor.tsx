// src/components/sessions/session-editor.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  PlayCircle,
  StopCircle,
  Save
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CardSortingInterface } from "./card-sorting-interface"
import { useSessionStore } from "@/store/session-store"
import type { Session } from "@/types/session"
import { ResultsVisualization } from "./results-visualization"

interface SessionEditorProps {
  session: Session
}

export function SessionEditor({ session: initialSession }: SessionEditorProps) {
  const [session, setSession] = useState(initialSession)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [isEditingCards, setIsEditingCards] = useState(false)
  const updateSession = useSessionStore((state) => state.updateSession)
  const router = useRouter()

  const handleAddCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get("categoryName") as string

    const newCategory = {
      id: crypto.randomUUID(),
      name,
      cards: [],
    }

    try {
      await updateSession(session.id, {
        categories: [...session.categories, newCategory],
      })
      setSession(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }))
      setIsAddingCategory(false)
    } catch (error) {
      setError((error as Error).message)
    }
  }

  const handleUpdateDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    try {
      setIsLoading(true)
      await updateSession(session.id, { title, description })
      setSession(prev => ({ ...prev, title, description }))
      setIsEditingDetails(false)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCards = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const cardsText = formData.get("cards") as string

    const newCards = cardsText
      .split("\n")
      .filter(Boolean)
      .map((text) => ({
        id: crypto.randomUUID(),
        text: text.trim(),
      }))

    try {
      setIsLoading(true)
      await updateSession(session.id, { cards: newCards })
      setSession(prev => ({ ...prev, cards: newCards }))
      setIsEditingCards(false)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (status: Session["status"]) => {
    try {
      setIsLoading(true)
      await updateSession(session.id, { status })
      setSession(prev => ({ ...prev, status }))
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const updatedCategories = session.categories.filter(cat => cat.id !== categoryId)
    try {
      await updateSession(session.id, { categories: updatedCategories })
      setSession(prev => ({
        ...prev,
        categories: updatedCategories,
      }))
    } catch (error) {
      setError((error as Error).message)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight">{session.title}</h2>
            <Badge variant={
              session.status === 'draft' ? 'secondary' :
              session.status === 'active' ? 'success' : 'default'
            }>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">{session.description}</p>
        </div>
        <div className="flex gap-2">
          {session.status === "draft" && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditingDetails(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
              <Button
                onClick={() => handleStatusChange("active")}
                disabled={isLoading}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </>
          )}
          {session.status === "active" && (
            <Button
              onClick={() => handleStatusChange("completed")}
              disabled={isLoading}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              End Session
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Session Code Display */}
      <Card>
        <CardHeader>
          <CardTitle>Session Code</CardTitle>
          <CardDescription>Share this code with participants to join the session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg text-center">
            <span className="text-2xl font-mono tracking-wide">{session.code}</span>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cards</CardTitle>
            <CardDescription>Manage the cards for sorting</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditingCards(true)}
            disabled={session.status !== "draft"}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Cards
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {session.cards.map((card) => (
              <Card key={card.id} className="p-4">
                {card.text}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage sorting categories</CardDescription>
          </div>
          <Button
            onClick={() => setIsAddingCategory(true)}
            disabled={session.status === "completed"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {session.categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {session.status !== "completed" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.cards.length} cards
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Details Dialog */}
      <Dialog open={isEditingDetails} onOpenChange={setIsEditingDetails}>
        <DialogContent>
          <form onSubmit={handleUpdateDetails}>
            <DialogHeader>
              <DialogTitle>Edit Session Details</DialogTitle>
              <DialogDescription>
                Update the session title and description
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={session.title}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={session.description}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingDetails(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Cards Dialog */}
      <Dialog open={isEditingCards} onOpenChange={setIsEditingCards}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleUpdateCards}>
            <DialogHeader>
              <DialogTitle>Edit Cards</DialogTitle>
              <DialogDescription>
                Enter one card per line. All existing cards will be replaced.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                name="cards"
                className="min-h-[300px] font-mono"
                defaultValue={session.cards.map(card => card.text).join("\n")}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingCards(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <form onSubmit={handleAddCategory}>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
              <DialogDescription>
                Create a new category for cards to be sorted into.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                name="categoryName"
                placeholder="Enter category name"
                className="mt-2"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddingCategory(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Card Sorting Interface */}
      {session.status === "completed" && (
  <div className="mt-8">
    <ResultsVisualization session={session} />
  </div>
)}

{session.status === "active" && (
  <CardSortingInterface session={session} />
)}
    </div>
  )
}