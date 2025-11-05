"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Clock, 
  BookOpen, 
  Users, 
  Star,
  TrendingUp,
  BarChart3,
  GraduationCap,
  CheckCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Image from 'next/image'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  short_description?: string
  instructor_name: string
  price: number
  original_price?: number
  duration: number
  level: string
  is_published: boolean
  is_featured: boolean
  total_students: number
  total_ratings: number
  rating?: number
  created_at: string
  categories?: {
    name: string
  }
}

interface Enrollment {
  id: string
  user_id: string
  course_id: string
  progress: number
  status: string
  enrolled_at: string
  last_accessed_at?: string
  courses: Course
  users: {
    name: string
    email: string
  }
}

export default function AdminCoursesOverview() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coursesResponse, enrollmentsResponse] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/admin/course-enrollments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      ])

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        setCourses(coursesData.courses || [])
      }

      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json()
        setEnrollments(enrollmentsData.enrollments || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ is_published: !currentStatus })
      })

      if (response.ok) {
        setCourses(courses.map(course => 
          course.id === courseId 
            ? { ...course, is_published: !currentStatus }
            : course
        ))
        alert(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully!`)
      } else {
        alert('Failed to update course status')
      }
    } catch (error) {
      console.error('Toggle publish error:', error)
      alert('Failed to update course status')
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const totalCourses = courses.length
  const publishedCourses = courses.filter(c => c.is_published).length
  const totalStudents = courses.reduce((sum, c) => sum + c.total_students, 0)
  const totalEnrollments = enrollments.length
  const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-gray-600 mt-1">Manage courses and student enrollments</p>
        </div>
        
        <Button onClick={() => router.push('/test-prep')}>
          <Plus className="w-4 h-4 mr-2" />
          View Test Prep
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold">{publishedCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
                <p className="text-2xl font-bold">{activeEnrollments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 rounded-t-lg overflow-hidden">
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="w-16 h-16 text-white/70" />
                    </div>
                  </div>
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white text-black">
                      {course.level}
                    </Badge>
                    {course.is_featured && (
                      <Badge className="bg-yellow-500 text-yellow-900">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <Badge variant={course.is_published ? 'default' : 'secondary'}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.short_description || course.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span>{course.instructor_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{course.duration}h</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </span>
                        {course.original_price && Number(course.original_price) > course.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${course.original_price}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{course.total_students}</span>
                      </div>
                    </div>
                    
                    {course.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">{course.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-gray-600">({course.total_ratings} reviews)</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/courses/${course.slug}`, '_blank')}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(course.id, course.is_published)}
                      >
                        {course.is_published ? 
                          <PauseCircle className="w-4 h-4" /> : 
                          <PlayCircle className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Courses will be automatically created when published in test prep.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollments</CardTitle>
              <CardDescription>
                Monitor student enrollments and progress
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Student</th>
                      <th className="text-left p-4 font-medium">Course</th>
                      <th className="text-left p-4 font-medium">Progress</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Enrolled</th>
                      <th className="text-left p-4 font-medium">Last Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.slice(0, 10).map((enrollment) => (
                      <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{enrollment.users?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-600">{enrollment.users?.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium line-clamp-1">{enrollment.courses.title}</div>
                          <div className="text-sm text-gray-600">{enrollment.courses.instructor_name}</div>
                        </td>
                        <td className="p-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{enrollment.progress}%</div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={
                              enrollment.status === 'COMPLETED' ? 'default' :
                              enrollment.status === 'ACTIVE' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {enrollment.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {format(new Date(enrollment.enrolled_at), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {enrollment.last_accessed_at ? 
                              formatDistanceToNow(new Date(enrollment.last_accessed_at), { addSuffix: true }) : 
                              'Never'
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {enrollments.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments</h3>
                    <p className="text-gray-600">Course enrollments will appear here once students start enrolling.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses
                    .sort((a, b) => b.total_students - a.total_students)
                    .slice(0, 5)
                    .map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium line-clamp-1">{course.title}</div>
                          <div className="text-sm text-gray-600">{course.instructor_name}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {course.total_students} students
                      </div>
                    </div>
                  ))}
                  
                  {courses.length === 0 && (
                    <div className="text-center py-8">
                      <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No courses available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Course analytics will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}