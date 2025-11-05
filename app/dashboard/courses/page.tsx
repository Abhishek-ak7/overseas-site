'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Clock,
  CheckCircle,
  Plus,
  Play,
  Award,
  TrendingUp,
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description?: string
  thumbnail?: string
  progress: number
  status: string
  enrolledAt: string
  lastAccessed?: string
  completedLessons: number
  totalLessons: number
  instructor?: string
  duration: number
}

export default function MyCoursesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchMyCourses()
  }, [])

  const fetchMyCourses = async () => {
    try {
      const response = await fetch('/api/courses/my-courses')
      if (response.ok) {
        const data = await response.json()
        const enrollments = data.enrollments || []

        const transformed = enrollments.map((enrollment: any) => ({
          id: enrollment.courses?.id || enrollment.course_id,
          title: enrollment.courses?.title || 'Course',
          description: enrollment.courses?.description,
          thumbnail: enrollment.courses?.thumbnail_url,
          progress: enrollment.progress || 0,
          status: enrollment.status,
          enrolledAt: enrollment.enrolled_at,
          lastAccessed: enrollment.last_accessed_at,
          completedLessons: enrollment.completed_lessons || 0,
          totalLessons: enrollment.courses?.total_lessons || 0,
          instructor: enrollment.courses?.instructor_name,
          duration: enrollment.courses?.duration || 0,
        }))

        setCourses(transformed)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = (status: string) => {
    switch (status) {
      case 'inprogress':
        return courses.filter(c => c.status === 'ACTIVE' && c.progress > 0 && c.progress < 100)
      case 'completed':
        return courses.filter(c => c.status === 'COMPLETED' || c.progress === 100)
      case 'notstarted':
        return courses.filter(c => c.progress === 0)
      default:
        return courses
    }
  }

  const filteredCourses = filterCourses(activeTab)

  const getStatusBadge = (course: Course) => {
    if (course.progress === 100 || course.status === 'COMPLETED') {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    } else if (course.progress > 0) {
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-2">Track your learning progress and continue your journey</p>
        </div>
        <Button onClick={() => router.push('/courses')}>
          <Plus className="h-4 w-4 mr-2" />
          Browse Courses
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.progress > 0 && c.progress < 100).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.progress === 100 || c.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(courses.reduce((sum, c) => sum + c.duration, 0) / 60)}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="notstarted">Not Started</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'all'
                    ? "You haven't enrolled in any courses yet."
                    : `No ${activeTab} courses.`}
                </p>
                <Button onClick={() => router.push('/courses')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Thumbnail */}
                  <div
                    className="relative h-48 bg-gray-200 cursor-pointer"
                    onClick={() => router.push(`/courses/${course.id}/learn`)}
                  >
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    {course.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                        <Progress value={course.progress} className="h-1" />
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      {getStatusBadge(course)}
                    </div>
                    {course.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2">{course.description}</p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{Math.round(course.duration / 60)}h</span>
                      </div>
                    </div>

                    {course.instructor && (
                      <p className="text-xs text-gray-500">by {course.instructor}</p>
                    )}

                    {course.lastAccessed && (
                      <p className="text-xs text-gray-500">
                        Last accessed {new Date(course.lastAccessed).toLocaleDateString()}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        className="flex-1"
                        onClick={() => router.push(`/courses/${course.id}/learn`)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {course.progress > 0 ? 'Continue' : 'Start'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/courses/${course.id}`)}
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
