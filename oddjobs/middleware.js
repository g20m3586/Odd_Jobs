import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/businesses',
    '/items',
    '/jobs',
    '/admin'
  ]

  // Define auth routes
  const authRoutes = ['/auth/login', '/auth/signup']

  // Redirect to login if user is not authenticated and trying to access protected routes
  if (!user && protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (user && authRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Admin route protection
  if (req.nextUrl.pathname.startsWith('/admin') && user?.email !== 'admin@email.com') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}