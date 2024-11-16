// src/app/(participant)/join/page.tsx
import { JoinSessionForm } from "@/components/participant/join-session-form"

export default function JoinSessionPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <JoinSessionForm />
    </div>
  )
}