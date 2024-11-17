// src/components/participant/category-manager.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { useParticipantStore } from "@/store/participant-store"
import { useToast } from "@/hooks/use-toast"
import type { Category } from "@/types/session"

export function CategoryManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const { currentSession, addCustomCategory } = useParticipantStore()
  const { toast } = useToast()

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      toast({
        variant: "destructive",
        description: "Category name cannot be empty",
      })
      return
    }

    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: categoryName.trim(),
      cards: []
    }

    addCustomCategory(newCategory)
    setCategoryName("")
    setIsOpen(false)

    toast({
      description: "New category added",
    })
  }

  if (!currentSession?.allowNewCategories) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category to sort your cards
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddCategory}>
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}