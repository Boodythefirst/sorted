// src/components/sessions/sessions-table.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSessionStore } from "@/store/session-store"
import { formatDistance } from "date-fns"
import { SessionActions } from "./session-actions"
import { Users } from "lucide-react"

export function SessionsTable() {
  const router = useRouter()
  const { 
    filteredSessions, 
    isLoading, 
    error, 
    fetchSessions 
  } = useSessionStore()

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

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
          <p className="text-sm text-muted-foreground">No sessions found</p>
          <Button onClick={() => router.push('/dashboard/sessions/create')}>
            Create New Session
          </Button>
        </div>
      </div>
    )
  }

  return (
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
          <TableRow key={session.id}>
            <TableCell className="font-medium">
              {session.title}
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
              <code className="px-2 py-1 bg-muted rounded">
                {session.code}
              </code>
            </TableCell>
            <TableCell className="text-right">
              <SessionActions session={session} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}