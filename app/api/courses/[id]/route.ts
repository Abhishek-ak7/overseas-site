import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, requireAuth } from '@/lib/auth'
import { CourseLevel, UserRole } from '@prisma/client'

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
  instructorName: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  originalPrice: z.number().optional(),
  duration: z.number().min(1).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
  maxStudents: z.number().optional(),
  language: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  thumbnailUrl: z.string().optional(),
  videoUrl: z.string().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/courses/[id] - Get course details (supports both ID and slug)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const identifier = params.id
    const user = await getUserFromToken(request)

    // Try to find by ID first, then by slug if that fails
    let course = await prisma.courses.findUnique({
      where: { id: identifier },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        course_modules: {
          include: {
            course_lessons: true,
          },
          orderBy: { order_index: 'asc' },
        },
        course_reviews: {
          include: {
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                user_profiles: {
                  select: {
                    avatar_url: true,
                  },
                },
              },
            },
          },
          where: { is_published: true },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        course_enrollments: user ? {
          where: { user_id: user.id },
          select: {
            id: true,
            progress: true,
            enrolled_at: true,
            status: true,
          },
        } : false,
        _count: {
          select: {
            course_enrollments: true,
            course_reviews: true,
          },
        },
      },
    })

    // If not found by ID, try by slug
    if (!course) {
      course = await prisma.courses.findUnique({
        where: { slug: identifier },
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          course_modules: {
            include: {
              course_lessons: true,
            },
            orderBy: { order_index: 'asc' },
          },
          course_reviews: {
            include: {
              users: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  user_profiles: {
                    select: {
                      avatar_url: true,
                    },
                  },
                },
              },
            },
            where: { is_published: true },
            orderBy: { created_at: 'desc' },
            take: 10,
          },
          course_enrollments: user ? {
            where: { user_id: user.id },
            select: {
              id: true,
              progress: true,
              enrolled_at: true,
              status: true,
            },
          } : false,
          _count: {
            select: {
              course_enrollments: true,
              course_reviews: true,
            },
          },
        },
      })
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user can access unpublished course
    if (!course.is_published && (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && course.instructor_id !== user.id))) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user is enrolled
    const isEnrolled = user && course.course_enrollments && course.course_enrollments.length > 0
    const enrollment = isEnrolled ? course.course_enrollments[0] : null

    // Calculate course statistics
    const totalStudents = course._count.course_enrollments
    const totalReviews = course._count.course_reviews
    const avgRating = course.rating || 0

    // Format response
    const response = {
      ...course,
      totalStudents,
      totalReviews,
      avgRating,
      isEnrolled: !!isEnrolled,
      enrollment,
      modules: course.course_modules.map(module => ({
        ...module,
        lessons: module.course_lessons.map(lesson => ({
          ...lesson,
          // Hide content URLs for non-enrolled users unless it's free
          contentUrl: (isEnrolled || lesson.is_free) ? lesson.content_url : null,
        })),
      })),
    }

    return NextResponse.json({ course: response }, { status: 200 })
  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[id] - Update course
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR])
    const courseId = params.id

    const body = await request.json()
    const validatedData = updateCourseSchema.parse(body)

    // Find existing course
    const existingCourse = await prisma.courses.findUnique({
      where: { id: courseId },
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (user.role === UserRole.INSTRUCTOR && existingCourse.instructor_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own courses' },
        { status: 403 }
      )
    }

    // Update slug if title changed
    let updateData: any = validatedData
    if (validatedData.title && validatedData.title !== existingCourse.title) {
      const newSlug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if new slug exists
      const slugExists = await prisma.courses.findFirst({
        where: {
          slug: newSlug,
          id: { not: courseId },
        },
      })

      updateData.slug = slugExists ? `${newSlug}-${Date.now()}` : newSlug
    }

    const updatedCourse = await prisma.courses.update({
      where: { id: courseId },
      data: updateData,
      include: {
        course_modules: {
          include: {
            course_lessons: true,
          },
          orderBy: { order_index: 'asc' },
        },
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
        ...updatedCourse,
        totalStudents: updatedCourse._count.course_enrollments,
        totalReviews: updatedCourse._count.course_reviews,
      },
      message: 'Course updated successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Update course error:', error)

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

// DELETE /api/courses/[id] - Delete course
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR])
    const courseId = params.id

    // Find existing course
    const existingCourse = await prisma.courses.findUnique({
      where: { id: courseId },
      include: {
        course_enrollments: true,
      },
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (user.role === UserRole.INSTRUCTOR && existingCourse.instructor_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own courses' },
        { status: 403 }
      )
    }

    // Check if course has active enrollments
    if (existingCourse.course_enrollments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments. Please refund students first.' },
        { status: 400 }
      )
    }

    // Delete course (cascading will handle related data)
    await prisma.courses.delete({
      where: { id: courseId },
    })

    return NextResponse.json(
      { message: 'Course deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete course error:', error)

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