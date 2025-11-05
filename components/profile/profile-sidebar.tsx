"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, BookOpen, GraduationCap, Calendar, CreditCard, Settings, HelpCircle } from "lucide-react"

interface UserData {
  first_name: string
  last_name: string
  email: string
  profile_picture?: string
  role: string
}

interface Stats {
  totalCourses: number
  averageProgress: number
}

export function ProfileSidebar() {
  const [activeTab, setActiveTab] = useState("overview")
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<Stats>({ totalCourses: 0, averageProgress: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Load user profile
      const profileResponse = await fetch('/api/auth/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUser(profileData.user)
      }

      // Load course statistics
      const coursesResponse = await fetch('/api/user/courses')
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        if (coursesData.statistics) {
          setStats({
            totalCourses: coursesData.statistics.totalEnrollments || 0,
            averageProgress: Math.round(coursesData.statistics.averageProgress || 0)
          })
        }
      }
    } catch (error) {
      console.error('Failed to load sidebar data:', error)
    } finally {
      setLoading(false)
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

  const menuItems = [
    { id: "overview", label: "Overview", icon: User },
    { id: "courses", label: "My Courses", icon: BookOpen, badge: stats.totalCourses > 0 ? stats.totalCourses.toString() : undefined },
    { id: "tests", label: "Test Results", icon: GraduationCap },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center space-y-4">
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarImage src={user?.profile_picture || "/placeholder-user.jpg"} alt={getFullName()} />
            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{getFullName()}</h3>
            <p className="text-gray-600 text-sm">{user?.email || ''}</p>
            <Badge className="mt-2 bg-green-100 text-green-800">
              {user?.role === 'STUDENT' ? 'Active Student' : 
               user?.role === 'INSTRUCTOR' ? 'Instructor' : 
               user?.role === 'ADMIN' ? 'Administrator' : 'User'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.totalCourses}</div>
              <div className="text-sm text-gray-600">Courses</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.averageProgress}%</div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white rounded-lg shadow-sm">
        <nav className="p-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start mb-1 ${activeTab === item.id ? "bg-primary text-white" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )
}
