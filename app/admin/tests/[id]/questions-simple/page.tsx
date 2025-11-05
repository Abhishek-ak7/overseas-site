'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Loader2, FileText } from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  questionText: string
  questionType: string
  correctAnswer: string
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

export default function ManageQuestionsSimplePage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string

  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState<any>(null)
  const [sections, setSections] = useState<Section[]>([])

  useEffect(() => {
    fetchData()
  }, [testId])

  const fetchData = async () => {
    try {
      // Fetch test details
      const testResponse = await fetch(`/api/admin/tests/${testId}`)
      const testData = await testResponse.json()

      if (testResponse.ok && testData.test) {
        setTest(testData.test)
      }

      // Fetch questions by test ID
      const questionsResponse = await fetch(`/api/admin/tests/${testId}/questions`)
      const questionsData = await questionsResponse.json()

      if (questionsResponse.ok) {
        setSections(questionsData.sections || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
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

  if (!test) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Test not found</h3>
            <Link href="/admin/tests">
              <Button variant="outline">Back to Tests</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0)

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
            <p className="text-gray-600 mt-2">
              Manage questions and sections for this test
            </p>
            <div className="flex gap-2 mt-3">
              <Badge>{test.type}</Badge>
              <Badge variant="outline">{totalQuestions} Questions</Badge>
              <Badge variant="outline">{sections.length} Sections</Badge>
            </div>
          </div>
          <Button onClick={() => alert('Question creation form coming soon!')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Sections and Questions */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
              <p className="text-gray-600 mb-4">
                This test doesn't have any questions. Questions were added via seed script.
              </p>
              <Button onClick={() => alert('Question creation form coming soon!')}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{section.sectionName}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.questions.length} questions in this section
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert('Add question to section coming soon!')}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.questions.map((question, idx) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          {question.questionText}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{question.questionType}</Badge>
                          <Badge variant="outline">
                            {question.difficulty}
                          </Badge>
                          <span className="text-gray-600">{question.points} point(s)</span>
                          <span className="text-gray-600">
                            Correct: {question.correctAnswer}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => alert('Edit question coming soon!')}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('Delete this question?')) {
                              alert('Delete functionality coming soon!')
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
