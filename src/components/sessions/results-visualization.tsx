// src/components/sessions/results-visualization.tsx
"use client"

import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSessionResults } from "@/hooks/use-session-results"
import { Loading } from "@/components/ui/loading"
import type { Session } from "@/types/session"

interface ResultsVisualizationProps {
  session: Session
}

export function ResultsVisualization({ session }: ResultsVisualizationProps) {
  const { results, isLoading, error } = useSessionResults(session.id)

  const analysis = useMemo(() => {
    if (!results.length) {
      console.log('No results available')
      return null
    }
  
    const cardPlacements: Record<string, Record<string, number>> = {}
    
    // Initialize card placements
    session.cards.forEach(card => {
      cardPlacements[card.id] = {}
      session.categories.forEach(category => {
        cardPlacements[card.id][category.id] = 0
      })
    })
  
    // Count placements
    results.forEach(sort => {
      console.log('Processing sort:', sort) // Debug log
      sort.categories.forEach(category => {
        category.cardIds.forEach(cardId => {
          if (cardPlacements[cardId] && cardPlacements[cardId][category.id] !== undefined) {
            cardPlacements[cardId][category.id]++
          }
        })
      })
    })
  
    // Calculate percentages
    const totalParticipants = results.length
    const percentages: Record<string, Record<string, number>> = {}
    
    Object.entries(cardPlacements).forEach(([cardId, categories]) => {
      percentages[cardId] = {}
      Object.entries(categories).forEach(([categoryId, count]) => {
        percentages[cardId][categoryId] = (count / totalParticipants) * 100
      })
    })
  
    return {
      totalParticipants,
      percentages,
    }
  }, [results, session])

  if (isLoading) return <Loading />
  if (error) return <div>Error loading results: {error}</div>
  if (!analysis) return <div>No results yet</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Results</CardTitle>
        <CardDescription>
          Based on {analysis.totalParticipants} participant{analysis.totalParticipants !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Card</th>
                  {session.categories.map(category => (
                    <th key={category.id} className="text-center p-2">
                      {category.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {session.cards.map(card => (
                  <tr key={card.id} className="border-t">
                    <td className="p-2">{card.text}</td>
                    {session.categories.map(category => (
                      <td key={category.id} className="p-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="w-full">
                              <div
                                className="h-8 rounded"
                                style={{
                                  background: `rgba(59, 130, 246, ${
                                    analysis.percentages[card.id][category.id] / 100
                                  })`,
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              {analysis.percentages[card.id][category.id].toFixed(1)}%
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}