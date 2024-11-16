// src/hooks/use-participant-count.ts
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function useParticipantCount(sessionId: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'participant_sessions'),
      where('sessionId', '==', sessionId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCount(snapshot.docs.length)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [sessionId])

  return { count, isLoading }
}