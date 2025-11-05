"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, TrendingDown, Loader2 } from "lucide-react"

interface StatsData {
  overview: {
    users: {
      total: number
      newThisMonth: number
      verified: number
      growthRate: number
    }
    courses: {
      total: number
      published: number
      enrollments: number
      activeEnrollments: number
      completedEnrollments: number
      revenue: number
    }
    tests: {
      total: number
      published: number
      attempts: number
      completed: number
      completionRate: number
    }
    revenue: {
      total: number
      thisMonth: number
      thisWeek: number
    }
  }
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch stats`)
        }
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
        console.error('Stats fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin" />
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-full p-6">
          <p className="text-center text-red-600">Error loading dashboard stats: {error}</p>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.overview.users.total.toLocaleString(),
      change: `+${stats.overview.users.growthRate.toFixed(1)}%`,
      trend: stats.overview.users.growthRate >= 0 ? "up" : "down",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Published Courses",
      value: stats.overview.courses.published.toString(),
      change: `${stats.overview.courses.activeEnrollments} active`,
      trend: "up",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Test Completion",
      value: `${stats.overview.tests.completionRate.toFixed(1)}%`,
      change: `${stats.overview.tests.completed}/${stats.overview.tests.attempts}`,
      trend: stats.overview.tests.completionRate >= 70 ? "up" : "down",
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Revenue",
      value: `₹${(stats.overview.revenue.total / 100).toLocaleString()}`,
      change: `₹${(stats.overview.revenue.thisMonth / 100).toLocaleString()} this month`,
      trend: stats.overview.revenue.thisMonth > 0 ? "up" : "down",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <Badge variant={stat.trend === "up" ? "default" : "destructive"} className="flex items-center gap-1">
                {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
