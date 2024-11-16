// src/components/sessions/session-actions.tsx
"use client"

import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Archive,
  Trash2,
  Eye,
  PlayCircle,
  StopCircle,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { useSessionStore } from "@/store/session-store"
import { Session } from "@/types/session"
import { useToast } from "@/hooks/use-toast"

interface SessionActionsProps {
  session: Session
}

export function SessionActions({ session }: SessionActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { updateSession, deleteSession, duplicateSession } = useSessionStore()

  const handleStatusChange = async (newStatus: Session['status']) => {
    try {
      setIsLoading(true)
      await updateSession(session.id, { status: newStatus })
      toast({
        title: "Session updated",
        description: `Session status changed to ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update session status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicate = async () => {
    try {
      setIsLoading(true)
      const newSession = await duplicateSession(session.id)
      toast({
        title: "Session duplicated",
        description: "New session created successfully",
      })
      router.push(`/dashboard/sessions/${newSession.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async () => {
    try {
      setIsLoading(true)
      await updateSession(session.id, { archived: true })
      toast({
        title: "Session archived",
        description: "Session moved to archives",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await deleteSession(session.id)
      toast({
        title: "Session deleted",
        description: "Session permanently removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
        <DropdownMenuItem
  onClick={() => router.push(`/dashboard/sessions/${session.id}/edit`)}
>
  <Pencil className="mr-2 h-4 w-4" /> Edit
</DropdownMenuItem>
          {session.status === 'draft' && (
  <DropdownMenuItem
    onClick={() => router.push(`/dashboard/sessions/${session.id}/preview`)}
  >
    <Eye className="mr-2 h-4 w-4" /> Preview
  </DropdownMenuItem>
)}
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {session.status === 'draft' && (
            <DropdownMenuItem onClick={() => handleStatusChange('active')}>
              <PlayCircle className="mr-2 h-4 w-4" /> Start Session
            </DropdownMenuItem>
          )}
          {session.status === 'active' && (
            <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
              <StopCircle className="mr-2 h-4 w-4" /> End Session
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="mr-2 h-4 w-4" /> Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              session and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}