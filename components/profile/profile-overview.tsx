"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Trophy, Calendar, TrendingUp, Play } from "lucide-react"
import { useRouter } from "next/navigation"

interface Course {
  id: string
  title: string
  progress: number
  nextLesson?: string
  status: string
  enrolledAt: string
}

interface TestResult {
  id: string
  testTitle: string
  score: number | string
  completedAt: string
  sections?: Record<string, number>
}

interface Appointment {
  id: string
  title: string
  consultantName: string
  scheduledAt: string
  type: string
  status: string
}

interface DashboardStats {
  activeCourses: number
  completedTests: number
  totalStudyTime: number
  bestScore: number | string
}

export function ProfileOverview() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [tests, setTests] = useState<TestResult[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    activeCourses: 0,
    completedTests: 0,
    totalStudyTime: 0,
    bestScore: 0
  })
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Student')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load user profile first to get user details
      const profileResponse = await fetch('/api/auth/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        const user = profileData.user
        if (user) {
          setUserName(`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Student')
        }
      }

      // Load user courses
      const coursesResponse = await fetch('/api/user/courses')
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        if (coursesData.courses && coursesData.courses.length > 0) {
          setCourses(coursesData.courses.map((c: any) => ({
            id: c.courseId,
            title: c.title,
            progress: c.progress,
            nextLesson: c.status === 'ACTIVE' ? 'Continue Learning' : undefined,
            status: c.status === 'COMPLETED' ? 'Completed' : 'In Progress',
            enrolledAt: c.enrolledAt
          })))
        }
      }

      // Load test results
      const testsResponse = await fetch('/api/user/test-results')
      if (testsResponse.ok) {
        const testsData = await testsResponse.json()
        if (testsData.results && testsData.results.length > 0) {
          setTests(testsData.results.map((t: any) => ({
            id: t.id,
            testTitle: t.testTitle,
            score: t.score?.toString() || 'N/A',
            completedAt: t.completedAt,
            sections: t.sections
          })))
        }
      }

      // Load appointments
      const appointmentsResponse = await fetch('/api/user/appointments?upcoming=true')
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        if (appointmentsData.appointments && appointmentsData.appointments.length > 0) {
          setAppointments(appointmentsData.appointments.map((a: any) => ({
            id: a.id,
            title: a.title || 'Consultation',
            consultantName: a.consultantName,
            scheduledAt: a.scheduledAt,
            type: a.meetingType || a.type,
            status: a.status
          })))
        }
      }

      // Calculate stats after loading data
      setTimeout(() => {
        calculateStats()
      }, 100)

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Keep existing mock data on error
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    setCourses([
      {
        id: '1',
        title: 'IELTS Academic Preparation',
        progress: 75,
        nextLesson: 'Writing Task 2 - Opinion Essays',
        status: 'In Progress',
        enrolledAt: '2024-01-01'
      },
      {
        id: '2',
        title: 'TOEFL iBT Complete Course',
        progress: 45,
        nextLesson: 'Speaking Section - Task 1',
        status: 'In Progress',
        enrolledAt: '2024-01-05'
      }
    ])

    setTests([
      {
        id: '1',
        testTitle: 'IELTS Mock Test #3',
        score: '7.5',
        completedAt: '2024-01-18',
        sections: {
          listening: 8.0,
          reading: 7.5,
          writing: 7.0,
          speaking: 7.5,
        }
      }
    ])

    setAppointments([
      {
        id: '1',
        title: 'Study Abroad Consultation',
        consultantName: 'Sarah Wilson',
        scheduledAt: '2024-01-22T14:00:00Z',
        type: 'Video Call',
        status: 'CONFIRMED'
      }
    ])

    setStats({
      activeCourses: 2,
      completedTests: 5,
      totalStudyTime: 45,
      bestScore: '7.5'
    })
  }

  const calculateStats = () => {
    const activeCourses = courses.filter(c => c.status === 'In Progress').length
    const completedTests = tests.length
    const totalStudyTime = courses.reduce((total, course) => {
      // Estimate study time based on progress
      return total + Math.floor(course.progress * 0.5)
    }, 0)
    
    let bestScore: number | string = 0
    if (tests.length > 0) {
      const scores = tests.map(t => {
        const score = typeof t.score === 'string' ? parseFloat(t.score) : t.score
        return isNaN(score) ? 0 : score
      })
      bestScore = Math.max(...scores)
      // Format to 1 decimal place if it's a decimal score
      if (bestScore > 0 && bestScore < 10) {
        bestScore = bestScore.toFixed(1)
      }
    }

    setStats({
      activeCourses,
      completedTests,
      totalStudyTime,
      bestScore
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const overallProgress = courses.length > 0 ?
    Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length) : 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}!</h1>
              <p className="text-gray-600 mt-1">Continue your learning journey and achieve your study abroad goals.</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.activeCourses}</div>
                <div className="text-sm text-gray-600">Active Courses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completedTests}</div>
                <div className="text-sm text-gray-600">Tests Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalStudyTime}h</div>
                <div className="text-sm text-gray-600">Study Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.bestScore}</div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.length > 0 ? courses.map((course) => (
              <div key={course.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{course.title}</h4>
                  <Badge
                    variant={course.status === "Completed" ? "default" : "secondary"}
                    className={course.status === "Completed" ? "bg-green-100 text-green-800" : ""}
                  >
                    {course.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {course.nextLesson || `Enrolled ${formatDate(course.enrolledAt)}`}
                    </span>
                    {course.status !== "Completed" && (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => router.push(`/courses/${course.id}/learn`)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No courses enrolled yet</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push('/courses')}
                >
                  Browse Courses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tests.length > 0 ? tests.map((test) => (
              <div key={test.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{test.testTitle}</h4>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{test.score}</div>
                    <div className="text-xs text-gray-600">{formatDate(test.completedAt)}</div>
                  </div>
                </div>
                {test.sections && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(test.sections).map(([section, score]) => (
                      <div key={section} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{section}:</span>
                        <span className="font-medium">{score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No test results yet</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push('/test-prep')}
                >
                  Take a Test
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length > 0 ? appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                    <p className="text-sm text-gray-600">with {appointment.consultantName}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(appointment.scheduledAt)} at {formatTime(appointment.scheduledAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{appointment.type}</Badge>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/appointments/${appointment.id}`)}
                    >
                      {appointment.type === 'Video Call' ? 'Join Call' : 'View Details'}
                    </Button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming appointments</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push('/appointments/book')}
                >
                  Book Consultation
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
