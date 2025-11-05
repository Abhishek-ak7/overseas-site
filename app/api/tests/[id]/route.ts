import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, requireAuth } from '@/lib/auth'
import { TestType, DifficultyLevel, UserRole } from '@prisma/client'

const updateTestSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  type: z.enum(['IELTS', 'TOEFL', 'PTE', 'GRE', 'GMAT', 'SAT', 'ACT', 'DUOLINGO', 'CAEL', 'CELPIP', 'CUSTOM']).optional(),
  duration: z.number().min(1).optional(),
  totalQuestions: z.number().min(1).optional(),
  passingScore: z.number().optional(),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  price: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  instructions: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/tests/[id] - Get test details (supports both ID and slug)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const identifier = params.id
    const user = await getUserFromToken(request)

    // Try to find by ID first, then by slug if that fails
    let test = await prisma.test.findUnique({
      where: { id: identifier },
      include: {
        sections: {
          include: {
            questions: user ? {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                correctAnswer: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
                explanation: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
                points: true,
                difficultyLevel: true,
                tags: true,
                audioUrl: true,
                imageUrl: true,
                orderIndex: true,
              }
            } : false,
          },
          orderBy: { orderIndex: 'asc' },
        },
        attempts: user ? {
          where: { userId: user.id },
          select: {
            id: true,
            score: true,
            status: true,
            startedAt: true,
            completedAt: true,
            answers: true,
            sectionScores: true,
          },
          orderBy: { startedAt: 'desc' },
        } : false,
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    })

    // If not found by ID, try by slug
    if (!test) {
      test = await prisma.test.findUnique({
        where: { slug: identifier },
        include: {
          sections: {
            include: {
              questions: user ? {
                select: {
                  id: true,
                  questionText: true,
                  questionType: true,
                  options: true,
                  correctAnswer: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
                  explanation: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
                  points: true,
                  difficultyLevel: true,
                  tags: true,
                  audioUrl: true,
                  imageUrl: true,
                  orderIndex: true,
                }
              } : false,
            },
            orderBy: { orderIndex: 'asc' },
          },
          attempts: user ? {
            where: { userId: user.id },
            select: {
              id: true,
              score: true,
              status: true,
              startedAt: true,
              completedAt: true,
              answers: true,
              sectionScores: true,
            },
            orderBy: { startedAt: 'desc' },
          } : false,
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      })
    }

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    // Check if user can access unpublished test
    if (!test.isPublished && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'))) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    // Calculate test statistics
    const totalAttempts = test._count.attempts
    const hasAttempted = user && test.attempts && test.attempts.length > 0
    const bestScore = hasAttempted && test.attempts ? Math.max(...test.attempts.map(a => a.score || 0)) : null

    // Format response
    const response = {
      ...test,
      totalAttempts,
      hasAttempted: !!hasAttempted,
      bestScore,
      userAttempts: test.attempts || [],
    }

    return NextResponse.json({ test: response }, { status: 200 })
  } catch (error) {
    console.error('Get test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/tests/[id] - Update test (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
    const testId = params.id

    const body = await request.json()
    const validatedData = updateTestSchema.parse(body)

    // Find existing test
    const existingTest = await prisma.test.findUnique({
      where: { id: testId },
    })

    if (!existingTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    // Update slug if title changed
    let updateData: any = validatedData
    if (validatedData.title && validatedData.title !== existingTest.title) {
      const newSlug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if new slug exists
      const slugExists = await prisma.test.findFirst({
        where: {
          slug: newSlug,
          id: { not: testId },
        },
      })

      updateData.slug = slugExists ? `${newSlug}-${Date.now()}` : newSlug
    }

    // Cast enum types
    if (updateData.type) {
      updateData.type = updateData.type as TestType
    }
    if (updateData.difficultyLevel) {
      updateData.difficultyLevel = updateData.difficultyLevel as DifficultyLevel
    }

    const updatedTest = await prisma.test.update({
      where: { id: testId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        sections: {
          include: {
            questions: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                orderIndex: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    })

    return NextResponse.json({
      test: {
        ...updatedTest,
        totalAttempts: updatedTest._count.attempts,
      },
      message: 'Test updated successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Update test error:', error)

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

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/tests/[id] - Delete test (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
    const testId = params.id

    // Find existing test
    const existingTest = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        attempts: true,
      },
    })

    if (!existingTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    // Check if test has attempts
    if (existingTest.attempts.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete test with existing attempts. Please archive instead.' },
        { status: 400 }
      )
    }

    // Delete test (cascading will handle related data)
    await prisma.test.delete({
      where: { id: testId },
    })

    return NextResponse.json(
      { message: 'Test deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete test error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}