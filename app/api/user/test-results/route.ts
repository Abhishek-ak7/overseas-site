import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { AttemptStatus } from '@prisma/client'

const testResultsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  testType: z.string().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'TIMED_OUT']).optional(),
})

// GET /api/user/test-results - Get user's test results
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = testResultsQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      user_id: user.id,
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status as AttemptStatus
    }

    if (validatedQuery.testType) {
      where.tests = {
        type: validatedQuery.testType,
      }
    }

    // Get test attempts with test details
    const [attempts, totalCount] = await Promise.all([
      prisma.test_attempts.findMany({
        where,
        include: {
          tests: {
            select: {
              id: true,
              title: true,
              type: true,
              difficulty_level: true,
              total_questions: true,
              passing_score: true,
              duration: true,
            },
          },
        },
        orderBy: { started_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.test_attempts.count({ where }),
    ])

    // Calculate user statistics
    const completedAttempts = await prisma.test_attempts.findMany({
      where: {
        user_id: user.id,
        status: AttemptStatus.COMPLETED,
      },
      include: {
        tests: {
          select: {
            type: true,
            passing_score: true,
          },
        },
      },
    })

    // Calculate statistics by test type
    const statsByType: Record<string, any> = {}
    completedAttempts.forEach(attempt => {
      const testType = attempt.tests.type
      if (!statsByType[testType]) {
        statsByType[testType] = {
          totalAttempts: 0,
          averageScore: 0,
          bestScore: 0,
          passedAttempts: 0,
          totalTimeSpent: 0,
        }
      }

      statsByType[testType].totalAttempts += 1
      statsByType[testType].averageScore += attempt.score || 0
      statsByType[testType].bestScore = Math.max(statsByType[testType].bestScore, attempt.score || 0)
      statsByType[testType].totalTimeSpent += attempt.time_spent || 0

      if (attempt.tests.passing_score && (attempt.score || 0) >= attempt.tests.passing_score) {
        statsByType[testType].passedAttempts += 1
      }
    })

    // Calculate average scores
    Object.keys(statsByType).forEach(testType => {
      if (statsByType[testType].totalAttempts > 0) {
        statsByType[testType].averageScore = statsByType[testType].averageScore / statsByType[testType].totalAttempts
      }
    })

    // Overall statistics
    const overallStats = {
      totalAttempts: completedAttempts.length,
      averageScore: completedAttempts.length > 0
        ? completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length
        : 0,
      bestScore: completedAttempts.length > 0
        ? Math.max(...completedAttempts.map(attempt => attempt.score || 0))
        : 0,
      totalTimeSpent: completedAttempts.reduce((sum, attempt) => sum + (attempt.time_spent || 0), 0),
      passRate: completedAttempts.length > 0
        ? (completedAttempts.filter(attempt =>
            attempt.tests.passing_score && (attempt.score || 0) >= attempt.tests.passing_score
          ).length / completedAttempts.length) * 100
        : 0,
    }

    const response = {
      results: attempts.map(attempt => ({
        id: attempt.id,
        testTitle: attempt.tests.title,
        score: attempt.score,
        completedAt: attempt.completed_at,
        sections: attempt.section_scores as Record<string, number> | undefined,
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      statistics: {
        overall: overallStats,
        byTestType: statsByType,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get test results error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
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