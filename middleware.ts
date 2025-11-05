import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Check admin-only routes
    if (pathname.startsWith('/admin')) {
      if (!token) {
        // Not authenticated - redirect to login
        const loginUrl = new URL('/auth/login', req.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }

      if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
        // Authenticated but not admin - redirect to home with error
        const homeUrl = new URL('/', req.url)
        homeUrl.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(homeUrl)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Admin routes require admin role
        if (pathname.startsWith('/admin')) {
          return !!token && (token.role === 'ADMIN' || token.role === 'SUPER_ADMIN')
        }

        // Test prep routes require authentication
        if (pathname.includes('/test-prep') && pathname.includes('/take')) {
          return !!token
        }

        // Other protected routes just need authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/dashboard/:path*',
    '/test-prep/:path*/take',
  ]
}