// src/app/(dashboard)/layout.tsx
import { SideNav } from "@/components/dashboard/side-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 overflow-hidden pt-[3.5rem]">
      <SideNav />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6 px-8">
          {children}
        </div>
      </main>
    </div>
  )
}