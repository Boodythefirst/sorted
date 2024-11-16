// src/components/sessions/preview-view.tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Session } from "@/types/session"

interface PreviewViewProps {
  session: Session
}

export function PreviewView({ session }: PreviewViewProps) {
  const [currentView, setCurrentView] = useState<'instructions' | 'sorting'>('instructions')

  if (currentView === 'instructions') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <p className="text-muted-foreground">{session.description}</p>
        </div>

        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">Instructions</h2>
          <div className="space-y-4 text-sm">
            <p>In this card sorting session, you will:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>See {session.cards.length} cards with different items</li>
              <li>Sort these cards into {session.categories.length} categories</li>
              <li>Each card can only be placed in one category</li>
              <li>You must sort all cards before submitting</li>
            </ol>
            <p className="text-muted-foreground">
              Take your time - there are no right or wrong answers. We're interested in understanding how you would organize these items.
            </p>
          </div>
          <Button 
            className="w-full mt-4" 
            onClick={() => setCurrentView('sorting')}
          >
            Start Sorting
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost"
          onClick={() => setCurrentView('instructions')}
        >
          Back to Instructions
        </Button>
        <div className="text-sm text-muted-foreground">
          Preview Mode
        </div>
      </div>

      {/* Cards Section */}
      <Card className="p-4">
        <div className="font-semibold mb-4">
          Unsorted Cards ({session.cards.length})
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {session.cards.map((card) => (
            <Card key={card.id} className="p-4">
              {card.text}
            </Card>
          ))}
        </div>
      </Card>

      {/* Categories Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {session.categories.map((category) => (
          <Card key={category.id} className="h-full">
            <div className="p-4 border-b">
              <h3 className="font-semibold">{category.name}</h3>
            </div>
            <div className="p-4">
              <div className="bg-muted/50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Drop cards here
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}