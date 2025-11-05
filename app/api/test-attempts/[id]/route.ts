import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

const updateAttemptSchema = z.object({
  answers: z.record(z.any()).optional(),
  timeSpent: z.number().optional(),
  currentSection: z.string().optional(),
  currentQuestion: z.number().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
})

const submitAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  answer: z.any(),
  timeSpent: z.number().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/test-attempts/[id] - Get test attempt details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const attemptId = params.id

    const attempt = await prisma.test_attempts.findUnique({
      where: { id: attemptId },
      include: {
        tests: {
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
        },
      },
    })

    if (!attempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      )
    }

    // Check if user owns this attempt or is admin
    if (attempt.user_id !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Calculate progress
    const totalQuestions = attempt.total_questions
    const answeredQuestions = Object.keys(attempt.answers || {}).length
    const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

    // Transform data for response
    const response = {
      id: attempt.id,
      testId: attempt.test_id,
      userId: attempt.user_id,
      status: attempt.status,
      score: attempt.score,
      totalQuestions: attempt.total_questions,
      correctAnswers: attempt.correct_answers,
      answers: attempt.answers,
      timeSpent: attempt.time_spent,
      currentSection: attempt.current_section,
      currentQuestion: attempt.current_question,
      startedAt: attempt.started_at.toISOString(),
      completedAt: attempt.completed_at?.toISOString(),
      sectionScores: attempt.section_scores,
      progress: {
        answeredQuestions,
        totalQuestions,
        percentage: Math.round(progressPercentage),
      },
      test: {
        id: attempt.tests.id,
        title: attempt.tests.title,
        type: attempt.tests.type,
        duration: attempt.tests.duration,
        totalQuestions: attempt.tests.total_questions,
        passingScore: attempt.tests.passing_score,
        sections: attempt.tests.test_sections.map((section: any) => ({
          id: section.id,
          sectionName: section.section_name,
          questionCount: section.question_count,
          timeLimit: section.time_limit,
          orderIndex: section.order_index,
          instructions: section.instructions,
          questions: section.test_questions.map((question: any) => ({
            id: question.id,
            questionText: question.question_text,
            questionType: question.question_type,
            options: question.options,
            points: question.points,
            difficultyLevel: question.difficulty_level,
            tags: question.tags,
            audioUrl: question.audio_url,
            imageUrl: question.image_url,
            orderIndex: question.order_index,
          })),
        })),
      },
    }

    return NextResponse.json({ attempt: response })
  } catch (error) {
    console.error('Get test attempt error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch test attempt' },
      { status: 500 }
    )
  }
}

// PUT /api/test-attempts/[id] - Update test attempt (save progress, submit answers)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const attemptId = params.id

    const body = await request.json()

    // Check if this is a submit answer request or general update
    const isSubmitAnswer = body.questionId !== undefined

    if (isSubmitAnswer) {
      const validatedData = submitAnswerSchema.parse(body)

      // Get current attempt
      const attempt = await prisma.test_attempts.findUnique({
        where: { id: attemptId },
      })

      if (!attempt) {
        return NextResponse.json(
          { error: 'Test attempt not found' },
          { status: 404 }
        )
      }

      if (attempt.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      if (attempt.status !== 'IN_PROGRESS') {
        return NextResponse.json(
          { error: 'Cannot modify completed test attempt' },
          { status: 400 }
        )
      }

      // Update answers
      const currentAnswers = attempt.answers as any || {}
      currentAnswers[validatedData.questionId] = {
        answer: validatedData.answer,
        timeSpent: validatedData.timeSpent || 0,
        timestamp: new Date().toISOString(),
      }

      const updatedAttempt = await prisma.test_attempts.update({
        where: { id: attemptId },
        data: {
          answers: currentAnswers,
          time_spent: (attempt.time_spent || 0) + (validatedData.timeSpent || 0),
          updated_at: new Date(),
        },
      })

      return NextResponse.json({
        message: 'Answer saved successfully',
        attempt: {
          id: updatedAttempt.id,
          answers: updatedAttempt.answers,
          timeSpent: updatedAttempt.time_spent,
        },
      })
    } else {
      // General update (progress, status, etc.)
      const validatedData = updateAttemptSchema.parse(body)

      const attempt = await prisma.test_attempts.findUnique({
        where: { id: attemptId },
      })

      if (!attempt) {
        return NextResponse.json(
          { error: 'Test attempt not found' },
          { status: 404 }
        )
      }

      if (attempt.user_id !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      // Build update data
      const updateData: any = {
        updated_at: new Date(),
      }

      if (validatedData.answers !== undefined) updateData.answers = validatedData.answers
      if (validatedData.timeSpent !== undefined) updateData.time_spent = validatedData.timeSpent
      if (validatedData.currentSection !== undefined) updateData.current_section = validatedData.currentSection
      if (validatedData.currentQuestion !== undefined) updateData.current_question = validatedData.currentQuestion
      if (validatedData.status !== undefined) {
        updateData.status = validatedData.status
        if (validatedData.status === 'COMPLETED') {
          updateData.completed_at = new Date()
          // TODO: Calculate score when completing
        }
      }

      const updatedAttempt = await prisma.test_attempts.update({
        where: { id: attemptId },
        data: updateData,
      })

      return NextResponse.json({
        message: 'Test attempt updated successfully',
        attempt: {
          id: updatedAttempt.id,
          status: updatedAttempt.status,
          timeSpent: updatedAttempt.time_spent,
          currentSection: updatedAttempt.current_section,
          currentQuestion: updatedAttempt.current_question,
          completedAt: updatedAttempt.completed_at?.toISOString(),
        },
      })
    }
  } catch (error) {
    console.error('Update test attempt error:', error)

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
      { error: 'Failed to update test attempt' },
      { status: 500 }
    )
  }
}

// DELETE /api/test-attempts/[id] - Delete test attempt (Admin only or user's own incomplete attempt)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const attemptId = params.id

    const attempt = await prisma.test_attempts.findUnique({
      where: { id: attemptId },
    })

    if (!attempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      )
    }

    // Only allow deletion by admin or user's own incomplete attempts
    const canDelete =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN ||
      (attempt.user_id === user.id && attempt.status === 'IN_PROGRESS')

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Cannot delete this test attempt' },
        { status: 403 }
      )
    }

    await prisma.test_attempts.delete({
      where: { id: attemptId },
    })

    return NextResponse.json({
      message: 'Test attempt deleted successfully'
    })
  } catch (error) {
    console.error('Delete test attempt error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete test attempt' },
      { status: 500 }
    )
  }
}