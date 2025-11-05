'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  TrendingUp,
  Globe,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  UserPlus,
  GraduationCap,
  MessageSquare,
  Bell
} from 'lucide-react'

interface DashboardStats {
  users: {
    total: number
    new: number
    active: number
    growth: number
  }
  courses: {
    total: number
    published: number
    enrollments: number
    revenue: number
  }
  appointments: {
    today: number
    pending: number
    completed: number
    cancelled: number
  }
  revenue: {
    total: number
    monthly: number
    growth: number
    transactions: number
  }
  testPrep: {
    tests: number
    attempts: number
    avgScore: number
    completionRate: number
  }
}

interface RecentActivity {
  id: string
  type: 'enrollment' | 'appointment' | 'payment' | 'user' | 'course'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'pending' | 'warning' | 'error'
}

interface QuickAction {
  title: string
  description: string
  icon: React.ElementType
  href: string
  badge?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, activitiesResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/activities')
      ])

      const statsData = await statsResponse.json()
      const activitiesData = await activitiesResponse.json()

      setStats(statsData)
      setActivities(activitiesData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      title: 'Add New Course',
      description: 'Create a new course with curriculum',
      icon: GraduationCap,
      href: '/admin/courses/new'
    },
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: Users,
      href: '/admin/users',
      badge: stats?.users.new.toString()
    },
    {
      title: 'View Appointments',
      description: 'Manage upcoming appointments',
      icon: Calendar,
      href: '/admin/appointments',
      badge: stats?.appointments.today.toString()
    },
    {
      title: 'Content Management',
      description: 'Manage pages and blog posts',
      icon: FileText,
      href: '/admin/content'
    },
    {
      title: 'Settings',
      description: 'Configure site settings',
      icon: Settings,
      href: '/admin/settings'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: TrendingUp,
      href: '/admin/analytics'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'enrollment': return BookOpen
      case 'appointment': return Calendar
      case 'payment': return CreditCard
      case 'user': return UserPlus
      case 'course': return GraduationCap
      default: return Bell
    }
  }

  const getStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'warning': return 'text-orange-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your overview.</p>
        </div>
        <Button onClick={fetchDashboardData}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.users.growth || 0}% from last month
            </p>
            <div className="mt-2">
              <Badge variant="secondary">{stats?.users.new || 0} new this month</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.courses.enrollments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.courses.published || 0} courses published
            </p>
            <div className="mt-2">
              <Progress value={65} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.revenue.monthly?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.revenue.growth || 0}% from last month
            </p>
            <div className="mt-2">
              <Badge variant="outline">{stats?.revenue.transactions || 0} transactions</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.appointments.today || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.appointments.pending || 0} pending confirmations
            </p>
            <div className="mt-2 flex gap-1">
              <Badge variant="outline" className="text-xs">
                {stats?.appointments.completed || 0} completed
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used admin functions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-gray-600">{action.description}</div>
                  </div>
                </div>
                {action.badge && (
                  <Badge variant="secondary">{action.badge}</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 8).map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <ActivityIcon className={`h-5 w-5 ${getStatusColor(activity.status)}`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.title}</div>
                      <div className="text-xs text-gray-600">{activity.description}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Top performing courses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">IELTS Preparation Complete</div>
                  <div className="text-sm text-gray-600">125 enrollments</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">₹1,25,000</div>
                  <div className="text-sm text-gray-600">+15%</div>
                </div>
              </div>
              <Progress value={85} className="h-2" />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Study in Canada Guide</div>
                  <div className="text-sm text-gray-600">89 enrollments</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">₹89,000</div>
                  <div className="text-sm text-gray-600">+8%</div>
                </div>
              </div>
              <Progress value={72} className="h-2" />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">TOEFL Masterclass</div>
                  <div className="text-sm text-gray-600">56 enrollments</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">₹56,000</div>
                  <div className="text-sm text-gray-600">+12%</div>
                </div>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">Database Connection</div>
                    <div className="text-xs text-gray-600">All connections healthy</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600">Healthy</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">Email Service</div>
                    <div className="text-xs text-gray-600">SMTP configured and working</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-medium text-sm">File Storage</div>
                    <div className="text-xs text-gray-600">S3 bucket 78% full</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-600">Warning</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">Payment Gateways</div>
                    <div className="text-xs text-gray-600">Razorpay & Stripe active</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}