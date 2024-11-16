// src/lib/sessions.ts
import { db } from "@/lib/firebase"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { Session } from "@/types/session"

export async function getRecentSessions(limitCount = 5): Promise<Session[]> {
  const q = query(
    collection(db, "sessions"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as Session[]
}