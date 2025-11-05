"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RecentActivity {
  id: string
  user: string
  type: string
  action: string
  timestamp: string
}

interface RecentActivitiesData {
  users: Array<{
    id: string
    first_name: string
    last_name: string
    email: string
    created_at: string
    role: string
  }>
  enrollments: Array<{
    id: string
    user: string
    course: string
    enrolledAt: string
  }>
  appointments: Array<{
    id: string
    user: string
    consultant: string
    type: string
    scheduledDate: string
    status: string
  }>
  testAttempts: Array<{
    id: string
    user: string
    test: string
    score: number
    completedAt: string
  }>
}

export function RecentActivity() {
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await fetch('/api/admin/stats', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent activities')
        }
        
        const data = await response.json()
        const recentActivities = data.recentActivities as RecentActivitiesData
        
        // Transform the data into a unified activity format
        const combinedActivities: RecentActivity[] = [
          ...recentActivities.users.map(user => ({
            id: `user-${user.id}`,
            user: `${user.first_name} ${user.last_name}`,
            type: 'user',
            action: 'New user registered',
            timestamp: user.created_at
          })),
          ...recentActivities.enrollments.map(enrollment => ({
            id: `enrollment-${enrollment.id}`,
            user: enrollment.user,
            type: 'enrollment',
            action: `Enrolled in ${enrollment.course}`,
            timestamp: enrollment.enrolledAt
          })),
          ...recentActivities.appointments.map(appointment => ({
            id: `appointment-${appointment.id}`,
            user: appointment.user,
            type: 'appointment',
            action: `Booked appointment: ${appointment.type}`,
            timestamp: appointment.scheduledDate
          })),
          ...recentActivities.testAttempts.map(attempt => ({
            id: `test-${attempt.id}`,
            user: attempt.user,
            type: 'test',
            action: `Completed ${attempt.test} (Score: ${attempt.score || 'N/A'})`,
            timestamp: attempt.completedAt
          }))
        ]
        
        // Sort by timestamp (most recent first) and take top 10
        const sortedActivities = combinedActivities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
        
        setActivities(sortedActivities)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recent activities')
        console.error('Recent activity fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  const getStatusColor = (type: string) => {
    switch (type) {
      case "enrollment":
        return "bg-green-100 text-green-800"
      case "appointment":
        return "bg-yellow-100 text-yellow-800"
      case "test":
        return "bg-blue-100 text-blue-800"
      case "user":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center text-red-600 py-4">Error loading activities: {error}</p>
        ) : (
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent activities</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt={activity.user} />
                    <AvatarFallback className="text-xs">{getInitials(activity.user)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">{activity.user}</span>
                      <Badge className={`text-xs ${getStatusColor(activity.type)}`}>{activity.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
