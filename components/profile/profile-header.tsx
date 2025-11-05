"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserData {
  first_name: string
  last_name: string
  email: string
  role: string
  profile_picture?: string
}

export function ProfileHeader() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getInitials = () => {
    if (!user) return 'U'
    const firstInitial = user.first_name?.charAt(0) || ''
    const lastInitial = user.last_name?.charAt(0) || ''
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'U'
  }

  const getFullName = () => {
    if (!user) return 'User'
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
  }

  const getRoleName = () => {
    if (!user) return 'Student'
    return user.role === 'STUDENT' ? 'Student' : 
           user.role === 'INSTRUCTOR' ? 'Instructor' :
           user.role === 'ADMIN' ? 'Admin' : 'Student'
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BN</span>
            </div>
            <span className="font-bold text-gray-900">BnOverseas</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/profile/settings')}>
              <Settings className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profile_picture || "/placeholder-user.jpg"} alt={getFullName()} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              {!loading && (
                <div className="hidden md:block">
                  <div className="font-medium text-gray-900">{getFullName()}</div>
                  <div className="text-sm text-gray-600">{getRoleName()}</div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
