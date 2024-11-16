// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const isAuthenticated = !!authCookie
  
  // Paths that require authentication
  const protectedPaths = ['/dashboard']
  // Paths that should not be accessible when authenticated
  const authPaths = ['/login', '/register']
  
  const path = request.nextUrl.pathname
  
  // Check if the path starts with any protected path
  const isProtectedPath = protectedPaths.some(prefix => path.startsWith(prefix))
  // Check if the path is an auth path
  const isAuthPath = authPaths.some(prefix => path === prefix)
  
  if (isProtectedPath && !isAuthenticated) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  if (isAuthPath && isAuthenticated) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
}