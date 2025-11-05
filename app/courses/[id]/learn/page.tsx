'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Download,
  BookOpen,
  Video,
  FileText,
  Lock,
  AlertCircle
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description: string
  type: string
  duration: number
  orderIndex: number
  isFree: boolean
  videoUrl?: string
  content?: string
  resources?: Array<{
    title: string
    url: string
    type: string
  }>
  progress: {
    isCompleted: boolean
    progressPercentage: number
    lastAccessedAt: string | null
  }
}

interface Module {
  id: string
  title: string
  description: string
  orderIndex: number
  lessons: Lesson[]
}

interface CourseAccess {
  hasAccess: boolean
  reason: string
  course: any
  enrollment: any
}

export default function CourseLearnPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [courseAccess, setCourseAccess] = useState<CourseAccess | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [videoProgress, setVideoProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [courseId])

  useEffect(() => {
    if (courseAccess?.hasAccess) {
      loadLessons()
    }
  }, [courseAccess])

  const checkAccess = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/access`)
      const data = await response.json()

      if (response.ok) {
        setCourseAccess(data)
        if (!data.hasAccess) {
          setError(data.reason)
        }
      } else {
        setError(data.error || 'Failed to check course access')
      }
    } catch (error) {
      console.error('Access check failed:', error)
      setError('Failed to check course access')
    }
  }

  const loadLessons = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`)
      const data = await response.json()

      if (response.ok) {
        setModules(data.modules)
        // Set first lesson as current if none selected
        if (!currentLessonId && data.modules.length > 0 && data.modules[0].lessons.length > 0) {
          setCurrentLessonId(data.modules[0].lessons[0].id)
        }
      } else {
        setError(data.error || 'Failed to load course content')
      }
    } catch (error) {
      console.error('Failed to load lessons:', error)
      setError('Failed to load course content')
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (lessonId: string, progressPercentage: number, timeSpent?: number) => {
    try {
      await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          progressPercentage,
          timeSpent,
        }),
      })
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const getCurrentLesson = (): Lesson | null => {
    if (!currentLessonId) return null

    for (const module of modules) {
      const lesson = module.lessons.find(l => l.id === currentLessonId)
      if (lesson) return lesson
    }
    return null
  }

  const getAllLessons = (): Lesson[] => {
    return modules.flatMap(module => module.lessons)
  }

  const navigateToLesson = (direction: 'prev' | 'next') => {
    const allLessons = getAllLessons()
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId)

    if (currentIndex === -1) return

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
    if (newIndex >= 0 && newIndex < allLessons.length) {
      setCurrentLessonId(allLessons[newIndex].id)
      setVideoProgress(0)
    }
  }

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress)
    const currentLesson = getCurrentLesson()
    if (currentLesson) {
      updateProgress(currentLesson.id, progress)
    }
  }

  const markLessonComplete = () => {
    const currentLesson = getCurrentLesson()
    if (currentLesson) {
      updateProgress(currentLesson.id, 100)
      // Update local state
      setModules(prevModules =>
        prevModules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson =>
            lesson.id === currentLesson.id
              ? { ...lesson, progress: { ...lesson.progress, isCompleted: true, progressPercentage: 100 } }
              : lesson
          )
        }))
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (!courseAccess?.hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'You do not have access to this course.'}</AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="w-full"
              >
                View Course Details
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/courses')}
                className="w-full"
              >
                Browse Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentLesson = getCurrentLesson()
  const allLessons = getAllLessons()
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId)
  const completedLessons = allLessons.filter(l => l.progress.isCompleted).length
  const overallProgress = allLessons.length > 0 ? Math.round((completedLessons / allLessons.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/courses/${courseId}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              <div>
                <h1 className="text-xl font-bold">{courseAccess.course?.title}</h1>
                <p className="text-sm text-gray-600">
                  {completedLessons} of {allLessons.length} lessons completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Overall Progress</div>
                <div className="text-lg font-bold">{overallProgress}%</div>
              </div>
              <Progress value={overallProgress} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Course Content */}
          <div className="lg:col-span-3">
            {currentLesson ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {currentLesson.type === 'VIDEO' && <Video className="h-5 w-5" />}
                        {currentLesson.type === 'TEXT' && <FileText className="h-5 w-5" />}
                        {currentLesson.title}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{currentLesson.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={currentLesson.progress.isCompleted ? 'default' : 'secondary'}>
                        {currentLesson.progress.isCompleted ? 'Completed' : 'In Progress'}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {currentLesson.duration}m
                      </div>
                    </div>
                  </div>
                  <Progress value={currentLesson.progress.progressPercentage} className="mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Video Player */}
                  {currentLesson.type === 'VIDEO' && currentLesson.videoUrl && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={currentLesson.videoUrl}
                        className="w-full h-full"
                        allowFullScreen
                        title={currentLesson.title}
                      />
                    </div>
                  )}

                  {/* Text Content */}
                  {currentLesson.content && (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                    </div>
                  )}

                  {/* Resources */}
                  {currentLesson.resources && currentLesson.resources.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Resources</h3>
                      <div className="space-y-2">
                        {currentLesson.resources.map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Download className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">{resource.title}</div>
                                <div className="text-sm text-gray-600">{resource.type}</div>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mark Complete Button */}
                  {!currentLesson.progress.isCompleted && (
                    <div className="pt-4 border-t">
                      <Button onClick={markLessonComplete} className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lesson selected</h3>
                  <p className="text-gray-600">Choose a lesson from the curriculum to start learning.</p>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => navigateToLesson('prev')}
                disabled={currentIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Button>
              <Button
                onClick={() => navigateToLesson('next')}
                disabled={currentIndex >= allLessons.length - 1}
              >
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Curriculum Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id}>
                      <div className="px-4 py-2 bg-gray-50 border-b">
                        <h4 className="font-medium text-gray-900">{module.title}</h4>
                      </div>
                      <div className="space-y-1">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <button
                            key={lesson.id}
                            onClick={() => setCurrentLessonId(lesson.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                              currentLessonId === lesson.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {lesson.progress.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : lesson.isFree || courseAccess.hasAccess ? (
                                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                ) : (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                )}
                                {lesson.type === 'VIDEO' && <Video className="h-3 w-3 text-gray-400" />}
                                {lesson.type === 'TEXT' && <FileText className="h-3 w-3 text-gray-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {lesson.title}
                                </div>
                                <div className="text-xs text-gray-600 flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration}m
                                  {lesson.progress.progressPercentage > 0 && (
                                    <span>• {lesson.progress.progressPercentage}%</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}