// src/components/sessions/results-view.tsx
"use client"

import { useEffect, useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Session, ParticipantSort } from "@/types/session"

interface CardSimilarity {
    cardId1: string;
    cardId2: string;
    text1: string;
    text2: string;
    similarity: number;
  }
  

interface ResultsViewProps {
  session: Session
}

interface CategoryResult {
  categoryId: string
  categoryName: string
  cards: {
    cardId: string
    cardText: string
    count: number
    percentage: number
  }[]
}

export function ResultsView({ session }: ResultsViewProps) {
  const [results, setResults] = useState<CategoryResult[]>([])
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      try {
        // Get all participant sorts for this session
        const sortsQuery = query(
          collection(db, "participant_sorts"),
          where("sessionId", "==", session.id)
        )
        const sortsSnapshot = await getDocs(sortsQuery)
        const sorts = sortsSnapshot.docs.map(doc => doc.data() as ParticipantSort)
        
        setTotalParticipants(sorts.length)

        // Process results for each category
        const categoryResults = session.categories.map(category => {
          const cardCounts: Record<string, number> = {}
          
          // Initialize counts for all cards
          session.cards.forEach(card => {
            cardCounts[card.id] = 0
          })

          // Count card placements
          sorts.forEach(sort => {
            const categorySort = sort.categories.find(c => c.id === category.id)
            if (categorySort) {
              categorySort.cardIds.forEach(cardId => {
                cardCounts[cardId] = (cardCounts[cardId] || 0) + 1
              })
            }
          })

          // Calculate percentages and create card results
          const cards = session.cards.map(card => ({
            cardId: card.id,
            cardText: card.text,
            count: cardCounts[card.id],
            percentage: sorts.length > 0 
              ? (cardCounts[card.id] / sorts.length) * 100 
              : 0
          }))

          return {
            categoryId: category.id,
            categoryName: category.name,
            cards: cards.sort((a, b) => b.percentage - a.percentage)
          }
        })

        setResults(categoryResults)
      } catch (error) {
        console.error("Error fetching results:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [session])

  if (isLoading) {
    return <div>Loading results...</div>
  }
// Add this function inside the component before the return statement
const calculateSimilarities = (): CardSimilarity[] => {
    const similarities: CardSimilarity[] = [];
    
    // Only calculate if we have participants
    if (totalParticipants === 0) return similarities;
  
    // Calculate how often cards appear together in the same category
    session.cards.forEach((card1, i) => {
      session.cards.slice(i + 1).forEach(card2 => {
        let togetherCount = 0;
  
        results.forEach(categoryResult => {
          const hasCard1 = categoryResult.cards.find(c => c.cardId === card1.id)?.count || 0;
          const hasCard2 = categoryResult.cards.find(c => c.cardId === card2.id)?.count || 0;
          if (hasCard1 > 0 && hasCard2 > 0) {
            togetherCount += Math.min(hasCard1, hasCard2);
          }
        });
  
        const similarity = (togetherCount / totalParticipants) * 100;
        
        if (similarity > 50) { // Only show strong relationships
          similarities.push({
            cardId1: card1.id,
            cardId2: card2.id,
            text1: card1.text,
            text2: card2.text,
            similarity
          });
        }
      });
    });
  
    return similarities.sort((a, b) => b.similarity - a.similarity);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Session Results</h1>
        <p className="text-muted-foreground">
          Based on {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-6">
        {results.map((categoryResult) => (
          <Card key={categoryResult.categoryId}>
            <CardHeader>
              <CardTitle>{categoryResult.categoryName}</CardTitle>
              <CardDescription>
                Cards sorted into this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryResult.cards
                  .filter(card => card.count > 0)
                  .map((card) => (
                    <div 
                      key={card.cardId}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {card.cardText}
                        </div>
                      </div>
                      <div className="w-[200px] flex items-center gap-4">
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all"
                            style={{ width: `${card.percentage}%` }}
                          />
                        </div>
                        <div className="w-16 text-sm text-muted-foreground">
                          {card.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                {categoryResult.cards.every(card => card.count === 0) && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No cards were sorted into this category
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          
        ))}
      </div>
      <Card>
  <CardHeader>
    <CardTitle>Card Relationships</CardTitle>
    <CardDescription>
      Cards that were frequently sorted together
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {calculateSimilarities().map((similarity, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm">
              <span className="font-medium">{similarity.text1}</span>
              {" & "}
              <span className="font-medium">{similarity.text2}</span>
            </div>
          </div>
          <div className="w-[200px] flex items-center gap-4">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all"
                style={{ width: `${similarity.similarity}%` }}
              />
            </div>
            <div className="w-16 text-sm text-muted-foreground">
              {similarity.similarity.toFixed(1)}%
            </div>
          </div>
        </div>
      ))}
      {calculateSimilarities().length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-4">
          No strong relationships found between cards
        </div>
      )}
    </div>
  </CardContent>
</Card>
    </div>
  )
}