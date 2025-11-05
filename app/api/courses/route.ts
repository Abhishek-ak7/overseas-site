import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, requireAuth } from '@/lib/auth'
import { CourseLevel, UserRole } from '@prisma/client'
import { randomUUID } from 'crypto'

const createCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required'),
  description: z.string().min(1, 'Course description is required'),
  shortDescription: z.string().optional(),
  instructorName: z.string().min(1, 'Instructor name is required'),
  price: z.number().min(0, 'Price must be positive'),
  originalPrice: z.number().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
  learningObjectives: z.array(z.string()).optional().default([]),
  maxStudents: z.number().optional(),
  language: z.string().optional().default('English'),
  isPublished: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
})

const coursesQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  search: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  featured: z.string().optional(),
  sortBy: z.enum(['title', 'price', 'rating', 'students', 'created']).optional().default('created'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// GET /api/courses - List courses with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = coursesQuerySchema.parse(queryParams)

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
        { instructorName: { contains: validatedQuery.search, mode: 'insensitive' } },
        { tags: { hasSome: [validatedQuery.search] } },
      ]
    }

    if (validatedQuery.category) {
      where.categories = { name: { equals: validatedQuery.category, mode: 'insensitive' } }
    }

    if (validatedQuery.level) {
      where.level = validatedQuery.level as CourseLevel
    }

    if (validatedQuery.minPrice || validatedQuery.maxPrice) {
      where.price = {}
      if (validatedQuery.minPrice) {
        where.price.gte = parseFloat(validatedQuery.minPrice)
      }
      if (validatedQuery.maxPrice) {
        where.price.lte = parseFloat(validatedQuery.maxPrice)
      }
    }

    if (validatedQuery.featured === 'true') {
      where.is_featured = true
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
      case 'rating':
        orderBy.rating = validatedQuery.sortOrder
        break
      case 'students':
        orderBy.total_students = validatedQuery.sortOrder
        break
      case 'created':
      default:
        orderBy.created_at = validatedQuery.sortOrder
        break
    }

    // Get courses
    const [courses, totalCount] = await Promise.all([
      prisma.courses.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          categories: true,
          _count: {
            select: {
              course_enrollments: true,
              course_reviews: true,
            },
          },
        },
      }),
      prisma.courses.count({ where }),
    ])

    // Get unique categories for filtering
    const categories = await prisma.courses.findMany({
      where: { is_published: true },
      include: { categories: true },
      distinct: ['category_id'],
    })

    const response = {
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        shortDescription: course.short_description,
        instructorName: course.instructor_name,
        price: parseFloat(course.price.toString()),
        originalPrice: course.original_price ? parseFloat(course.original_price.toString()) : null,
        currency: course.currency,
        duration: course.duration,
        level: course.level,
        category: course.categories ? {
          id: course.categories.id,
          name: course.categories.name,
          slug: course.categories.slug
        } : null,
        thumbnailUrl: course.thumbnail_url,
        videoUrl: course.video_url,
        isPublished: course.is_published,
        isFeatured: course.is_featured,
        maxStudents: course.max_students,
        language: course.language,
        requirements: course.requirements || [],
        learningObjectives: course.learning_objectives || [],
        rating: course.rating ? parseFloat(course.rating.toString()) : 0,
        totalRatings: course.total_ratings || 0,
        totalStudents: course._count.course_enrollments,
        createdAt: course.created_at.toISOString(),
        updatedAt: course.updated_at.toISOString(),
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
        categories: categories.map(c => c.categories?.name).filter(Boolean),
        levels: Object.values(CourseLevel),
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get courses error:', error)

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

// POST /api/courses - Create new course (admin/instructor only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR])

    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingCourse = await prisma.courses.findUnique({
      where: { slug },
    })

    let finalSlug = slug
    if (existingCourse) {
      finalSlug = `${slug}-${Date.now()}`
    }

    const course = await prisma.courses.create({
      data: {
        id: randomUUID(),
        title: validatedData.title,
        slug: finalSlug,
        description: validatedData.description,
        short_description: validatedData.shortDescription,
        instructor_id: user.id,
        instructor_name: validatedData.instructorName,
        price: validatedData.price,
        original_price: validatedData.originalPrice,
        duration: validatedData.duration,
        level: validatedData.level as CourseLevel,
        max_students: validatedData.maxStudents,
        language: validatedData.language || 'English',
        requirements: validatedData.requirements || [],
        learning_objectives: validatedData.learningObjectives || [],
        is_published: validatedData.isPublished || false,
        is_featured: validatedData.isFeatured || false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        course_modules: true,
        _count: {
          select: {
            course_enrollments: true,
            course_reviews: true,
          },
        },
      },
    })

    return NextResponse.json({
      course: {
        ...course,
        totalStudents: course._count.course_enrollments,
        totalReviews: course._count.course_reviews,
      },
      message: 'Course created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create course error:', error)

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