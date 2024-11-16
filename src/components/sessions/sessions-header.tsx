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
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useSessionStore } from "@/store/session-store"

export function SessionsHeader() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { setFilter } = useSessionStore()

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setFilter({ search: value, status: statusFilter })
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setFilter({ search: searchQuery, status: value })
  }

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
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}