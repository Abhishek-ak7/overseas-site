'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface Question {
  id: string
  questionText: string
  questionType: string
  points: number
  difficulty: string
  orderIndex: number
}

interface Section {
  id: string
  sectionName: string
  questionCount: number
  questions: Question[]
}

export default function ManageQuestionsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const testId = params.id as string

  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState<any>(null)
  const [sections, setSections] = useState<Section[]>([])

  useEffect(() => {
    fetchTest()
  }, [testId])

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/admin/tests/${testId}`)
      const data = await response.json()

      if (response.ok && data.test) {
        setTest(data.test)
        fetchQuestions()
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      toast({
        title: "Error",
        description: "Failed to load test",
        variant: "destructive"
      })
    }
  }

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/admin/tests/${testId}/questions`)
      const data = await response.json()

      if (response.ok && data.sections) {
        setSections(data.sections)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Question deleted successfully",
        })
        fetchQuestions()
      } else {
        throw new Error('Failed to delete question')
      }
    } catch (error: any) {
      console.error('Error deleting question:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive"
      })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/tests">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
            <p className="text-gray-600 mt-2">{test?.title}</p>
          </div>
          <Button onClick={() => router.push(`/admin/tests/${testId}/questions/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Sections & Questions */}
      {sections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No questions yet. Start by adding sections and questions.</p>
            <Button onClick={() => router.push(`/admin/tests/${testId}/sections/new`)}>
              Add Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <Card key={section.id}>
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Section {sectionIndex + 1}: {section.sectionName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.questions.length} questions
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/tests/${testId}/questions/new?section=${section.id}`)}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {section.questions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No questions in this section yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {section.questions.map((question, qIndex) => (
                      <div key={question.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                            {qIndex + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 line-clamp-2 mb-2">{question.questionText}</p>
                            <div className="flex items-center gap-3 text-sm">
                              <Badge variant="outline">{question.questionType}</Badge>
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                              <span className="text-gray-500">{question.points} points</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/questions/${question.id}/edit`)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}