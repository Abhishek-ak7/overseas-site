import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { EnrollmentStatus } from '@prisma/client'

const userCoursesQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.enum(['ACTIVE', 'COMPLETED', 'SUSPENDED', 'REFUNDED']).optional(),
  search: z.string().optional(),
})

// GET /api/user/courses - Get user's enrolled courses
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = userCoursesQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      user_id: user.id,
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status as EnrollmentStatus
    }

    if (validatedQuery.search) {
      where.courses = {
        OR: [
          { title: { contains: validatedQuery.search, mode: 'insensitive' } },
          { instructor_name: { contains: validatedQuery.search, mode: 'insensitive' } },
          { categories: { name: { contains: validatedQuery.search, mode: 'insensitive' } } },
        ],
      }
    }

    // Get enrollments with course details
    const [enrollments, totalCount] = await Promise.all([
      prisma.course_enrollments.findMany({
        where,
        include: {
          courses: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              short_description: true,
              instructor_name: true,
              duration: true,
              level: true,
              category_id: true,
              thumbnail_url: true,
              rating: true,
              total_students: true,
            },
          },
        },
        orderBy: { enrolled_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.course_enrollments.count({ where }),
    ])

    // Calculate overall progress statistics
    const progressStats = await prisma.course_enrollments.aggregate({
      where: { user_id: user.id },
      _avg: { progress: true },
      _count: true,
    })

    const completedCourses = await prisma.course_enrollments.count({
      where: {
        user_id: user.id,
        status: EnrollmentStatus.COMPLETED,
      },
    })

    const response = {
      courses: enrollments.map(enrollment => ({
        id: enrollment.id,
        progress: enrollment.progress,
        status: enrollment.status,
        enrolledAt: enrollment.enrolled_at,
        completedAt: enrollment.completed_at,
        lastAccessedAt: enrollment.last_accessed_at,
        certificateUrl: enrollment.certificate_url,
        title: enrollment.courses.title,
        slug: enrollment.courses.slug,
        description: enrollment.courses.description,
        shortDescription: enrollment.courses.short_description,
        instructorName: enrollment.courses.instructor_name,
        duration: enrollment.courses.duration,
        level: enrollment.courses.level,
        categoryId: enrollment.courses.category_id,
        thumbnailUrl: enrollment.courses.thumbnail_url,
        rating: enrollment.courses.rating,
        totalStudents: enrollment.courses.total_students,
        courseId: enrollment.course_id,
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
        totalEnrollments: progressStats._count,
        completedCourses,
        averageProgress: progressStats._avg.progress || 0,
        activeCourses: totalCount - completedCourses,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get user courses error:', error)

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