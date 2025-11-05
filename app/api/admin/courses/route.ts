import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { CourseLevel, UserRole } from '@prisma/client'

const adminCoursesQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  published: z.string().optional(),
  instructor: z.string().optional(),
  sortBy: z.enum(['title', 'students', 'revenue', 'rating', 'created']).optional().default('created'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// GET /api/admin/courses - Admin course management
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = adminCoursesQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Instructors can only see their own courses
    if (user.role === UserRole.INSTRUCTOR) {
      where.instructorId = user.id
    }

    if (validatedQuery.search) {
      where.OR = [
        { title: { contains: validatedQuery.search, mode: 'insensitive' } },
        { description: { contains: validatedQuery.search, mode: 'insensitive' } },
        { instructor_name: { contains: validatedQuery.search, mode: 'insensitive' } },
        { categories: { name: { contains: validatedQuery.search, mode: 'insensitive' } } },
      ]
    }

    if (validatedQuery.category) {
      where.category_id = validatedQuery.category
    }

    if (validatedQuery.level) {
      where.level = validatedQuery.level as CourseLevel
    }

    if (validatedQuery.published !== undefined) {
      where.is_published = validatedQuery.published === 'true'
    }

    if (validatedQuery.instructor) {
      where.instructor_name = { contains: validatedQuery.instructor, mode: 'insensitive' }
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (validatedQuery.sortBy) {
      case 'title':
        orderBy.title = validatedQuery.sortOrder
        break
      case 'students':
        orderBy.total_students = validatedQuery.sortOrder
        break
      case 'rating':
        orderBy.rating = validatedQuery.sortOrder
        break
      case 'created':
      default:
        orderBy.created_at = validatedQuery.sortOrder
        break
    }

    // Get courses with detailed information
    const [courses, totalCount] = await Promise.all([
      prisma.courses.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
            }
          },
          course_modules: {
            select: {
              id: true,
              title: true,
              order_index: true,
              is_published: true,
              _count: {
                select: {
                  course_lessons: true,
                }
              }
            },
            orderBy: { order_index: 'asc' },
          },
          course_enrollments: {
            select: {
              id: true,
              status: true,
              progress: true,
              enrolled_at: true,
              users: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                }
              }
            },
            orderBy: { enrolled_at: 'desc' },
            take: 5, // Latest 5 enrollments
          },
          course_reviews: {
            select: {
              id: true,
              rating: true,
              review_text: true,
              created_at: true,
              users: {
                select: {
                  first_name: true,
                  last_name: true,
                }
              }
            },
            where: { is_published: true },
            orderBy: { created_at: 'desc' },
            take: 3, // Latest 3 reviews
          },
          transactions: {
            where: { status: 'COMPLETED', type: 'COURSE_PURCHASE' },
            select: {
              amount: true,
              created_at: true,
            }
          },
          _count: {
            select: {
              course_enrollments: true,
              course_reviews: true,
              course_modules: true,
            }
          }
        },
      }),
      prisma.courses.count({ where }),
    ])

    // Transform courses data for frontend compatibility
    const coursesWithMetrics = courses.map(course => {
      const totalRevenue = course.transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0)
      const avgProgress = course.course_enrollments.length > 0
        ? course.course_enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / course.course_enrollments.length
        : 0
      const totalLessons = course.course_modules.reduce((sum: number, m: any) => sum + m._count.course_lessons, 0)

      return {
        id: course.id,
        title: course.title,
        instructor: course.instructor_name,
        category: course.categories?.name || 'Uncategorized',
        level: course.level,
        price: parseFloat(course.price.toString()),
        currency: course.currency,
        enrollments: course._count.course_enrollments,
        rating: course.rating || 0,
        totalRatings: course.total_ratings,
        status: course.is_published ? 'published' : 'draft',
        createdAt: course.created_at.toISOString(),
        updatedAt: course.updated_at.toISOString(),
        thumbnailUrl: course.thumbnail_url,
        duration: course.duration,
        modules: course._count.course_modules,
        lessons: totalLessons,
        isFeatured: course.is_featured,
        metrics: {
          totalRevenue,
          averageProgress: avgProgress,
          totalModules: course._count.course_modules,
          totalLessons,
          totalEnrollments: course._count.course_enrollments,
          totalReviews: course._count.course_reviews,
          completionRate: course.course_enrollments.length > 0
            ? (course.course_enrollments.filter((e: any) => e.status === 'COMPLETED').length / course.course_enrollments.length) * 100
            : 0,
        },
        recentEnrollments: course.course_enrollments,
        recentReviews: course.course_reviews,
      }
    })

    // Get course statistics
    const courseStats = await Promise.all([
      prisma.courses.count({ where: { is_published: true } }),
      prisma.courses.count({ where: { is_published: false } }),
      prisma.courses.groupBy({
        by: ['category_id'],
        _count: { category_id: true },
        orderBy: { _count: { category_id: 'desc' } },
        take: 10,
        where: { category_id: { not: null } }
      }),
      prisma.courses.groupBy({
        by: ['level'],
        _count: { level: true },
      }),
    ])

    const response = {
      courses: coursesWithMetrics,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      statistics: {
        published: courseStats[0],
        draft: courseStats[1],
        byCategory: courseStats[2].map(stat => ({
          categoryId: stat.category_id,
          count: stat._count.category_id || 0,
        })),
        byLevel: courseStats[3].map(stat => ({
          level: stat.level,
          count: stat._count.level,
        })),
        total: totalCount,
      },
      filters: {
        categories: courseStats[2].map(stat => stat.category_id),
        levels: Object.values(CourseLevel),
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get admin courses error:', error)

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

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().optional(),
  instructorName: z.string().min(1, 'Instructor name is required'),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  language: z.string().default('English'),
  price: z.number().min(0).default(0),
  originalPrice: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  duration: z.number().min(0).default(0),
  maxStudents: z.number().min(1).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  requirements: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).default([]),
  modules: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    orderIndex: z.number(),
    lessons: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      type: z.enum(['video', 'text', 'quiz', 'assignment']),
      contentUrl: z.string().optional(),
      duration: z.number().optional(),
      orderIndex: z.number(),
    })).default([])
  })).default([]),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
})

// POST /api/admin/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    // Check if slug already exists
    const existingCourse = await prisma.courses.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'A course with this slug already exists' },
        { status: 409 }
      )
    }

    // Generate unique IDs for course and timestamps
    const courseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    // Create the course
    const course = await prisma.courses.create({
      data: {
        id: courseId,
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        short_description: validatedData.shortDescription || null,
        instructor_id: user.id,
        instructor_name: validatedData.instructorName,
        price: validatedData.price,
        original_price: validatedData.originalPrice || null,
        currency: validatedData.currency,
        duration: validatedData.duration,
        level: validatedData.level as CourseLevel,
        max_students: validatedData.maxStudents || null,
        thumbnail_url: validatedData.thumbnailUrl || null,
        video_url: validatedData.videoUrl || null,
        language: validatedData.language,
        requirements: validatedData.requirements.filter(req => req.trim() !== ''),
        learning_objectives: validatedData.learningObjectives.filter(obj => obj.trim() !== ''),
        is_published: validatedData.isPublished,
        is_featured: validatedData.isFeatured,
        updated_at: now,
      },
    })

    // Create course modules and lessons
    for (const moduleData of validatedData.modules) {
      const createdModule = await prisma.course_modules.create({
        data: {
          id: `${course.id}_module_${moduleData.orderIndex}`,
          course_id: course.id,
          title: moduleData.title,
          description: moduleData.description || null,
          order_index: moduleData.orderIndex,
          content_type: 'MODULE' as any,
          is_published: validatedData.isPublished,
          updated_at: now,
        },
      })

      // Create lessons for this module
      for (const lessonData of moduleData.lessons) {
        await prisma.course_lessons.create({
          data: {
            id: `${createdModule.id}_lesson_${lessonData.orderIndex}`,
            module_id: createdModule.id,
            title: lessonData.title,
            description: lessonData.description || null,
            order_index: lessonData.orderIndex,
            content_type: lessonData.type.toUpperCase() as any,
            content_url: lessonData.contentUrl || null,
            duration: lessonData.duration || null,
            is_published: validatedData.isPublished,
            updated_at: now,
          },
        })
      }
    }

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        isPublished: course.is_published,
      },
      message: 'Course created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Course creation error:', error)

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
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}