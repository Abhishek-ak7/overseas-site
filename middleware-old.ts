import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/profile',
  '/dashboard',
  '/courses/[id]/enroll',
  '/test-prep/[id]',
  '/appointments',
  '/consultations',
]

// Admin-only routes
const adminOnlyRoutes = [
  '/admin',
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/about',
  '/contact',
  '/courses',
  '/test-prep',
  '/services',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => {
    // Handle dynamic routes
    const routePattern = route.replace(/\[.*?\]/g, '[^/]+')
    const regex = new RegExp(`^${routePattern}(/.*)?$`)
    return regex.test(pathname)
  })
}

function isAdminOnlyRoute(pathname: string): boolean {
  return adminOnlyRoutes.some(route => {
    return pathname.startsWith(route)
  })
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip internal Next.js routes
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const cookieToken = request.cookies.get('auth-token')?.value
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')
  const token = cookieToken || headerToken

  // Debug logging for all requests except assets
  console.log('🔄 MIDDLEWARE DEBUG:', {
    path: pathname,
    hasCookieToken: !!cookieToken,
    hasHeaderToken: !!headerToken,
    finalToken: !!token,
    isProtected: isProtectedRoute(pathname),
    isPublic: isPublicRoute(pathname)
  })

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Allow API routes to handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internal routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    console.log('🔒 PROTECTED ROUTE DETECTED:', pathname)

    if (!token) {
      console.log('❌ NO TOKEN FOUND - Redirecting to login')
      // Redirect to login page with return URL
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    console.log('🔑 TOKEN FOUND - Verifying...')

    // Verify token
    const decoded = verifyToken(token)
    console.log('🔍 Token verification result:', !!decoded)

    if (decoded) {
      console.log('✅ TOKEN VALID - User role:', decoded.role)
      console.log('✅ User ID:', decoded.userId)
    } else {
      console.log('❌ TOKEN INVALID - Redirecting to login')
      // Invalid token, redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('auth-token')
      return response
    }

    // Check admin-only routes
    if (isAdminOnlyRoute(pathname)) {
      console.log('🔐 ADMIN ROUTE - Checking permissions for role:', decoded.role)
      if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
        console.log('❌ INSUFFICIENT PERMISSIONS - Redirecting to unauthorized')
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      console.log('✅ ADMIN ACCESS GRANTED')
    }

    // Add user info to request headers for pages to use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.userId)
    requestHeaders.set('x-user-email', decoded.email)
    requestHeaders.set('x-user-role', decoded.role)

    console.log('✅ MIDDLEWARE PASSED - Allowing access to:', pathname)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}