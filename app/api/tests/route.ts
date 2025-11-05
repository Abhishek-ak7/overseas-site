import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, requireAuth } from '@/lib/auth'
import { TestType, DifficultyLevel, UserRole } from '@prisma/client'
import { randomUUID } from 'crypto'

const createTestSchema = z.object({
  title: z.string().min(1, 'Test title is required'),
  description: z.string().min(1, 'Test description is required'),
  type: z.enum(['IELTS', 'TOEFL', 'PTE', 'GRE', 'GMAT', 'SAT', 'ACT', 'DUOLINGO', 'CAEL', 'CELPIP', 'CUSTOM']),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalQuestions: z.number().min(1, 'Must have at least 1 question'),
  passingScore: z.number().optional(),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  price: z.number().min(0, 'Price must be positive'),
  isFree: z.boolean().optional().default(false),
  instructions: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(false),
})

const testsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  search: z.string().optional(),
  type: z.string().optional(),
  difficulty: z.string().optional(),
  isFree: z.string().optional(),
  sortBy: z.enum(['title', 'price', 'difficulty', 'created']).optional().default('created'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// GET /api/tests - List tests with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = testsQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      is_published: true,
    }

    if (validatedQuery.search) {
      where.OR = [
        { title: { contains: validatedQuery.search, mode: 'insensitive' } },
        { description: { contains: validatedQuery.search, mode: 'insensitive' } },
        { tags: { hasSome: [validatedQuery.search] } },
      ]
    }

    if (validatedQuery.type) {
      where.type = validatedQuery.type as TestType
    }

    if (validatedQuery.difficulty) {
      where.difficulty_level = validatedQuery.difficulty as DifficultyLevel
    }

    if (validatedQuery.isFree === 'true') {
      where.is_free = true
    } else if (validatedQuery.isFree === 'false') {
      where.is_free = false
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (validatedQuery.sortBy) {
      case 'title':
        orderBy.title = validatedQuery.sortOrder
        break
      case 'price':
        orderBy.price = validatedQuery.sortOrder
        break
      case 'difficulty':
        orderBy.difficulty_level = validatedQuery.sortOrder
        break
      case 'created':
      default:
        orderBy.created_at = validatedQuery.sortOrder
        break
    }

    // Get tests
    const [tests, totalCount] = await Promise.all([
      prisma.tests.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          test_sections: {
            select: {
              id: true,
              section_name: true,
              question_count: true,
              time_limit: true,
              order_index: true,
            },
            orderBy: { order_index: 'asc' },
          },
          _count: {
            select: {
              test_attempts: true,
            },
          },
        },
      }),
      prisma.tests.count({ where }),
    ])

    // Get unique test types and difficulty levels for filtering
    const [testTypes, difficultyLevels] = await Promise.all([
      prisma.tests.findMany({
        where: { is_published: true },
        select: { type: true },
        distinct: ['type'],
      }),
      prisma.tests.findMany({
        where: { is_published: true },
        select: { difficulty_level: true },
        distinct: ['difficulty_level'],
      }),
    ])

    const response = {
      tests: tests.map(test => ({
        id: test.id,
        title: test.title,
        slug: test.slug,
        description: test.description,
        type: test.type,
        duration: test.duration,
        totalQuestions: test.total_questions,
        passingScore: test.passing_score,
        difficultyLevel: test.difficulty_level,
        price: Number(test.price),
        isPublished: test.is_published,
        isFree: test.is_free,
        instructions: test.instructions,
        tags: test.tags,
        createdAt: test.created_at.toISOString(),
        updatedAt: test.updated_at.toISOString(),
        sections: test.test_sections.map(s => ({
          id: s.id,
          sectionName: s.section_name,
          questionCount: s.question_count,
          timeLimit: s.time_limit,
          orderIndex: s.order_index,
        })),
        totalAttempts: test._count.test_attempts,
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      filters: {
        testTypes: testTypes.map(t => t.type),
        difficultyLevels: difficultyLevels.map(d => d.difficulty_level),
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get tests error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/tests - Create new test (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = createTestSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingTest = await prisma.tests.findUnique({
      where: { slug },
    })

    let finalSlug = slug
    if (existingTest) {
      finalSlug = `${slug}-${Date.now()}`
    }

    const test = await prisma.tests.create({
      data: {
        id: randomUUID(),
        title: validatedData.title,
        slug: finalSlug,
        description: validatedData.description,
        type: validatedData.type as TestType,
        duration: validatedData.duration,
        total_questions: validatedData.totalQuestions,
        passing_score: validatedData.passingScore,
        difficulty_level: validatedData.difficultyLevel as DifficultyLevel,
        price: validatedData.price,
        is_free: validatedData.isFree || false,
        is_published: validatedData.isPublished || false,
        instructions: validatedData.instructions,
        tags: validatedData.tags || [],
        updated_at: new Date(),
      },
      include: {
        test_sections: true,
      },
    })

    return NextResponse.json({
      test,
      message: 'Test created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create test error:', error)

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