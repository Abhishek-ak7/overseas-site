"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Search, 
  Play, 
  Clock, 
  Star, 
  Users, 
  BookOpen, 
  Award, 
  Target, 
  CheckCircle2, 
  PlayCircle,
  FileText,
  TrendingUp,
  Calendar,
  User,
  DollarSign,
  Globe,
  Filter,
  Heart,
  ShoppingCart
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Test {
  id: string
  title: string
  slug: string
  description: string
  type: string // IELTS, TOEFL, PTE, etc.
  duration: number // in minutes
  totalQuestions: number
  passingScore?: number
  difficultyLevel: string // EASY, MEDIUM, HARD
  price: number
  isPublished: boolean
  isFree: boolean
  instructions?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  sections: TestSection[]
  attempts?: TestAttempt[]
}

interface TestSection {
  id: string
  testId: string
  sectionName: string
  description?: string
  orderIndex: number
  questionCount: number
  timeLimit?: number
  instructions?: string
  questions: Question[]
}

interface Question {
  id: string
  sectionId: string
  questionText: string
  questionType: string // MULTIPLE_CHOICE, TRUE_FALSE, etc.
  options?: any
  correctAnswer: string
  explanation?: string
  points: number
  difficultyLevel: string
  tags: string[]
  audioUrl?: string
  imageUrl?: string
  orderIndex: number
}

interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  instructorId?: string
  instructorName: string
  price: number
  originalPrice?: number
  currency: string
  duration: number // in hours
  level: string // BEGINNER, INTERMEDIATE, ADVANCED
  categoryId?: string
  thumbnailUrl?: string
  videoUrl?: string
  isPublished: boolean
  isFeatured: boolean
  maxStudents?: number
  language: string
  requirements: string[]
  learningObjectives: string[]
  rating?: number
  totalRatings: number
  totalStudents: number
  createdAt: string
  updatedAt: string
  modules: CourseModule[]
  enrollments?: CourseEnrollment[]
}

interface CourseModule {
  id: string
  courseId: string
  title: string
  description?: string
  orderIndex: number
  contentType: string
  contentUrl?: string
  duration?: number
  isPublished: boolean
  isFree: boolean
  lessons: CourseLesson[]
}

interface CourseLesson {
  id: string
  moduleId: string
  title: string
  description?: string
  orderIndex: number
  contentType: string
  contentUrl?: string
  duration?: number
  isPublished: boolean
  isFree: boolean
}

interface TestAttempt {
  id: string
  userId: string
  testId: string
  score?: number
  totalQuestions: number
  correctAnswers: number
  answers: any
  timeSpent?: number
  status: string // IN_PROGRESS, COMPLETED, ABANDONED
  startedAt: string
  completedAt?: string
  sectionScores?: any
}

interface CourseEnrollment {
  id: string
  userId: string
  courseId: string
  progress: number
  status: string // ACTIVE, COMPLETED, SUSPENDED
  enrolledAt: string
  completedAt?: string
  certificateUrl?: string
  lastAccessedAt?: string
}

export default function TestPrepPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courses')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTests()
    fetchCourses()
  }, [])

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests')
      if (response.ok) {
        const data = await response.json()
        setTests(data.tests || [])
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollment = async (courseId: string) => {
    try {
      const response = await fetch('/api/course-enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      })

      if (response.ok) {
        alert('Successfully enrolled! You can now access the course.')
        // Refresh courses to update enrollment status
        fetchCourses()
      } else {
        alert('Failed to enroll. Please try again.')
      }
    } catch (error) {
      console.error('Enrollment error:', error)
      alert('Failed to enroll. Please try again.')
    }
  }

  const handleStartTest = async (testSlug: string) => {
    // Redirect to test detail page
    window.location.href = `/test-prep/${testSlug}`
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLevel = selectedLevel === 'all' || course.level.toLowerCase() === selectedLevel.toLowerCase()
    
    const matchesPrice = priceRange === 'all' || (() => {
      switch(priceRange) {
        case 'free': return course.price === 0
        case 'low': return course.price > 0 && course.price <= 50
        case 'medium': return course.price > 50 && course.price <= 200
        case 'high': return course.price > 200
        default: return true
      }
    })()
    
    return matchesSearch && matchesLevel && matchesPrice && course.isPublished
  })

  const filteredTests = tests.filter(test => {
    const matchesSearch = searchTerm === '' || 
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || test.type.toLowerCase() === selectedType.toLowerCase()
    
    const matchesPrice = priceRange === 'all' || (() => {
      switch(priceRange) {
        case 'free': return test.price === 0 || test.isFree
        case 'low': return test.price > 0 && test.price <= 25
        case 'medium': return test.price > 25 && test.price <= 100
        case 'high': return test.price > 100
        default: return true
      }
    })()
    
    return matchesSearch && matchesType && matchesPrice && test.isPublished
  })

  const testTypes = Array.from(new Set(tests.map(t => t.type)))
  const levels = Array.from(new Set(courses.map(c => c.level)))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Test Preparation
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Master IELTS, TOEFL, PTE, and other standardized tests with our comprehensive preparation courses and practice tests.
            </p>
            
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">{courses.length}+</div>
                <div className="text-sm text-primary-100">Courses</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">{tests.length}+</div>
                <div className="text-sm text-primary-100">Practice Tests</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">{testTypes.length}+</div>
                <div className="text-sm text-primary-100">Test Types</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-primary-100">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search courses, tests, or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:w-auto w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(selectedType !== 'all' || selectedLevel !== 'all' || priceRange !== 'all') && (
                  <Badge variant="secondary" className="ml-2">Active</Badge>
                )}
              </Button>
            </div>
            
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {testTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Level</label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {levels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Price Range</label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="low">$1 - $50</SelectItem>
                        <SelectItem value="medium">$51 - $200</SelectItem>
                        <SelectItem value="high">$200+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" onClick={() => {
                      setSelectedType('all')
                      setSelectedLevel('all')
                      setPriceRange('all')
                      setShowFilters(false)
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="courses">Preparation Courses</TabsTrigger>
            <TabsTrigger value="tests">Practice Tests</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Test Preparation Courses</h2>
              <p className="text-gray-600">
                Comprehensive courses designed by experts to help you achieve your target scores.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="w-16 h-16 text-white/70" />
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-white text-black">
                        {course.level}
                      </Badge>
                      {course.isFeatured && (
                        <Badge className="bg-yellow-500 text-yellow-900">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute top-4 right-4">
                      <Button variant="secondary" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {course.shortDescription || course.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.totalStudents}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>{course.rating?.toFixed(1) || 'New'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{course.instructorName}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">
                            {course.price === 0 ? 'Free' : `$${course.price}`}
                          </span>
                          {course.originalPrice && course.originalPrice > course.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${course.originalPrice}
                            </span>
                          )}
                        </div>
                        
                        <Button onClick={() => handleEnrollment(course.id)}>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Enroll Now
                        </Button>
                      </div>
                      
                      {course.learningObjectives.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">What you'll learn:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {course.learningObjectives.slice(0, 3).map((objective, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
                  <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tests">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Practice Tests</h2>
              <p className="text-gray-600">
                Take realistic practice tests to assess your skills and track your improvement.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{test.type}</Badge>
                      <Badge variant="secondary">{test.difficultyLevel}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{test.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {test.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>{test.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-500" />
                          <span>{test.totalQuestions} questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-orange-500" />
                          <span>Pass: {test.passingScore || 'N/A'}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-purple-500" />
                          <span>{test.price === 0 || test.isFree ? 'Free' : `$${test.price}`}</span>
                        </div>
                      </div>
                      
                      {test.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {test.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {test.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{test.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="pt-4">
                        <Button
                          className="w-full"
                          onClick={() => handleStartTest(test.slug)}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          View Test
                        </Button>
                      </div>
                      
                      {test.attempts && test.attempts.length > 0 && (
                        <div className="pt-2 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            <span>
                              Best Score: {Math.max(...test.attempts.map(a => a.score || 0))}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTests.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">My Progress</h2>
              <p className="text-gray-600">
                Track your learning progress and test performance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Enrolled Courses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enrolled Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.filter(c => c.enrollments && c.enrollments.length > 0).slice(0, 3).map((course) => (
                      <div key={course.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm line-clamp-1">{course.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {course.enrollments?.[0]?.status}
                          </Badge>
                        </div>
                        <Progress value={course.enrollments?.[0]?.progress || 0} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>{course.enrollments?.[0]?.progress || 0}% complete</span>
                          <Link href={`/courses/${course.slug}`} className="text-primary hover:underline">
                            Continue
                          </Link>
                        </div>
                      </div>
                    ))}
                    {courses.filter(c => c.enrollments && c.enrollments.length > 0).length === 0 && (
                      <div className="text-center py-8">
                        <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No enrolled courses yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Test Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tests.filter(t => t.attempts && t.attempts.length > 0).slice(0, 3).map((test) => {
                      const latestAttempt = test.attempts?.[0]
                      return (
                        <div key={test.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm line-clamp-1">{test.title}</h4>
                            <Badge 
                              variant={latestAttempt?.status === 'COMPLETED' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {latestAttempt?.status}
                            </Badge>
                          </div>
                          {latestAttempt?.score && (
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Score: {latestAttempt.score}%</span>
                              <span>{latestAttempt.correctAnswers}/{latestAttempt.totalQuestions}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {tests.filter(t => t.attempts && t.attempts.length > 0).length === 0 && (
                      <div className="text-center py-8">
                        <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No test attempts yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {tests.reduce((total, test) => total + (test.attempts?.length || 0), 0)}
                      </div>
                      <div className="text-sm text-blue-700">Tests Taken</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {courses.filter(c => c.enrollments && c.enrollments.length > 0).length}
                      </div>
                      <div className="text-sm text-green-700">Courses Enrolled</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {courses.filter(c => c.enrollments?.[0]?.status === 'COMPLETED').length}
                      </div>
                      <div className="text-sm text-purple-700">Courses Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
