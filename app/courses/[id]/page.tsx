'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { CourseHero } from "@/components/courses/course-hero"
import { CourseContent } from "@/components/courses/course-content"
import { CourseEnrollment } from "@/components/courses/course-enrollment"
import { RelatedCourses } from "@/components/courses/related-courses"
import { Loader2 } from 'lucide-react'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  instructorName: string
  price: number
  originalPrice?: number
  currency: string
  duration: number
  level: string
  category: {
    id: string
    name: string
    slug: string
  }
  thumbnailUrl?: string
  videoUrl?: string
  isPublished: boolean
  isFeatured: boolean
  maxStudents?: number
  language: string
  requirements: string[]
  learningObjectives: string[]
  rating: number
  totalRatings: number
  totalStudents: number
  createdAt: string
  updatedAt: string
  modules: Array<{
    id: string
    title: string
    description?: string
    orderIndex: number
    lessons: Array<{
      id: string
      title: string
      description?: string
      contentUrl?: string
      duration: number
      orderIndex: number
      isFree: boolean
    }>
  }>
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    createdAt: string
    user: {
      id: string
      firstName: string
      lastName: string
      profile?: {
        avatarUrl?: string
      }
    }
  }>
  isEnrolled: boolean
  enrollment?: {
    id: string
    progress: number
    enrolledAt: string
    status: string
  }
  avgRating: number
  totalReviews: number
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourse()
  }, [params.id])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/courses/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          notFound()
        }
        throw new Error('Failed to fetch course')
      }

      const data = await response.json()
      setCourse(data.course)
    } catch (error) {
      console.error('Error fetching course:', error)
      setError('Failed to load course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchCourse}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CourseHero course={course} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseContent course={course} />
          </div>
          <div className="lg:col-span-1">
            <CourseEnrollment course={course} />
          </div>
        </div>
      </div>
      <RelatedCourses categorySlug={course.category.slug} currentCourseId={course.id} />
    </div>
  )
}
