'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, Loader2, Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Question {
  id: string
  questionText: string
  questionType: string
  options: any
  orderIndex: number
}

interface TestSection {
  id: string
  sectionName: string
  questionCount: number
  timeLimit?: number
  questions: Question[]
}

interface Test {
  id: string
  title: string
  type: string
  duration: number
  totalQuestions: number
  sections: TestSection[]
}

export default function TakeTestPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState<Test | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Check authentication first
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      toast({
        title: "Authentication Required",
        description: "Please login to take this test",
        variant: "destructive"
      })
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/test-prep/${slug}/take`)}`)
      return
    }

    fetchTest()
  }, [slug, status])

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining])

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/tests/by-slug/${slug}/take`)
      const data = await response.json()

      if (response.ok && data.test) {
        setTest(data.test)
        setTimeRemaining(data.test.duration * 60) // Convert minutes to seconds
      } else {
        toast({
          title: "Error",
          description: "Failed to load test",
          variant: "destructive"
        })
        router.push('/test-prep')
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      toast({
        title: "Error",
        description: "Failed to load test",
        variant: "destructive"
      })
      router.push('/test-prep')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleNext = () => {
    if (!test) return

    const section = test.sections[currentSection]
    if (currentQuestion < section.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else if (currentSection < test.sections.length - 1) {
      setCurrentSection(currentSection + 1)
      setCurrentQuestion(0)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      if (test) {
        setCurrentQuestion(test.sections[currentSection - 1].questions.length - 1)
      }
    }
  }

  const handleSubmit = async () => {
    if (submitting || !test) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/tests/${test.id}/submit-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Test Completed!",
          description: `Score: ${data.results.score}% - ${data.results.passed ? 'Passed!' : 'Keep practicing!'}`,
        })
        // Redirect to results page with query params
        const params = new URLSearchParams({
          score: data.results.score.toString(),
          correct: data.results.correctAnswers.toString(),
          total: data.results.totalQuestions.toString(),
          passed: data.results.passed.toString(),
          title: data.results.testTitle || test.title,
        })
        router.push(`/test-prep/${slug}/results?${params.toString()}`)
      } else {
        throw new Error(data.error || 'Failed to submit test')
      }
    } catch (error: any) {
      console.error('Error submitting test:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit test",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateProgress = () => {
    if (!test) return 0
    const totalQuestions = test.sections.reduce((sum, s) => sum + s.questions.length, 0)
    const answeredCount = Object.keys(answers).length
    return (answeredCount / totalQuestions) * 100
  }

  // Show loading while checking auth or fetching test
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">
            {status === 'loading' ? 'Verifying authentication...' : 'Loading test...'}
          </p>
        </div>
      </div>
    )
  }

  // If not authenticated after loading, this will redirect via useEffect
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Lock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You must be logged in to take this test. Redirecting to login...
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <p className="text-lg text-gray-900">Test not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const section = test.sections[currentSection]
  const question = section.questions[currentQuestion]
  const isLastQuestion = currentSection === test.sections.length - 1 && currentQuestion === section.questions.length - 1

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{test.title}</h1>
                <p className="text-sm text-gray-600">
                  Section {currentSection + 1} of {test.sections.length}: {section.sectionName}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="text-lg font-mono font-semibold">{formatTime(timeRemaining)}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-lg font-semibold">{Math.round(calculateProgress())}%</p>
                </div>
              </div>
            </div>
            <Progress value={calculateProgress()} className="mt-4" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Question {currentQuestion + 1} of {section.questions.length}</span>
              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4 mr-2" />
                Flag for Review
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg leading-relaxed whitespace-pre-line">
              {question.questionText}
            </div>

            {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswer(question.id, value)}
              >
                <div className="space-y-3">
                  {Object.entries(question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center space-x-3 border-2 border-gray-200 rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => handleAnswer(question.id, key)}
                    >
                      <RadioGroupItem value={key} id={`option-${key}`} />
                      <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer text-base">
                        <span className="font-semibold mr-2">{key}.</span>
                        {value as string}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {question.questionType === 'FILL_BLANK' && (
              <Textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="text-base"
              />
            )}

            {(question.questionType === 'SPEAKING' || question.questionType === 'WRITING') && (
              <Textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder={`Type your ${question.questionType.toLowerCase()} response here...`}
                rows={8}
                className="text-base"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 0 && currentQuestion === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-gray-600">
            {Object.keys(answers).length} of {test.totalQuestions} answered
          </div>

          {isLastQuestion ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Test
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}