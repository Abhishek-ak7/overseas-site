import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const testQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  type: z.string().optional(),
  difficulty: z.string().optional(),
  published: z.string().optional(),
})

const testSectionSchema = z.object({
  id: z.string().optional(),
  sectionName: z.string().min(1, 'Section name is required'),
  description: z.string().optional(),
  questionCount: z.number().min(1, 'Question count must be at least 1'),
  timeLimit: z.number().min(1, 'Time limit must be at least 1 minute'),
  orderIndex: z.number().min(0),
  instructions: z.string().optional(),
})

const createTestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['IELTS', 'TOEFL', 'PTE', 'GRE', 'GMAT', 'SAT', 'ACT', 'DUOLINGO', 'CAEL', 'CELPIP', 'CUSTOM']),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalQuestions: z.number().min(1, 'Total questions must be at least 1'),
  passingScore: z.number().min(0).max(100, 'Passing score must be between 0 and 100'),
  price: z.number().min(0),
  isFree: z.boolean(),
  isPublished: z.boolean(),
  instructions: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  sections: z.array(testSectionSchema),
})

export async function GET(request: NextRequest) {
  try {
    // Temporarily skip auth for development
    // const user = await requireAuth(request)

    // // Verify admin access
    // if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    //   return NextResponse.json(
    //     { error: 'Access denied. Admin privileges required.' },
    //     { status: 403 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = testQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (validatedQuery.search) {
      where.OR = [
        { title: { contains: validatedQuery.search, mode: 'insensitive' } },
        { description: { contains: validatedQuery.search, mode: 'insensitive' } },
      ]
    }

    if (validatedQuery.type) {
      where.type = validatedQuery.type
    }

    if (validatedQuery.difficulty) {
      where.difficulty_level = validatedQuery.difficulty
    }

    if (validatedQuery.published) {
      where.is_published = validatedQuery.published === 'true'
    }

    // Get tests with detailed information
    const [tests, totalCount] = await Promise.all([
      prisma.tests.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          test_sections: {
            orderBy: { order_index: 'asc' },
            select: {
              id: true,
              section_name: true,
              question_count: true,
              time_limit: true,
              order_index: true,
            }
          },
          test_attempts: {
            select: {
              id: true,
              score: true,
              status: true,
              completed_at: true
            }
          },
          _count: {
            select: {
              test_attempts: true
            }
          }
        }
      }),
      prisma.tests.count({ where })
    ])

    // Transform data for admin view
    const transformedTests = tests.map(test => {
      const completedAttempts = test.test_attempts.filter(attempt => attempt.status === 'COMPLETED')
      const averageScore = completedAttempts.length > 0
        ? completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length
        : 0
      const completionRate = test.test_attempts.length > 0
        ? (completedAttempts.length / test.test_attempts.length) * 100
        : 0

      return {
        id: test.id,
        title: test.title,
        slug: test.slug,
        type: test.type,
        description: test.description,
        duration: test.duration,
        totalQuestions: test.total_questions,
        passingScore: test.passing_score,
        difficultyLevel: test.difficulty_level,
        price: Number(test.price),
        isPublished: test.is_published,
        isFree: test.is_free,
        attempts: test._count.test_attempts,
        averageScore: Math.round(averageScore),
        completionRate: Math.round(completionRate),
        createdAt: test.created_at.toISOString(),
        updatedAt: test.updated_at.toISOString(),
        sections: test.test_sections.map(section => ({
          id: section.id,
          sectionName: section.section_name,
          questionCount: section.question_count,
          timeLimit: section.time_limit,
          orderIndex: section.order_index
        }))
      }
    })

    return NextResponse.json({
      tests: transformedTests,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    })

  } catch (error) {
    console.error('Admin tests fetch error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Verify admin access
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createTestSchema.parse(body)

    // Create test with sections in a transaction
    const test = await prisma.$transaction(async (tx) => {
      const createdTest = await tx.test.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          type: validatedData.type,
          difficultyLevel: validatedData.difficultyLevel,
          duration: validatedData.duration,
          totalQuestions: validatedData.totalQuestions,
          passingScore: validatedData.passingScore,
          price: validatedData.price,
          isFree: validatedData.isFree,
          isPublished: validatedData.isPublished,
          instructions: validatedData.instructions,
          metaTitle: validatedData.metaTitle,
          metaDescription: validatedData.metaDescription,
          metaKeywords: validatedData.metaKeywords,
          createdById: user.id,
        }
      })

      // Create sections if provided
      if (validatedData.sections.length > 0) {
        await tx.testSection.createMany({
          data: validatedData.sections.map(section => ({
            testId: createdTest.id,
            sectionName: section.sectionName,
            description: section.description,
            questionCount: section.questionCount,
            timeLimit: section.timeLimit,
            orderIndex: section.orderIndex,
            instructions: section.instructions,
          }))
        })
      }

      return createdTest
    })

    return NextResponse.json({
      message: 'Test created successfully',
      test: {
        id: test.id,
        title: test.title,
        type: test.type,
        isPublished: test.isPublished,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Test creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid test data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    )
  }
}