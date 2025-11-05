"use client"

import { useState, useEffect } from 'react'

interface Course {
  id: string
  title: string
  description: string
  instructorName: string
  price: number
  currency: string
  duration: string
  level: string
  category: string
  thumbnailUrl?: string
  rating: number
  totalStudents: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface CoursesResponse {
  courses: Course[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface UseCoursesOptions {
  page?: number
  limit?: number
  search?: string
  category?: string
  level?: string
  priceRange?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useCourses(options: UseCoursesOptions = {}) {
  const [data, setData] = useState<CoursesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = async (opts: UseCoursesOptions = {}) => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()

      if (opts.page) searchParams.set('page', opts.page.toString())
      if (opts.limit) searchParams.set('limit', opts.limit.toString())
      if (opts.search) searchParams.set('search', opts.search)
      if (opts.category) searchParams.set('category', opts.category)
      if (opts.level) searchParams.set('level', opts.level)
      if (opts.priceRange) searchParams.set('priceRange', opts.priceRange)
      if (opts.sortBy) searchParams.set('sortBy', opts.sortBy)
      if (opts.sortOrder) searchParams.set('sortOrder', opts.sortOrder)

      const response = await fetch(`/api/courses?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses(options)
  }, [
    options.page,
    options.limit,
    options.search,
    options.category,
    options.level,
    options.priceRange,
    options.sortBy,
    options.sortOrder,
  ])

  const refetch = (newOptions?: UseCoursesOptions) => {
    const mergedOptions = { ...options, ...newOptions }
    fetchCourses(mergedOptions)
  }

  return {
    courses: data?.courses || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch,
  }
}

export function useCourse(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return

    const fetchCourse = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/courses/${courseId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch course')
        }

        const result = await response.json()
        setCourse(result.course)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  return { course, loading, error }
}

export function useEnrollInCourse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enrollInCourse = async (courseId: string) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to enroll in course')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { enrollInCourse, loading, error }
}