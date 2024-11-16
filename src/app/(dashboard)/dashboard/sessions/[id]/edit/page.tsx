// src/app/(dashboard)/dashboard/sessions/[id]/edit/page.tsx
import { notFound } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { SessionEditForm } from "@/components/sessions/session-edit-form"
import type { Session } from "@/types/session"

interface EditPageProps {
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

export default async function EditPage({ params }: EditPageProps) {
  const session = await getSession(params.id)
  
  if (!session) {
    notFound()
  }

  return <SessionEditForm session={session} />
}