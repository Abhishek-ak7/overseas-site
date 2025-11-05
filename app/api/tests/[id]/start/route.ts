import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { AttemptStatus } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/tests/[id]/start - Start a test attempt
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const testId = params.id

    // Find the test
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        sections: {
          include: {
            questions: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                audioUrl: true,
                imageUrl: true,
                orderIndex: true,
                points: true,
                // Don't include correct answer
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    if (!test.isPublished) {
      return NextResponse.json(
        { error: 'Test is not available' },
        { status: 400 }
      )
    }

    // Check if user has access to paid test
    if (!test.isFree) {
      // Here you would check if user has purchased the test
      // For now, we'll allow paid tests for demonstration
      console.log('Note: Paid test access check needed')
    }

    // Check for existing incomplete attempt
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        userId: user.id,
        testId: testId,
        status: AttemptStatus.IN_PROGRESS,
      },
    })

    if (existingAttempt) {
      // Return existing attempt instead of creating new one
      return NextResponse.json({
        attempt: {
          id: existingAttempt.id,
          testId: existingAttempt.testId,
          startedAt: existingAttempt.startedAt,
          timeSpent: existingAttempt.timeSpent || 0,
          answers: existingAttempt.answers,
        },
        test: {
          id: test.id,
          title: test.title,
          duration: test.duration,
          totalQuestions: test.totalQuestions,
          instructions: test.instructions,
          sections: test.sections,
        },
        message: 'Resuming existing attempt'
      }, { status: 200 })
    }

    // Create new test attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: user.id,
        testId: testId,
        totalQuestions: test.totalQuestions,
        answers: {}, // Empty object to store answers
        status: AttemptStatus.IN_PROGRESS,
      },
    })

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        testId: attempt.testId,
        startedAt: attempt.startedAt,
        timeSpent: 0,
        answers: {},
      },
      test: {
        id: test.id,
        title: test.title,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        instructions: test.instructions,
        sections: test.sections,
      },
      message: 'Test started successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Start test error:', error)

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