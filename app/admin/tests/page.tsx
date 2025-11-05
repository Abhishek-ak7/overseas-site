"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Clock,
  FileText,
  Users,
  Target,
  Filter,
  Download,
  Upload,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  BarChart3,
  Settings,
  Brain,
  MoreHorizontal,
  Play,
  Pause
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Test {
  id: string
  title: string
  slug: string
  type: 'IELTS' | 'TOEFL' | 'PTE' | 'GRE' | 'GMAT' | 'SAT' | 'ACT' | 'DUOLINGO' | 'CAEL' | 'CELPIP' | 'CUSTOM'
  description: string
  duration: number // in minutes
  totalQuestions: number
  passingScore?: number
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'
  price: number
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
  timeLimit?: number
  orderIndex: number
}

interface TestStats {
  total: number
  published: number
  free: number
  totalAttempts: number
  averageScore: number
  completionRate: number
}

export default function TestManagement() {
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [stats, setStats] = useState<TestStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    fetchTests()
    fetchStats()
  }, [])

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/admin/tests')
      const data = await response.json()

      if (response.ok) {
        setTests(data.tests || [])
      } else {
        console.error('Failed to fetch tests:', data.error)
        setTests([])
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error)
      setTests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/tests/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      } else {
        console.error('Failed to fetch test stats:', data.error)
        // Calculate stats from tests
        setStats({
          total: tests.length,
          published: tests.filter(t => t.isPublished).length,
          free: tests.filter(t => t.isFree).length,
          totalAttempts: tests.reduce((sum, t) => sum + (t.attempts || 0), 0),
          averageScore: tests.length > 0 ? Math.round(tests.reduce((sum, t) => sum + (t.averageScore || 0), 0) / tests.length) : 0,
          completionRate: tests.length > 0 ? Math.round(tests.reduce((sum, t) => sum + (t.completionRate || 0), 0) / tests.length) : 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch test stats:', error)
      // Calculate stats from tests
      setStats({
        total: tests.length,
        published: tests.filter(t => t.isPublished).length,
        free: tests.filter(t => t.isFree).length,
        totalAttempts: tests.reduce((sum, t) => sum + (t.attempts || 0), 0),
        averageScore: tests.length > 0 ? Math.round(tests.reduce((sum, t) => sum + (t.averageScore || 0), 0) / tests.length) : 0,
        completionRate: tests.length > 0 ? Math.round(tests.reduce((sum, t) => sum + (t.completionRate || 0), 0) / tests.length) : 0
      })
    }
  }

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return
    }

    try {
      await fetch(`/api/admin/tests/${testId}`, {
        method: 'DELETE'
      })

      setTests(tests.filter(test => test.id !== testId))
      fetchStats()
    } catch (error) {
      console.error('Failed to delete test:', error)
    }
  }

  const handleToggleStatus = async (testId: string, newStatus: boolean) => {
    try {
      await fetch(`/api/admin/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newStatus })
      })

      setTests(tests.map(test =>
        test.id === testId ? { ...test, isPublished: newStatus } : test
      ))
      fetchStats()
    } catch (error) {
      console.error('Failed to update test status:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'IELTS': return 'bg-blue-100 text-blue-800'
      case 'TOEFL': return 'bg-green-100 text-green-800'
      case 'PTE': return 'bg-purple-100 text-purple-800'
      case 'GRE': return 'bg-orange-100 text-orange-800'
      case 'GMAT': return 'bg-red-100 text-red-800'
      case 'SAT': return 'bg-indigo-100 text-indigo-800'
      case 'ACT': return 'bg-pink-100 text-pink-800'
      case 'DUOLINGO': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HARD': return 'bg-orange-100 text-orange-800'
      case 'EXPERT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || test.type === typeFilter
    const matchesDifficulty = difficultyFilter === 'all' || test.difficultyLevel === difficultyFilter
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'published' && test.isPublished) ||
                         (statusFilter === 'draft' && !test.isPublished) ||
                         (statusFilter === 'free' && test.isFree)

    return matchesSearch && matchesType && matchesDifficulty && matchesStatus
  })

  const testTypes = ['IELTS', 'TOEFL', 'PTE', 'GRE', 'GMAT', 'SAT', 'ACT', 'DUOLINGO', 'CAEL', 'CELPIP', 'CUSTOM']

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
          <h1 className="text-3xl font-bold text-gray-900">Test Preparation Management</h1>
          <p className="text-gray-600">Create and manage practice tests for various exams</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/tests/question-bank')}>
            <FileText className="h-4 w-4 mr-2" />
            Question Bank
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/tests/import')}>
            <Upload className="h-4 w-4 mr-2" />
            Import Questions
          </Button>
          <Button onClick={() => router.push('/admin/tests/edit/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.published} published, {stats.free} free
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
              <p className="text-xs text-muted-foreground">
                Across all tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                Student performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Students who finish tests
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
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Test Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {testTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="free">Free Tests</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setTypeFilter('all')
              setDifficultyFilter('all')
              setStatusFilter('all')
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tests ({filteredTests.length})</CardTitle>
          <CardDescription>Manage your test preparation content</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{test.title}</div>
                        <div className="text-sm text-gray-600">{test.sections.length} sections</div>
                        {test.isFree && (
                          <Badge variant="outline" className="mt-1">Free</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(test.type)}>
                      {test.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(test.difficultyLevel)}>
                      {test.difficultyLevel.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-gray-400" />
                      {test.totalQuestions}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {test.duration} min
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {test.isFree ? 'Free' : `₹${test.price.toLocaleString()}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      {test.attempts}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-gray-400" />
                      {test.averageScore}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={test.isPublished ? "default" : "secondary"}>
                        {test.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(test.id, !test.isPublished)}
                      >
                        {test.isPublished ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setOpenDropdown(openDropdown === test.id ? null : test.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openDropdown === test.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenDropdown(null)}
                          />
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setOpenDropdown(null)
                                  router.push(`/admin/tests/edit/${test.id}`)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit Test
                              </button>
                              <button
                                onClick={() => {
                                  setOpenDropdown(null)
                                  router.push(`/admin/tests/${test.id}/questions-simple`)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View Questions
                              </button>
                              <button
                                onClick={() => {
                                  setOpenDropdown(null)
                                  window.open(`/test-prep/${test.slug}`, '_blank')
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Preview Test
                              </button>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={() => {
                                  setOpenDropdown(null)
                                  if (confirm('Are you sure you want to delete this test?')) {
                                    handleDelete(test.id)
                                  }
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTests.length === 0 && (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || typeFilter !== 'all' || difficultyFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more tests.'
                  : 'Create your first test to get started.'
                }
              </p>
              {!searchTerm && typeFilter === 'all' && difficultyFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => router.push('/admin/tests/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}