// src/components/sessions/session-results-view.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  Download,
  Users,
  Clock,
  FolderTree,
  ListTree 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Session, ParticipantSort } from "@/types/session"
import { exportResults } from "@/lib/export-results"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"

interface SessionResultsViewProps {
  session: Session
}

interface CategoryResult {
  id: string
  name: string
  count: number
  cards: {
    id: string
    text: string
    count: number
    percentage: number
  }[]
}

interface CardSimilarity {
  card1: string
  card2: string
  similarity: number
  count: number
}

export function SessionResultsView({ session }: SessionResultsViewProps) {
  const [results, setResults] = useState<CategoryResult[]>([])
  const [similarities, setSimilarities] = useState<CardSimilarity[]>([])
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [participantCount, setParticipantCount] = useState(0)
  const [averageTime, setAverageTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchResults() {
      try {
        setIsLoading(true)
        
        // Fetch all participant sorts for this session
        const sortsQuery = query(
          collection(db, "participant_sorts"),
          where("sessionId", "==", session.id)
        )
        const sortsSnapshot = await getDocs(sortsQuery)
        const sorts = sortsSnapshot.docs.map(doc => doc.data() as ParticipantSort)
        
        setParticipantCount(sorts.length)

        // Process categories (including custom ones)
        const categoryMap = new Map<string, CategoryResult>()

        // Initialize with predefined categories
        session.categories.forEach(category => {
          categoryMap.set(category.id, {
            id: category.id,
            name: category.name,
            count: 0,
            cards: session.cards.map(card => ({
              id: card.id,
              text: card.text,
              count: 0,
              percentage: 0
            }))
          })
        })

        // Process all sorts
        sorts.forEach(sort => {
          sort.categories.forEach(category => {
            if (!categoryMap.has(category.id)) {
              // This is a custom category
              if (!customCategories.includes(category.name)) {
                setCustomCategories(prev => [...prev, category.name])
              }
              categoryMap.set(category.id, {
                id: category.id,
                name: category.name,
                count: 0,
                cards: session.cards.map(card => ({
                  id: card.id,
                  text: card.text,
                  count: 0,
                  percentage: 0
                }))
              })
            }

            const categoryResult = categoryMap.get(category.id)!
            categoryResult.count++

            category.cardIds.forEach(cardId => {
              const cardResult = categoryResult.cards.find(c => c.id === cardId)
              if (cardResult) {
                cardResult.count++
              }
            })
          })
        })

        // Calculate percentages
        categoryMap.forEach(category => {
          category.cards.forEach(card => {
            card.percentage = (card.count / participantCount) * 100
          })
        })

        // Calculate card similarities
        const similarities: CardSimilarity[] = []
        session.cards.forEach((card1, i) => {
          session.cards.slice(i + 1).forEach(card2 => {
            let sameGroupCount = 0
            sorts.forEach(sort => {
              sort.categories.forEach(category => {
                if (
                  category.cardIds.includes(card1.id) &&
                  category.cardIds.includes(card2.id)
                ) {
                  sameGroupCount++
                }
              })
            })
            
            if (sameGroupCount > 0) {
              similarities.push({
                card1: card1.text,
                card2: card2.text,
                similarity: (sameGroupCount / participantCount) * 100,
                count: sameGroupCount
              })
            }
          })
        })

        setSimilarities(similarities.sort((a, b) => b.similarity - a.similarity))
        setResults(Array.from(categoryMap.values()))
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching results:', error)
        toast({
          variant: "destructive",
          description: "Failed to load session results"
        })
      }
    }

    fetchResults()
  }, [session, toast, participantCount])

  const handleExport = (format: 'json' | 'csv' | 'html') => {
    const data = {
      sessionInfo: {
        title: session.title,
        description: session.description,
        type: session.type,
        participantCount,
        averageTime
      },
      results,
      similarities,
      customCategories
    }
  
    exportResults(data, format)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <p className="text-muted-foreground">{session.description}</p>
          
<div className="flex items-center gap-2 mt-2">
  {session.type && (
    <Badge variant="outline">
      {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Sort
    </Badge>
  )}
  {session.type !== 'closed' && customCategories.length > 0 && (
    <Badge variant="outline">
      {customCategories.length} Custom Categories
    </Badge>
  )}
</div>
        </div>
        <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>
      <Download className="mr-2 h-4 w-4" />
      Export Results
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="z-50 bg-white rounded-md shadow-md p-2">
    <DropdownMenuItem onSelect={() => handleExport('json')} className="cursor-pointer px-4 py-2 hover:bg-muted">
      Export as JSON
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={() => handleExport('csv')} className="cursor-pointer px-4 py-2 hover:bg-muted">
      Export as CSV
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={() => handleExport('html')} className="cursor-pointer px-4 py-2 hover:bg-muted">
      Export as HTML Report
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participantCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageTime)}m</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categories Used
            </CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Card Groups
            </CardTitle>
            <ListTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{similarities.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="relationships">Card Relationships</TabsTrigger>
          {session.type !== 'closed' && (
            <TabsTrigger value="custom">Custom Categories</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          {results
            .filter(category => session.categories.find(c => c.id === category.id))
            .map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>
                    Used by {category.count} participants ({Math.round((category.count / participantCount) * 100)}%)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.cards
                      .filter(card => card.count > 0)
                      .sort((a, b) => b.count - a.count)
                      .map(card => (
                        <div key={card.id} className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{card.text}</div>
                          </div>
                          <div className="w-[200px] flex items-center gap-4">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${card.percentage}%` }}
                              />
                            </div>
                            <div className="w-12 text-sm text-muted-foreground">
                              {Math.round(card.percentage)}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="relationships">
          <Card>
            <CardHeader>
              <CardTitle>Card Relationships</CardTitle>
              <CardDescription>
                Cards that were frequently grouped together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card 1</TableHead>
                    <TableHead>Card 2</TableHead>
                    <TableHead className="text-right">Similarity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {similarities.slice(0, 10).map((similarity, index) => (
                    <TableRow key={index}>
                      <TableCell>{similarity.card1}</TableCell>
                      <TableCell>{similarity.card2}</TableCell>
                      <TableCell className="text-right">
                        {Math.round(similarity.similarity)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {session.type !== 'closed' && (
          <TabsContent value="custom" className="space-y-4">
            {results
              .filter(category => !session.categories.find(c => c.id === category.id))
              .map(category => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>
                      Created by participants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.cards
                        .filter(card => card.count > 0)
                        .sort((a, b) => b.count - a.count)
                        .map(card => (
                          <div key={card.id} className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{card.text}</div>
                            </div>
                            <div className="w-[200px] flex items-center gap-4">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${card.percentage}%` }}
                                />
                              </div>
                              <div className="w-12 text-sm text-muted-foreground">
                                {Math.round(card.percentage)}%
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}