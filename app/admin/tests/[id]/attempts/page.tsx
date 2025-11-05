'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Eye, Loader2, User, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Attempt {
  id: string
  userName: string
  userEmail: string
  score: number | null
  status: string
  startedAt: string
  completedAt: string | null
  timeSpent: number
}

export default function ViewAttemptsPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string

  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState<any>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])

  useEffect(() => {
    fetchData()
  }, [testId])

  const fetchData = async () => {
    try {
      const [testRes, attemptsRes] = await Promise.all([
        fetch(`/api/admin/tests/${testId}`),
        fetch(`/api/admin/tests/${testId}/attempts`),
      ])

      const testData = await testRes.json()
      const attemptsData = await attemptsRes.json()

      if (testRes.ok && testData.test) {
        setTest(testData.test)
      }

      if (attemptsRes.ok && attemptsData.attempts) {
        setAttempts(attemptsData.attempts)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-500">In Progress</Badge>
      case 'ABANDONED':
        return <Badge variant="secondary">Abandoned</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
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
        <h1 className="text-3xl font-bold text-gray-900">Test Attempts</h1>
        <p className="text-gray-600 mt-2">{test?.title}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attempts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attempts.filter(a => a.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attempts.filter(a => a.score !== null).length > 0
                ? Math.round(
                    attempts
                      .filter(a => a.score !== null)
                      .reduce((sum, a) => sum + (a.score || 0), 0) /
                      attempts.filter(a => a.score !== null).length
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attempts.length > 0
                ? Math.round((attempts.filter(a => a.status === 'COMPLETED').length / attempts.length) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attempts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No attempts yet for this test
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Completed At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{attempt.userName}</div>
                        <div className="text-sm text-gray-500">{attempt.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                    <TableCell>
                      {attempt.score !== null ? (
                        <span className="font-semibold">{attempt.score}%</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {formatDuration(attempt.timeSpent)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(attempt.startedAt), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {attempt.completedAt
                        ? format(new Date(attempt.completedAt), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/attempts/${attempt.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}