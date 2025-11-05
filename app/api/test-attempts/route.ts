import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

const createAttemptSchema = z.object({
  testId: z.string().min(1, 'Test ID is required'),
})

const updateAttemptSchema = z.object({
  answers: z.record(z.any()).optional(),
  timeSpent: z.number().optional(),
  currentSection: z.string().optional(),
  currentQuestion: z.number().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
})

// GET /api/test-attempts - Get user's test attempts
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')
    const status = searchParams.get('status')

    const where: any = {
      user_id: user.id,
    }

    if (testId) {
      where.test_id = testId
    }

    if (status) {
      where.status = status
    }

    const attempts = await prisma.test_attempts.findMany({
      where,
      include: {
        tests: {
          select: {
            id: true,
            title: true,
            type: true,
            duration: true,
            total_questions: true,
            passing_score: true,
          },
        },
      },
      orderBy: { started_at: 'desc' },
    })

    return NextResponse.json({
      attempts: attempts.map((attempt: any) => ({
        id: attempt.id,
        testId: attempt.test_id,
        test: {
          id: attempt.tests.id,
          title: attempt.tests.title,
          type: attempt.tests.type,
          duration: attempt.tests.duration,
          totalQuestions: attempt.tests.total_questions,
          passingScore: attempt.tests.passing_score,
        },
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        correctAnswers: attempt.correct_answers,
        timeSpent: attempt.time_spent,
        status: attempt.status,
        startedAt: attempt.started_at.toISOString(),
        completedAt: attempt.completed_at?.toISOString(),
        sectionScores: attempt.section_scores,
      })),
    })
  } catch (error) {
    console.error('Get test attempts error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch test attempts' },
      { status: 500 }
    )
  }
}

// POST /api/test-attempts - Start a new test attempt
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Only students can take tests
    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: 'Only students can take tests' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createAttemptSchema.parse(body)

    // Find the test
    const test = await prisma.tests.findUnique({
      where: { id: validatedData.testId },
      include: {
        test_sections: {
          include: {
            test_questions: {
              select: {
                id: true,
                question_text: true,
                question_type: true,
                options: true,
                points: true,
                difficulty_level: true,
                tags: true,
                audio_url: true,
                image_url: true,
                order_index: true,
              },
              orderBy: { order_index: 'asc' },
            },
          },
          orderBy: { order_index: 'asc' },
        },
      },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    if (!test.is_published) {
      return NextResponse.json(
        { error: 'Test is not available' },
        { status: 400 }
      )
    }

    // Check if test requires payment
    if (!test.is_free && test.price.toNumber() > 0) {
      // TODO: Implement payment verification
      return NextResponse.json(
        { error: 'Payment required for this test' },
        { status: 402 }
      )
    }

    // Check for existing incomplete attempts
    const existingAttempt = await prisma.test_attempts.findFirst({
      where: {
        user_id: user.id,
        test_id: test.id,
        status: 'IN_PROGRESS',
      },
    })

    if (existingAttempt) {
      return NextResponse.json({
        attempt: {
          id: existingAttempt.id,
          testId: existingAttempt.test_id,
          status: existingAttempt.status,
          startedAt: existingAttempt.started_at.toISOString(),
          answers: existingAttempt.answers,
          currentSection: existingAttempt.current_section,
          currentQuestion: existingAttempt.current_question,
        },
        test: {
          id: test.id,
          title: test.title,
          duration: test.duration,
          sections: test.test_sections,
        },
        message: 'Resuming existing attempt'
      })
    }

    // Create new attempt
    const attempt = await prisma.test_attempts.create({
      data: {
        user_id: user.id,
        test_id: test.id,
        total_questions: test.total_questions,
        status: 'IN_PROGRESS',
        answers: {},
        current_section: test.test_sections[0]?.id || null,
        current_question: 0,
      },
    })

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        testId: attempt.test_id,
        status: attempt.status,
        startedAt: attempt.started_at.toISOString(),
        answers: attempt.answers,
        currentSection: attempt.current_section,
        currentQuestion: attempt.current_question,
      },
      test: {
        id: test.id,
        title: test.title,
        duration: test.duration,
        sections: test.test_sections,
      },
      message: 'Test attempt started successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create test attempt error:', error)

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
      { error: 'Failed to start test attempt' },
      { status: 500 }
    )
  }
}