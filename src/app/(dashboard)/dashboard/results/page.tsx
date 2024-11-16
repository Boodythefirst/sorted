// src/app/(dashboard)/dashboard/results/page.tsx
import { ResultsOverview } from "@/components/sessions/results-overview"

export default function ResultsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Session Results</h1>
        <p className="text-muted-foreground">
          View and analyze your completed card sorting sessions
        </p>
      </div>
      <ResultsOverview />
    </div>
  )
}