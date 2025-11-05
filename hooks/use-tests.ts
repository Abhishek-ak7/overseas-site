"use client"

import { useState, useEffect } from 'react'

interface Test {
  id: string
  title: string
  description: string
  type: string
  duration: number
  totalQuestions: number
  passingScore: number
  difficultyLevel: string
  price: number
  currency: string
  isPublished: boolean
  isFree: boolean
  attempts: number
  averageScore: number
  completionRate: number
  createdAt: string
  updatedAt: string
  sections: TestSection[]
}

interface TestSection {
  id: string
  sectionName: string
  questionCount: number
  timeLimit: number
  orderIndex: number
}

interface TestsResponse {
  tests: Test[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface TestAttempt {
  id: string
  score: number
  totalQuestions: number
  percentage: number
  passed: boolean
  timeSpent: number
  status: string
  startedAt: string
  completedAt?: string
  test: {
    title: string
    passingScore: number
    difficultyLevel: string
  }
}

interface UseTestsOptions {
  page?: number
  limit?: number
  search?: string
  type?: string
  difficulty?: string
  published?: string
}

export function useTests(options: UseTestsOptions = {}) {
  const [data, setData] = useState<TestsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTests = async (opts: UseTestsOptions = {}) => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()

      if (opts.page) searchParams.set('page', opts.page.toString())
      if (opts.limit) searchParams.set('limit', opts.limit.toString())
      if (opts.search) searchParams.set('search', opts.search)
      if (opts.type) searchParams.set('type', opts.type)
      if (opts.difficulty) searchParams.set('difficulty', opts.difficulty)
      if (opts.published) searchParams.set('published', opts.published)

      const response = await fetch(`/api/tests?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch tests')
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
    fetchTests(options)
  }, [
    options.page,
    options.limit,
    options.search,
    options.type,
    options.difficulty,
    options.published,
  ])

  const refetch = (newOptions?: UseTestsOptions) => {
    const mergedOptions = { ...options, ...newOptions }
    fetchTests(mergedOptions)
  }

  return {
    tests: data?.tests || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch,
  }
}

export function useTest(testId: string) {
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!testId) return

    const fetchTest = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/tests/${testId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch test')
        }

        const result = await response.json()
        setTest(result.test)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId])

  return { test, loading, error }
}

export function useStartTest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startTest = async (testId: string) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/tests/${testId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start test')
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

  return { startTest, loading, error }
}

export function useSubmitTest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitTest = async (testId: string, answers: Record<string, any>) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit test')
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

  return { submitTest, loading, error }
}

export function useTestResults() {
  const [results, setResults] = useState<TestAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('auth_token')
        if (!token) {
          throw new Error('Authentication required')
        }

        const response = await fetch('/api/user/test-results', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch test results')
        }

        const result = await response.json()
        setResults(result.results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  return { results, loading, error }
}