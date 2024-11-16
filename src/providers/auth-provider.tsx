// src/providers/auth-provider.tsx
"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Loading } from '@/components/ui/loading'

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute = ['/login', '/register'].includes(pathname)
      const isProtectedRoute = pathname.startsWith('/dashboard')

      if (!user && isProtectedRoute) {
        router.push('/login')
      } else if (user && isAuthRoute) {
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return <Loading />
  }

  return children
}