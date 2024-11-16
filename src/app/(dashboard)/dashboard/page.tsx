// src/app/(dashboard)/dashboard/page.tsx
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentSessions } from "@/components/dashboard/recent-sessions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  Users,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Activity,
  Clock
} from "lucide-react"
import { getRecentSessions } from "@/lib/sessions" // We'll create this

export default async function DashboardPage() {
  const recentSessions = await getRecentSessions()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back to your card sorting sessions overview
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/sessions/create">
            <Plus className="mr-2 h-4 w-4" /> New Session
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Sessions"
          value="3"
          description="Currently running"
          icon={PlayCircle}
          iconColor="text-green-500"
        />
        <StatsCard
          title="Total Participants"
          value="128"
          description="Across all sessions"
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Completed Sessions"
          value="12"
          description="Successfully finished"
          icon={CheckCircle2}
          iconColor="text-purple-500"
        />
        <StatsCard
          title="Average Duration"
          value="15m"
          description="Per sorting session"
          icon={Clock}
          iconColor="text-orange-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Overview</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/activity">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add an activity chart here later */}
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Activity chart coming soon
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Sessions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/sessions">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RecentSessions sessions={recentSessions} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link href="/dashboard/sessions/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Session
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/templates">
                <Activity className="mr-2 h-4 w-4" />
                Manage Templates
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/results">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                View Results
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}