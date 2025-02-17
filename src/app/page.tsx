// src/app/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useParticipantStore } from "@/store/participant-store"

export default function HomePage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const joinSession = useParticipantStore((state) => state.joinSession)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await joinSession(code)
      router.push(`/sort/${code}`)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Join Session</CardTitle>
          <CardDescription className="text-center">
            Enter your 6-digit session code to begin
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="grid gap-2">
            <Input
              type="text"
              placeholder="Enter session code"
              maxLength={6}
              className="text-center text-lg tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isLoading}
              required
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Joining..." : "Join Session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}