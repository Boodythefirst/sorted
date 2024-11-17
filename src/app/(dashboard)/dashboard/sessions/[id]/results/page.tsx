// src/app/(dashboard)/dashboard/sessions/[id]/results/page.tsx
import { notFound } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { SessionResultsView } from "@/components/sessions/session-results-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
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
    return {
      id: docSnap.id,
      ...data,
      type: data.type || 'closed', // Provide a default value
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as Session
  }

export default async function ResultsPage({ params }: ResultsPageProps) {
  const session = await getSession(params.id)
  
  if (!session) {
    notFound()
  }

  if (session.status !== 'completed') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/sessions/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Session
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <h1 className="text-2xl font-bold">Results Not Available</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Results will be available once the session is completed.
            {session.status === 'draft' 
              ? " Start the session to begin collecting responses."
              : " End the session to view results."}
          </p>
          <Button asChild>
            <Link href={`/dashboard/sessions/${params.id}`}>
              View Session Details
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/sessions/${params.id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Session
        </Link>
      </Button>
      <SessionResultsView session={session} />
    </div>
  )
}