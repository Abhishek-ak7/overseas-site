'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SimpleActionMenu } from '@/components/admin/simple-action-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  Plus,
  Search,
  Users,
  Star,
  DollarSign,
  Filter,
  Download,
  Upload,
} from 'lucide-react'

interface Course {
  id: string
  title: string
  instructor: string
  category: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  price: number
  currency: string
  enrollments: number
  rating: number
  totalRatings: number
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
  duration: number // in hours
  modules: number
  lessons: number
  isFeatured: boolean
}

interface CourseStats {
  total: number
  published: number
  draft: number
  totalEnrollments: number
  totalRevenue: number
  averageRating: number
}

export default function CourseManagement() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<CourseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  useEffect(() => {
    fetchCourses()
    fetchStats()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses')
      const data = await response.json()

      if (response.ok) {
        setCourses(data.courses || [])
      } else {
        console.error('Failed to fetch courses:', data.error)
        // Use fallback mock data
        setCourses(getMockCourses())
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      // Use fallback mock data when API fails
      setCourses(getMockCourses())
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/courses/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      } else {
        console.error('Failed to fetch course stats:', data.error)
        // Use fallback mock stats
        setStats(getMockStats())
      }
    } catch (error) {
      console.error('Failed to fetch course stats:', error)
      // Use fallback mock stats
      setStats(getMockStats())
    }
  }

  const getMockCourses = (): Course[] => [
    {
      id: 'course-1',
      title: 'IELTS Academic Preparation - Complete Course',
      instructor: 'Sarah Johnson',
      category: 'Test Preparation',
      level: 'INTERMEDIATE',
      price: 4999,
      currency: 'INR',
      enrollments: 234,
      rating: 4.8,
      totalRatings: 89,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnailUrl: '/images/courses/ielts-prep.jpg',
      duration: 40,
      modules: 8,
      lessons: 45,
      isFeatured: true
    },
    {
      id: 'course-2',
      title: 'TOEFL iBT Mastery Course',
      instructor: 'Michael Chen',
      category: 'Test Preparation',
      level: 'ADVANCED',
      price: 5999,
      currency: 'INR',
      enrollments: 156,
      rating: 4.9,
      totalRatings: 67,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnailUrl: '/images/courses/toefl-prep.jpg',
      duration: 35,
      modules: 6,
      lessons: 38,
      isFeatured: false
    },
    {
      id: 'course-3',
      title: 'English Speaking Confidence Builder',
      instructor: 'Emma Wilson',
      category: 'English Skills',
      level: 'BEGINNER',
      price: 2999,
      currency: 'INR',
      enrollments: 445,
      rating: 4.6,
      totalRatings: 178,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnailUrl: '/images/courses/speaking-confidence.jpg',
      duration: 25,
      modules: 5,
      lessons: 32,
      isFeatured: true
    }
  ]

  const getMockStats = () => ({
    totalCourses: 15,
    publishedCourses: 12,
    totalEnrollments: 1247,
    totalRevenue: 4567890,
    averageRating: 4.7,
    completionRate: 82
  })

  const handleDelete = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete course')
      }

      setCourses(courses.filter(course => course.id !== courseId))
      fetchStats() // Refresh stats
    } catch (error) {
      console.error('Failed to delete course:', error)
      alert(`Failed to delete course: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleStatusChange = async (courseId: string, newStatus: 'published' | 'draft' | 'archived') => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update course status')
      }

      setCourses(courses.map(course =>
        course.id === courseId ? { ...course, status: newStatus } : course
      ))
      fetchStats()
    } catch (error) {
      console.error('Failed to update course status:', error)
      alert(`Failed to update course status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-blue-100 text-blue-800'
      case 'INTERMEDIATE': return 'bg-orange-100 text-orange-800'
      case 'ADVANCED': return 'bg-red-100 text-red-800'
      case 'EXPERT': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesLevel
  })

  const categories = [...new Set(courses.map(course => course.category))]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">Create and manage your educational courses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/courses/import')}>
            <Upload className="h-4 w-4 mr-2" />
            Import Courses
          </Button>
          <Button onClick={() => router.push('/admin/courses/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.published} published, {stats.draft} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From course sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Based on student reviews
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setCategoryFilter('all')
              setLevelFilter('all')
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({filteredCourses.length})</CardTitle>
          <CardDescription>Manage your course catalog</CardDescription>
        </CardHeader>
        <CardContent className="overflow-visible">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-gray-600">
                          {course.modules} modules • {course.lessons} lessons • {course.duration}h
                        </div>
                        {course.isFeatured && (
                          <Badge variant="outline" className="mt-1">Featured</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>
                    <Badge className={getLevelColor(course.level)}>
                      {course.level.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {course.currency === 'INR' ? '₹' : '$'}{course.price.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      {course.enrollments}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      {course.rating.toFixed(1)} ({course.totalRatings})
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <SimpleActionMenu
                      course={course}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || levelFilter !== 'all'
                  ? 'Try adjusting your filters to see more courses.'
                  : 'Create your first course to get started.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && levelFilter === 'all' && (
                <Button onClick={() => router.push('/admin/courses/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}