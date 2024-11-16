// src/components/sessions/results-overview.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart2, Users, Calendar } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatDistance } from "date-fns"
import type { Session } from "@/types/session"
import { useAuthStore } from "@/store/auth-store"

export function ResultsOverview() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [completedSessions, setCompletedSessions] = useState<Session[]>([])
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCompletedSessions() {
      if (!user) return

      try {
        const sessionsQuery = query(
          collection(db, "sessions"),
          where("createdBy", "==", user.id),
          where("status", "==", "completed")
        )
        const sessionSnap = await getDocs(sessionsQuery)
        const sessions = sessionSnap.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            categories: data.categories || [],
            cards: data.cards || [],
            isOpen: data.isOpen || false,
            participantCount: data.participantCount || 0,
            status: data.status || 'draft',
            code: data.code || '',
            title: data.title || '',
            description: data.description || '',
            createdBy: data.createdBy || '',
          }
        }) as Session[]

        // Fetch participant counts
        const counts: Record<string, number> = {}
        const participantQuery = query(collection(db, "participant_sorts"))
        const participantSnap = await getDocs(participantQuery)
        
        participantSnap.docs.forEach(doc => {
          const data = doc.data()
          if (data.sessionId) {
            counts[data.sessionId] = (counts[data.sessionId] || 0) + 1
          }
        })

        setCompletedSessions(sessions)
        setParticipantCounts(counts)
      } catch (error) {
        console.error("Error fetching completed sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompletedSessions()
  }, [user])
  if (isLoading) {
    return <div>Loading sessions...</div>
  }

  if (completedSessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No Completed Sessions</h3>
            <p className="text-muted-foreground">
              Sessions will appear here once they are completed.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/sessions')}
              className="mt-4"
            >
              View All Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {completedSessions.map((session) => (
        <Card key={session.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{session.title}</CardTitle>
              <CardDescription>
                Completed {formatDistance(new Date(session.createdAt), new Date(), { addSuffix: true })}
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.push(`/dashboard/sessions/${session.id}/results`)}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              View Analysis
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {participantCounts[session.id] || 0}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total Participants
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {session.cards.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cards Sorted
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {session.categories.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Categories
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}