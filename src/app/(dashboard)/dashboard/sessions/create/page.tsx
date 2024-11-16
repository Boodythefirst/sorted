// src/app/(dashboard)/dashboard/sessions/create/page.tsx
import { NewSessionForm } from "@/components/sessions/new-session-form"

export default function CreateSessionPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <NewSessionForm />
    </div>
  )
}