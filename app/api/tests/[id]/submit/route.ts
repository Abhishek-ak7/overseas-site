import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendEmail, EmailType } from '@/lib/email'
import { AttemptStatus } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

const submitTestSchema = z.object({
  attemptId: z.string(),
  answers: z.record(z.string()), // questionId -> answer
  timeSpent: z.number().optional(), // in seconds
})

// POST /api/tests/[id]/submit - Submit test attempt
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const testId = params.id

    const body = await request.json()
    const validatedData = submitTestSchema.parse(body)

    // Find the test attempt
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: validatedData.attemptId },
      include: {
        test: {
          include: {
            sections: {
              include: {
                questions: {
                  select: {
                    id: true,
                    correctAnswer: true,
                    points: true,
                    sectionId: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!attempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      )
    }

    if (attempt.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to test attempt' },
        { status: 403 }
      )
    }

    if (attempt.testId !== testId) {
      return NextResponse.json(
        { error: 'Test ID mismatch' },
        { status: 400 }
      )
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      return NextResponse.json(
        { error: 'Test attempt is not in progress' },
        { status: 400 }
      )
    }

    // Calculate score
    let correctAnswers = 0
    let totalPoints = 0
    let earnedPoints = 0
    const sectionScores: Record<string, any> = {}

    // Initialize section scores
    attempt.test.sections.forEach(section => {
      sectionScores[section.id] = {
        sectionName: section.sectionName,
        totalQuestions: 0,
        correctAnswers: 0,
        totalPoints: 0,
        earnedPoints: 0,
        score: 0,
      }
    })

    // Calculate scores for each question
    attempt.test.sections.forEach(section => {
      section.questions.forEach(question => {
        const userAnswer = validatedData.answers[question.id]
        const isCorrect = userAnswer === question.correctAnswer

        totalPoints += question.points
        sectionScores[section.id].totalQuestions += 1
        sectionScores[section.id].totalPoints += question.points

        if (isCorrect) {
          correctAnswers += 1
          earnedPoints += question.points
          sectionScores[section.id].correctAnswers += 1
          sectionScores[section.id].earnedPoints += question.points
        }
      })

      // Calculate section score percentage
      if (sectionScores[section.id].totalPoints > 0) {
        sectionScores[section.id].score =
          (sectionScores[section.id].earnedPoints / sectionScores[section.id].totalPoints) * 100
      }
    })

    // Calculate overall score percentage
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0

    // Update test attempt
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: validatedData.attemptId },
      data: {
        answers: validatedData.answers,
        score: score,
        correctAnswers: correctAnswers,
        timeSpent: validatedData.timeSpent,
        status: AttemptStatus.COMPLETED,
        completedAt: new Date(),
        sectionScores: sectionScores,
      },
    })

    // Determine if user passed
    const passed = attempt.test.passingScore ? score >= attempt.test.passingScore : true

    // Generate detailed results
    const results = {
      attemptId: updatedAttempt.id,
      score: score,
      passed: passed,
      totalQuestions: attempt.test.totalQuestions,
      correctAnswers: correctAnswers,
      totalPoints: totalPoints,
      earnedPoints: earnedPoints,
      timeSpent: validatedData.timeSpent || 0,
      passingScore: attempt.test.passingScore,
      sectionScores: Object.values(sectionScores),
      completedAt: updatedAttempt.completedAt,
      test: {
        id: attempt.test.id,
        title: attempt.test.title,
        type: attempt.test.type,
        difficultyLevel: attempt.test.difficultyLevel,
      },
    }

    // Send completion notification email
    try {
      await sendEmail({
        to: user.email,
        type: EmailType.TEST_COMPLETED,
        data: {
          firstName: user.firstName,
          testName: test.title,
          score: finalScore,
          totalScore: test.totalQuestions,
          percentage: Math.round((finalScore / test.totalQuestions) * 100),
          passed,
          resultsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/test-prep/results/${attempt.id}`,
        },
      })
    } catch (emailError) {
      console.error('Failed to send test completion email:', emailError)
    }

    // TODO: Generate certificate if passed
    // TODO: Update user's test statistics

    return NextResponse.json({
      results,
      message: passed ? 'Congratulations! You passed the test!' : 'Test completed. Keep practicing!'
    }, { status: 200 })
  } catch (error) {
    console.error('Submit test error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}