// src/components/sessions/sessions-header.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PlusCircle,
  Search,
  Archive,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSessionStore } from "@/store/session-store"
import { useMemo } from "react"

export function SessionsHeader() {
  const router = useRouter()
  const { 
    sessions, 
    filter, 
    setFilter 
  } = useSessionStore()

  const archivedCount = useMemo(() => 
    sessions.filter(session => session.archived).length,
  [sessions])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Card Sorting Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your card sorting sessions
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/sessions/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              onChange={(e) => setFilter({ search: e.target.value })}
              className="pl-8"
              value={filter.search}
            />
          </div>
          <Select
            value={filter.status}
            onValueChange={(value) => setFilter({ status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => setFilter({ showArchived: !filter.showArchived })}
          className="ml-auto"
        >
          <Archive className="h-4 w-4 mr-2" />
          {filter.showArchived 
            ? "Hide Archived" 
            : `View Archived (${archivedCount})`}
        </Button>
      </div>
    </div>
  )
}