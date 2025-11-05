'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AdminLayout from '@/components/admin/layout'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // First check NextAuth session
      if (status === 'loading') {
        return // Still loading session
      }

      if (status === 'unauthenticated' || !session) {
        // Not authenticated - redirect to login
        router.push('/auth/login?callbackUrl=/admin')
        setIsLoading(false)
        return
      }

      // Check if user has admin role
      if (session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN') {
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      // User is authenticated but not an admin - redirect to home
      console.log('User role:', session.user?.role, '- Access denied to admin panel')
      router.push('/?error=unauthorized')
      setIsLoading(false)
    }

    checkAuth()
  }, [router, session, status])

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <AdminLayout>{children}</AdminLayout>
}