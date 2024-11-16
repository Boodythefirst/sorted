// src/components/dashboard/overview-cards.tsx
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Users, Timer, CheckCircle2 } from "lucide-react"
  
  interface StatsCardProps {
    title: string
    value: string
    description: string
    icon: React.ReactNode
  }
  
  function StatsCard({ title, value, description, icon }: StatsCardProps) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    )
  }
  
  export function OverviewCards() {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Active Sessions"
          value="3"
          description="Current active sorting sessions"
          icon={<Timer className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Participants"
          value="128"
          description="Across all sessions"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Completed Sessions"
          value="12"
          description="Successfully completed sessions"
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
    )
  }