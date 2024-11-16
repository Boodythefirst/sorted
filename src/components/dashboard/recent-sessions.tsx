// src/components/dashboard/recent-sessions.tsx
"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from "date-fns"
import { Session } from "@/types/session"

interface RecentSessionsProps {
  sessions: Session[]
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {sessions.slice(0, 5).map((session) => (
            <div key={session.id} className="flex items-center">
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium leading-none">
                  {session.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  Created {formatDistance(new Date(session.createdAt), new Date(), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  session.status === 'draft' ? 'secondary' :
                  session.status === 'active' ? 'success' : 'default'
                }>
                  {session.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/dashboard/sessions/${session.id}`)}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}