// src/components/sessions/new-session-form.tsx
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useSessionStore } from "@/store/session-store"
import type { SessionType } from "@/types/session"

export function NewSessionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionType, setSessionType] = useState<SessionType>('closed')
  const router = useRouter()
  const { toast } = useToast()
  const createSession = useSessionStore((state) => state.createSession)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const cardsText = formData.get("cards") as string
    const categoriesText = sessionType !== 'open' ? formData.get("categories") as string : ""

    const cards = cardsText
      .split("\n")
      .filter(text => text.trim())
      .map(text => ({
        id: crypto.randomUUID(),
        text: text.trim()
      }))

    const categories = sessionType !== 'open'
      ? categoriesText
          .split("\n")
          .filter(text => text.trim())
          .map(text => ({
            id: crypto.randomUUID(),
            name: text.trim(),
            cards: []
          }))
      : []

    try {
      await createSession({
        title,
        description,
        cards,
        categories,
        status: 'draft',
        type: sessionType,
        allowNewCategories: sessionType !== 'closed',
        isOpen: false,
        participantCount: 0,
        createdBy: "",  // This will be set in the store
      })

      toast({
        title: "Success",
        description: "Session created successfully",
      })
      
      router.push("/dashboard/sessions")
    } catch (error) {
      setError((error as Error).message)
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create New Session</CardTitle>
          <CardDescription>
            Set up your card sorting session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              placeholder="Enter session title"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the purpose of this card sorting session"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <Label>Session Type</Label>
            <RadioGroup
              defaultValue="closed"
              value={sessionType}
              onValueChange={(value) => setSessionType(value as SessionType)}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="closed"
                  id="closed"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="closed"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <div className="text-sm font-medium">Closed</div>
                  <div className="text-xs text-muted-foreground">
                    Predefined categories only
                  </div>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="open"
                  id="open"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="open"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <div className="text-sm font-medium">Open</div>
                  <div className="text-xs text-muted-foreground">
                    Participants create categories
                  </div>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="hybrid"
                  id="hybrid"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="hybrid"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <div className="text-sm font-medium">Hybrid</div>
                  <div className="text-xs text-muted-foreground">
                    Both predefined and custom
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cards">Cards</Label>
            <Textarea
              id="cards"
              name="cards"
              placeholder="Enter one card per line"
              className="min-h-[150px] font-mono"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Each line will be treated as a separate card for sorting
            </p>
          </div>

          {sessionType !== 'open' && (
            <div className="space-y-2">
              <Label htmlFor="categories">Predefined Categories</Label>
              <Textarea
                id="categories"
                name="categories"
                placeholder="Enter one category per line"
                className="min-h-[150px] font-mono"
                required={sessionType === 'closed'}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {sessionType === 'closed' 
                  ? "Enter all categories participants will use for sorting"
                  : "Enter initial categories (participants can add more)"}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Session"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}