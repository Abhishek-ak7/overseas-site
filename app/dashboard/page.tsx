'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Clock,
  CheckCircle,
  Video,
  FileText,
  TrendingUp,
  Award,
  Target,
  Plus,
} from 'lucide-react'

interface DashboardStats {
  enrolledCourses: number
  completedCourses: number
  upcomingAppointments: number
  testsCompleted: number
}

interface RecentCourse {
  id: string
  title: string
  progress: number
  thumbnail?: string
  nextLesson?: string
  lastAccessed?: string
}

interface UpcomingAppointment {
  id: string
  title: string
  date: string
  time: string
  consultantName: string
  status: string
}

export default function UserDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    upcomingAppointments: 0,
    testsCompleted: 0,
  })
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch enrolled courses
      const coursesRes = await fetch('/api/courses/my-courses')
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        const courses = coursesData.enrollments || []

        setStats(prev => ({
          ...prev,
          enrolledCourses: courses.length,
          completedCourses: courses.filter((c: any) => c.status === 'COMPLETED').length,
        }))

        // Get recent courses (last accessed)
        const recent = courses
          .sort((a: any, b: any) =>
            new Date(b.last_accessed_at || b.enrolled_at).getTime() -
            new Date(a.last_accessed_at || a.enrolled_at).getTime()
          )
          .slice(0, 3)
          .map((enrollment: any) => ({
            id: enrollment.courses?.id || enrollment.course_id,
            title: enrollment.courses?.title || 'Course',
            progress: enrollment.progress || 0,
            thumbnail: enrollment.courses?.thumbnail_url,
            lastAccessed: enrollment.last_accessed_at,
          }))

        setRecentCourses(recent)
      }

      // Fetch appointments
      const appointmentsRes = await fetch('/api/appointments')
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        const appointments = appointmentsData.appointments || []

        const upcoming = appointments.filter((apt: any) =>
          ['SCHEDULED', 'CONFIRMED'].includes(apt.status) &&
          new Date(apt.scheduled_date) >= new Date()
        )

        setStats(prev => ({
          ...prev,
          upcomingAppointments: upcoming.length,
        }))

        setUpcomingAppointments(
          upcoming.slice(0, 3).map((apt: any) => ({
            id: apt.id,
            title: apt.appointment_types?.name || 'Consultation',
            date: apt.scheduled_date,
            time: apt.scheduled_time,
            consultantName: apt.consultants?.name || 'Consultant',
            status: apt.status,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    const time = new Date(timeStr)
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your learning overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/courses')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedCourses} completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/appointments')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/tests')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testsCompleted}</div>
            <p className="text-xs text-muted-foreground">Practice tests</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/achievements')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievement Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Keep learning!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Continue Learning</CardTitle>
                  <CardDescription>Pick up where you left off</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/courses')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                  <p className="text-gray-600 mb-4">Start your learning journey today!</p>
                  <Button onClick={() => router.push('/courses')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/courses/${course.id}/learn`)}
                    >
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-20 h-20 rounded object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{course.title}</h4>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        {course.lastAccessed && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last accessed {new Date(course.lastAccessed).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button size="sm">
                        Continue
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Your scheduled appointments</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/appointments/book')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">No upcoming appointments</p>
                  <Button size="sm" onClick={() => router.push('/appointments/book')}>
                    Book Consultation
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{appointment.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {appointment.status.toLowerCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(appointment.date)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(appointment.time)}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">with {appointment.consultantName}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/courses')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/appointments/book')}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Consultation
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/tests')}>
                <FileText className="h-4 w-4 mr-2" />
                Take Practice Test
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/profile')}>
                <Target className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
