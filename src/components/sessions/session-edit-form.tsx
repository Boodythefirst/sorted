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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSessionStore } from "@/store/session-store"
import type { Session, Card as CardType, Category } from "@/types/session"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"

interface SessionEditFormProps {
  session: Session
}

export function SessionEditForm({ session: initialSession }: SessionEditFormProps) {
  const [session, setSession] = useState(initialSession)
  const [isLoading, setIsLoading] = useState(false)
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
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>
                Manage the cards that participants will sort
              </CardDescription>
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
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage the categories available for sorting
              </CardDescription>
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