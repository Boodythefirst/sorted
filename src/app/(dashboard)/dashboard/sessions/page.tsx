// src/app/(dashboard)/dashboard/sessions/page.tsx
import { SessionsHeader } from "@/components/sessions/sessions-header"
import { SessionsTable } from "@/components/sessions/sessions-table"

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <SessionsHeader />
      <SessionsTable />
    </div>
  )
}