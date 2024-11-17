// src/components/sessions/session-edit-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useSessionStore } from "@/store/session-store"
import type { Session, Card as CardType, Category } from "@/types/session"
import { ArrowLeft, Plus, X, FileUp } from "lucide-react"
import Link from "next/link"

interface SessionEditFormProps {
  session: Session
}

export function SessionEditForm({ session: initialSession }: SessionEditFormProps) {
  const [session, setSession] = useState(initialSession)
  const [isLoading, setIsLoading] = useState(false)
  const [bulkCardsDialog, setBulkCardsDialog] = useState(false)
  const [bulkCategoriesDialog, setBulkCategoriesDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { updateSession } = useSessionStore()

  const updateDetails = async (formData: FormData) => {
    try {
      setIsLoading(true)
      const updates = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
      }
      await updateSession(session.id, updates)
      setSession(prev => ({ ...prev, ...updates }))
      toast({
        title: "Session updated",
        description: "Session details have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update session details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addCard = async () => {
    const newCard: CardType = {
      id: crypto.randomUUID(),
      text: "",
    }
    
    try {
      setIsLoading(true)
      const updatedCards = [...session.cards, newCard]
      await updateSession(session.id, { cards: updatedCards })
      setSession(prev => ({ ...prev, cards: updatedCards }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add card.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateCard = async (cardId: string, text: string) => {
    const updatedCards = session.cards.map(card =>
      card.id === cardId ? { ...card, text } : card
    )
    
    try {
      await updateSession(session.id, { cards: updatedCards })
      setSession(prev => ({ ...prev, cards: updatedCards }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card.",
        variant: "destructive",
      })
    }
  }

  const deleteCard = async (cardId: string) => {
    try {
      setIsLoading(true)
      const updatedCards = session.cards.filter(card => card.id !== cardId)
      await updateSession(session.id, { cards: updatedCards })
      setSession(prev => ({ ...prev, cards: updatedCards }))
      toast({
        title: "Card deleted",
        description: "The card has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete card.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkCardImport = async (formData: FormData) => {
    try {
      setIsLoading(true)
      const cardsText = formData.get("cards") as string
      const newCards: CardType[] = cardsText
        .split('\n')
        .filter(text => text.trim())
        .map(text => ({
          id: crypto.randomUUID(),
          text: text.trim()
        }))

      const updatedCards = [...session.cards, ...newCards]
      await updateSession(session.id, { cards: updatedCards })
      setSession(prev => ({ ...prev, cards: updatedCards }))
      setBulkCardsDialog(false)
      toast({
        title: "Cards imported",
        description: `Successfully added ${newCards.length} cards.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import cards.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addCategory = async () => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: "",
      cards: [],
    }
    
    try {
      setIsLoading(true)
      const updatedCategories = [...session.categories, newCategory]
      await updateSession(session.id, { categories: updatedCategories })
      setSession(prev => ({ ...prev, categories: updatedCategories }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateCategory = async (categoryId: string, name: string) => {
    const updatedCategories = session.categories.map(category =>
      category.id === categoryId ? { ...category, name } : category
    )
    
    try {
      await updateSession(session.id, { categories: updatedCategories })
      setSession(prev => ({ ...prev, categories: updatedCategories }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      })
    }
  }

  const deleteCategory = async (categoryId: string) => {
    try {
      setIsLoading(true)
      const updatedCategories = session.categories.filter(category => category.id !== categoryId)
      await updateSession(session.id, { categories: updatedCategories })
      setSession(prev => ({ ...prev, categories: updatedCategories }))
      toast({
        title: "Category deleted",
        description: "The category has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkCategoryImport = async (formData: FormData) => {
    try {
      setIsLoading(true)
      const categoriesText = formData.get("categories") as string
      const newCategories: Category[] = categoriesText
        .split('\n')
        .filter(text => text.trim())
        .map(text => ({
          id: crypto.randomUUID(),
          name: text.trim(),
          cards: []
        }))

      const updatedCategories = [...session.categories, ...newCategories]
      await updateSession(session.id, { categories: updatedCategories })
      setSession(prev => ({ ...prev, categories: updatedCategories }))
      setBulkCategoriesDialog(false)
      toast({
        title: "Categories imported",
        description: `Successfully added ${newCategories.length} categories.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import categories.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/sessions/${session.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Session
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <form action={updateDetails}>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>
                  Basic information about your card sorting session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cards</CardTitle>
                <CardDescription>
                  Manage the cards that participants will sort
                </CardDescription>
              </div>
              <Dialog open={bulkCardsDialog} onOpenChange={setBulkCardsDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileUp className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form action={handleBulkCardImport}>
                    <DialogHeader>
                      <DialogTitle>Import Cards</DialogTitle>
                      <DialogDescription>
                        Enter one card per line. All cards will be added to your existing set.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Textarea
                        name="cards"
                        placeholder="Enter cards (one per line)..."
                        className="min-h-[200px] font-mono"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setBulkCardsDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Import Cards</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.cards.map((card) => (
                <div key={card.id} className="flex gap-2">
                  <Input
                    value={card.text}
                    onChange={(e) => updateCard(card.id, e.target.value)}
                    placeholder="Enter card text"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCard(card.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button onClick={addCard} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage the categories available for sorting
                </CardDescription>
              </div>
              <Dialog open={bulkCategoriesDialog} onOpenChange={setBulkCategoriesDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileUp className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form action={handleBulkCategoryImport}>
                    <DialogHeader>
                      <DialogTitle>Import Categories</DialogTitle>
                      <DialogDescription>
                        Enter one category per line. All categories will be added to your existing set.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Textarea
                        name="categories"
                        placeholder="Enter categories (one per line)..."
                        className="min-h-[200px] font-mono"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setBulkCategoriesDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Import Categories</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.categories.map((category) => (
                <div key={category.id} className="flex gap-2">
                  <Input
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, e.target.value)}
                    placeholder="Enter category name"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button onClick={addCategory} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}