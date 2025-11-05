"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export default function TestAuthPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const testAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        
        if (!token) {
          setError('No token found in localStorage')
          setLoading(false)
          return
        }

        console.log('Token found:', token.substring(0, 20) + '...')

        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (response.ok) {
          const data = await response.json()
          console.log('Profile data:', data)
          setUser(data.user)
        } else {
          const errorText = await response.text()
          console.log('Error response:', errorText)
          setError(`API Error: ${response.status} - ${errorText}`)
        }
      } catch (err) {
        console.error('Test auth error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    testAuth()
  }, [])

  const clearToken = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Testing authentication...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Authentication Test</h1>
        <p className="text-gray-600 mt-1">Debug admin authentication</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Token Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Token in localStorage:</span>
                <Badge variant={localStorage.getItem('auth_token') ? 'default' : 'destructive'}>
                  {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}
                </Badge>
              </div>
              {localStorage.getItem('auth_token') && (
                <div className="text-sm text-gray-600">
                  Token preview: {localStorage.getItem('auth_token')?.substring(0, 50)}...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-800 mb-2">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
                <Button onClick={clearToken} variant="outline">
                  Clear Token & Login Again
                </Button>
              </div>
            ) : user ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Authentication Successful</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">ID:</span> {user.id}</div>
                    <div><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</div>
                    <div><span className="font-medium">Email:</span> {user.email}</div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Role:</span>
                      <Badge variant={user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800">No user data received</h3>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()}>
                Refresh Test
              </Button>
              <Button onClick={clearToken} variant="outline">
                Clear Tokens & Logout
              </Button>
              <Button onClick={() => router.push('/admin')} variant="outline">
                Back to Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}