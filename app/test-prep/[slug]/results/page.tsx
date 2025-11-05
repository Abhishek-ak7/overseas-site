'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Award, Clock, Target, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function TestResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get results from URL params (passed from test submission)
  const score = searchParams.get('score')
  const correct = searchParams.get('correct')
  const total = searchParams.get('total')
  const passed = searchParams.get('passed') === 'true'
  const testTitle = searchParams.get('title')

  if (!score || !correct || !total) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find your test results. Please try taking the test again.
            </p>
            <Link href="/test-prep">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Back to Tests
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const scorePercentage = parseInt(score)
  const correctAnswers = parseInt(correct)
  const totalQuestions = parseInt(total)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Result Header */}
        <Card className="mb-8 border-t-4 border-t-primary">
          <CardContent className="p-8">
            <div className="text-center">
              {passed ? (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                  <Target className="w-12 h-12 text-orange-600" />
                </div>
              )}

              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {passed ? 'Congratulations!' : 'Test Completed'}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {testTitle || 'Your Test'}
              </p>

              {/* Score Display */}
              <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl px-12 py-6 mb-6">
                <div className="text-6xl font-bold mb-2">{scorePercentage}%</div>
                <div className="text-lg opacity-90">Your Score</div>
              </div>

              {passed ? (
                <Badge className="bg-green-500 text-white text-lg px-6 py-2">
                  PASSED
                </Badge>
              ) : (
                <Badge className="bg-orange-500 text-white text-lg px-6 py-2">
                  KEEP PRACTICING
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Correct Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {correctAnswers}
                <span className="text-2xl text-gray-400">/{totalQuestions}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Incorrect Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">
                {totalQuestions - correctAnswers}
                <span className="text-2xl text-gray-400">/{totalQuestions}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${((totalQuestions - correctAnswers) / totalQuestions) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Message */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scorePercentage >= 90 ? (
              <div className="text-gray-700">
                <p className="font-semibold text-green-600 text-lg mb-2">Excellent Performance!</p>
                <p>You've demonstrated outstanding knowledge and skills. Keep up the great work!</p>
              </div>
            ) : scorePercentage >= 75 ? (
              <div className="text-gray-700">
                <p className="font-semibold text-blue-600 text-lg mb-2">Good Job!</p>
                <p>You're doing well. Review the areas where you missed questions to improve further.</p>
              </div>
            ) : scorePercentage >= 60 ? (
              <div className="text-gray-700">
                <p className="font-semibold text-yellow-600 text-lg mb-2">Fair Performance</p>
                <p>You're on the right track. More practice will help you achieve better results.</p>
              </div>
            ) : (
              <div className="text-gray-700">
                <p className="font-semibold text-orange-600 text-lg mb-2">Keep Practicing</p>
                <p>Don't be discouraged! Review the material and try again. Practice makes perfect!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/test-prep" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Back to Tests
            </Button>
          </Link>
          <Button
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
            onClick={() => router.back()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
