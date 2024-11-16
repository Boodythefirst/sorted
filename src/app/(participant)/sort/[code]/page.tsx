// src/app/(participant)/sort/[code]/page.tsx
import { ParticipantSortingView } from "@/components/participant/participant-sorting-view"

interface SortPageProps {
  params: {
    code: string
  }
}

export default function SortPage({ params }: SortPageProps) {
  return (
    <div className="container py-6">
      <ParticipantSortingView code={params.code} />
    </div>
  )
}