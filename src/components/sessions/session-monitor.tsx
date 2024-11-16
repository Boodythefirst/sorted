// src/components/sessions/session-monitor.tsx
"use client"

import { useSessionRealtime } from "@/hooks/use-session-realtime"
import { useSessionResults } from "@/hooks/use-session-results"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Users } from "lucide-react"
import { Loading } from "@/components/ui/loading"

interface SessionMonitorProps {
  sessionId: string
}

export function SessionMonitor({ sessionId }: SessionMonitorProps) {
  const { session, isLoading: sessionLoading, error: sessionError } = useSessionRealtime(sessionId)
  const { results, isLoading: resultsLoading, error: resultsError } = useSessionResults(sessionId)

  if (sessionLoading || resultsLoading) return <Loading />
  if (sessionError || resultsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {sessionError || resultsError}
        </AlertDescription>
      </Alert>
    )
  }
  if (!session) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Active Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{results.length}</div>
              </div>
            </CardContent>
          </Card>
          
          {/* Add more monitoring metrics here */}
        </div>
      </CardContent>
    </Card>
  )
}