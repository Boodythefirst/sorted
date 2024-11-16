// src/hooks/use-session-realtime.ts
import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Session } from '@/types/session'

export function useSessionRealtime(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    
    const unsubscribe = onSnapshot(
      doc(db, 'sessions', sessionId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          setSession({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          } as Session)
        } else {
          setError('Session not found')
        }
        setIsLoading(false)
      },
      (error) => {
        setError(error.message)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [sessionId])

  return { session, isLoading, error }
}