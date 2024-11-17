// src/components/sessions/sessions-table.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSessionStore } from "@/store/session-store"
import { formatDistance } from "date-fns"
import { SessionActions } from "./session-actions"
import { Users, Copy, CheckCheck } from "lucide-react"
import { collection, query, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export function SessionsTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { 
    filteredSessions, 
    isLoading, 
    error, 
    fetchSessions,
    updateSession,
    filter
  } = useSessionStore()

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  useEffect(() => {
    if (filteredSessions.length === 0) return

    const participantsQuery = query(collection(db, 'participant_sorts'))
    const unsubscribe = onSnapshot(participantsQuery, (snapshot) => {
      const participantCounts: Record<string, number> = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.sessionId) {
          participantCounts[data.sessionId] = (participantCounts[data.sessionId] || 0) + 1
        }
      })

      filteredSessions.forEach(session => {
        const newCount = participantCounts[session.id] || 0
        if (session.participantCount !== newCount) {
          updateSession(session.id, { participantCount: newCount })
        }
      })
    })

    return () => unsubscribe()
  }, [filteredSessions, updateSession])

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast({
        description: "Session code copied to clipboard",
      })
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy code to clipboard",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="space-y-4 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" onClick={() => fetchSessions()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (filteredSessions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {filter.showArchived 
              ? "No archived sessions found" 
              : "No active sessions found"}
          </p>
          {!filter.showArchived && (
            <Button onClick={() => router.push('/dashboard/sessions/create')}>
              Create New Session
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSessions.map((session) => (
            <TableRow 
              key={session.id}
              className={session.archived ? "opacity-60" : ""}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {session.title}
                  {session.archived && (
                    <Badge variant="outline">Archived</Badge>
                  )}
                </div>
                {session.description && (
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {session.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={
                  session.status === 'draft' ? 'secondary' :
                  session.status === 'active' ? 'success' : 'default'
                }>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {session.participantCount}
                </div>
              </TableCell>
              <TableCell>
                {formatDistance(new Date(session.createdAt), new Date(), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  className="font-mono"
                  onClick={() => handleCopyCode(session.code)}
                >
                  {copiedCode === session.code ? (
                    <CheckCheck className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {session.code}
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <SessionActions session={session} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}