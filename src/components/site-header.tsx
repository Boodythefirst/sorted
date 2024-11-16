// src/components/site-header.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const isDashboard = pathname.startsWith('/dashboard')

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Sorted</span>
          </Link>
          {isDashboard && (
            <>
              <div className="mr-6 h-6 w-px bg-muted" />
              <Badge variant="outline" className="text-xs">
                Free Plan
              </Badge>
            </>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/join">Join Session</Link>
                </Button>
                {isDashboard ? (
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    Logout
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}