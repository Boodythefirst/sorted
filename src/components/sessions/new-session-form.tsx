// src/components/sessions/new-session-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSessionStore } from "@/store/session-store"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function NewSessionForm() {
  const router = useRouter()
  const createSession = useSessionStore((state) => state.createSession)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const cardsText = formData.get("cards") as string

    const cards = cardsText
      .split("\n")
      .filter(Boolean)
      .map((text) => ({
        id: crypto.randomUUID(),
        text: text.trim(),
      }))

    try {
      await createSession({
        title,
        description,
        cards,
        categories: [],
        status: "draft",
        createdBy: "", // This will be set in the store
        participantCount: 0,
        isOpen: false,
      })
      
      router.push("/dashboard/sessions")
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Session</CardTitle>
        <CardDescription>
          Set up a new card sorting session
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              name="title"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cards">Cards</Label>
            <Textarea
              id="cards"
              name="cards"
              required
              disabled={isLoading}
              placeholder="Enter one card per line"
              className="min-h-[200px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}