// src/app/(dashboard)/dashboard/sessions/[id]/preview/page.tsx
import { notFound } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { PreviewView } from "@/components/sessions/preview-view"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Session } from "@/types/session"

interface PreviewPageProps {
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
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  } as Session
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const session = await getSession(params.id)
  
  if (!session) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/sessions/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Session
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/join?code=${session.code}`} target="_blank">
              Open in New Tab
            </Link>
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Preview Mode</h2>
              <p className="text-sm text-muted-foreground">
                This is how participants will see your session
              </p>
            </div>
            <code className="px-2 py-1 bg-muted rounded text-sm">
              Session Code: {session.code}
            </code>
          </div>
        </div>
        <div className="p-6">
          <PreviewView session={session} />
        </div>
      </div>
    </div>
  )
}