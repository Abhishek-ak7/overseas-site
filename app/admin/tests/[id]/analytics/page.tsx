'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Users, Target, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function TestAnalyticsPage() {
  const params = useParams()
  const testId = params.id as string

  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [testId])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/admin/tests/${testId}`)
      const data = await response.json()

      if (response.ok && data.test) {
        setTest(data.test)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/tests">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Test Analytics</h1>
        <p className="text-gray-600 mt-2">{test?.title}</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0%</div>
            <p className="text-xs text-gray-500 mt-1">Across all attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0%</div>
            <p className="text-xs text-gray-500 mt-1">Students who finish</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0m</div>
            <p className="text-xs text-gray-500 mt-1">Average completion time</p>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics Coming Soon</CardTitle>
          <CardDescription>
            Advanced analytics including question-level insights, time analysis, and performance trends will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              We're working on comprehensive analytics features for this test.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}