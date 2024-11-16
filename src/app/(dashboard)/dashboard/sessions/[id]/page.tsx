// src/app/(dashboard)/dashboard/sessions/[id]/page.tsx
import { notFound } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { SessionEditor } from "@/components/sessions/session-editor"
import type { Session } from "@/types/session"

interface SessionPageProps {
  params: {
    id: string
  }
}

async function getSession(id: string) {
  const docRef = doc(db, "sessions", id)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) {
    return null
  }
  
  const data = docSnap.data()
  
  // Convert Firestore timestamp to ISO string
  const session: Session = {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }
  
  return session
}

export default async function SessionPage({ params }: SessionPageProps) {
  const session = await getSession(params.id)
  
  if (!session) {
    notFound()
  }
  
  // Serialize the session data to ensure it's safe to pass to client component
  const serializedSession: Session = {
    ...session,
    createdAt: session.createdAt,
    cards: session.cards || [],
    categories: session.categories || [],
    isOpen: session.isOpen || false,
    participantCount: session.participantCount || 0,
  }
  
  return <SessionEditor session={serializedSession} />
}