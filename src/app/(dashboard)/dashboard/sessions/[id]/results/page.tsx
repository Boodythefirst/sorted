//src/app/(dashboard)/dashboard/sessions/[id]/results/page.tsx
import { notFound } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { ResultsView } from "@/components/sessions/results-view"
import type { Session } from "@/types/session"

interface ResultsPageProps {
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
  
  // Convert Firestore Timestamp to ISO string
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    categories: data.categories || [],
    cards: data.cards || [],
    isOpen: data.isOpen || false,
    participantCount: data.participantCount || 0,
    status: data.status || 'draft',
    code: data.code || '',
    title: data.title || '',
    description: data.description || '',
    createdBy: data.createdBy || '',
  } as Session
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const session = await getSession(params.id)
  
  if (!session) {
    notFound()
  }

  if (session.status !== 'completed') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Session Results Not Available</h1>
        <p className="text-muted-foreground">
          Results will be available once the session is completed.
        </p>
      </div>
    )
  }
  
  return <ResultsView session={session} />
}