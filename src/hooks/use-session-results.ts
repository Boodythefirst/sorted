// src/hooks/use-session-results.ts
import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ParticipantSort } from '@/types/session'

export function useSessionResults(sessionId: string) {
  const [results, setResults] = useState<ParticipantSort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    
    const q = query(
      collection(db, 'participant_sorts'),
      where('sessionId', '==', sessionId)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sorts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ParticipantSort[]
        setResults(sorts)
        setIsLoading(false)
      },
      (error) => {
        setError(error.message)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [sessionId])

  return { results, isLoading, error }
}