'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, Target, DollarSign, Play, BookOpen, CheckCircle2, AlertCircle, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TestSection {
  id: string
  sectionName: string
  description?: string | null
  questionCount: number
  timeLimit?: number | null
  orderIndex: number
}

interface Test {
  id: string
  title: string
  slug: string
  description: string
  type: string
  duration: number
  totalQuestions: number
  passingScore?: number | null
  difficultyLevel: string
  price: number
  isPublished: boolean
  isFree: boolean
  instructions?: string | null
  tags: string[]
  sections: TestSection[]
}

interface TestPrepDetailProps {
  test: Test
}

export function TestPrepDetail({ test }: TestPrepDetailProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isStarting, setIsStarting] = useState(false)

  const handleStartTest = async () => {
    setIsStarting(true)

    // Check if user is authenticated
    if (status === 'unauthenticated' || !session) {
      // Redirect to login with return URL
      const returnUrl = `/test-prep/${test.slug}`
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(returnUrl)}`)
      setIsStarting(false)
      return
    }

    // User is authenticated, proceed to test
    router.push(`/test-prep/${test.slug}/take`)
    setIsStarting(false)
  }

  const isAuthenticated = status === 'authenticated' && session?.user

  const difficultyColor = {
    EASY: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HARD: 'bg-orange-500',
    EXPERT: 'bg-red-500',
  }[test.difficultyLevel] || 'bg-gray-500'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="text-lg px-4 py-1">{test.type}</Badge>
                <Badge className={`${difficultyColor} text-white text-lg px-4 py-1`}>
                  {test.difficultyLevel}
                </Badge>
                {test.isFree && (
                  <Badge variant="outline" className="text-lg px-4 py-1 border-green-500 text-green-600">
                    FREE
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{test.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{test.description}</p>
            </div>
          </div>

          {/* Test Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{test.duration} mins</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-lg font-semibold text-gray-900">{test.totalQuestions}</p>
              </div>
            </div>

            {test.passingScore && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Target className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Passing Score</p>
                  <p className="text-lg font-semibold text-gray-900">{test.passingScore}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-lg font-semibold text-gray-900">
                  {test.isFree ? 'Free' : `$${test.price}`}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          {status === 'loading' ? (
            <Button
              disabled
              className="w-full bg-primary hover:bg-primary/90 text-white text-lg py-6 rounded-xl font-semibold"
            >
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Checking authentication...
            </Button>
          ) : !isAuthenticated ? (
            <div className="space-y-4">
              <Button
                onClick={handleStartTest}
                disabled={isStarting}
                className="w-full bg-primary hover:bg-primary/90 text-white text-lg py-6 rounded-xl font-semibold"
              >
                {isStarting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Login to Start Test
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-gray-600">
                You need to be logged in to take this test. Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary hover:underline font-semibold">
                  Register here
                </Link>
              </p>
            </div>
          ) : (
            <Button
              onClick={handleStartTest}
              disabled={isStarting}
              className="w-full bg-primary hover:bg-primary/90 text-white text-lg py-6 rounded-xl font-semibold"
            >
              {isStarting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Test Now
                </>
              )}
            </Button>
          )}
        </div>

        {/* Instructions */}
        {test.instructions && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{test.instructions}</p>
            </CardContent>
          </Card>
        )}

        {/* Test Sections */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Test Sections
            </CardTitle>
            <CardDescription>This test includes {test.sections.length} sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {test.sections.map((section, index) => (
                <div key={section.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{section.sectionName}</h3>
                    {section.description && (
                      <p className="text-gray-600 mb-2">{section.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {section.questionCount} questions
                      </span>
                      {section.timeLimit && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {section.timeLimit} minutes
                        </span>
                      )}
                    </div>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {test.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {test.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}