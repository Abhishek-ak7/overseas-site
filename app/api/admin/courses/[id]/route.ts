import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const updateCourseSchema = z.object({
  status: z.enum(['published', 'draft', 'archived']).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
})

// GET /api/admin/courses/[id] - Get single course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.INSTRUCTOR) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Instructors can only access their own courses
    const whereCondition: any = { id: params.id }
    if (user.role === UserRole.INSTRUCTOR) {
      whereCondition.instructor_id = user.id
    }

    const course = await prisma.courses.findUnique({
      where: whereCondition,
      include: {
        categories: true,
        course_modules: {
          include: {
            course_lessons: {
              orderBy: { order_index: 'asc' }
            }
          },
          orderBy: { order_index: 'asc' }
        },
        course_enrollments: {
          include: {
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true
              }
            }
          },
          orderBy: { enrolled_at: 'desc' },
          take: 10
        },
        course_reviews: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          },
          where: { is_published: true },
          orderBy: { created_at: 'desc' },
          take: 5
        },
        _count: {
          select: {
            course_enrollments: true,
            course_reviews: true,
            course_modules: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Transform response
    const transformedCourse = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.short_description,
      instructorName: course.instructor_name,
      instructorId: course.instructor_id,
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
      totalModules: course._count.course_modules,
      totalReviews: course._count.course_reviews,
      createdAt: course.created_at.toISOString(),
      updatedAt: course.updated_at.toISOString(),
      modules: course.course_modules,
      recentEnrollments: course.course_enrollments,
      recentReviews: course.course_reviews,
    }

    return NextResponse.json({ course: transformedCourse })
  } catch (error) {
    console.error('Get course error:', error)

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

// PATCH /api/admin/courses/[id] - Update course
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.INSTRUCTOR) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateCourseSchema.parse(body)

    // Instructors can only update their own courses
    const whereCondition: any = { id: params.id }
    if (user.role === UserRole.INSTRUCTOR) {
      whereCondition.instructor_id = user.id
    }

    // Check if course exists and user has access
    const existingCourse = await prisma.courses.findUnique({
      where: whereCondition
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date()
    }

    if (validatedData.status) {
      updateData.is_published = validatedData.status === 'published'

      // Handle status-specific logic
      if (validatedData.status === 'archived') {
        updateData.is_published = false
        updateData.archived_at = new Date()
      }
    }

    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.description) updateData.description = validatedData.description
    if (validatedData.price !== undefined) updateData.price = validatedData.price
    if (validatedData.is_featured !== undefined) updateData.is_featured = validatedData.is_featured
    if (validatedData.is_published !== undefined) updateData.is_published = validatedData.is_published

    const updatedCourse = await prisma.courses.update({
      where: { id: params.id },
      data: updateData,
      include: {
        categories: true,
        _count: {
          select: {
            course_enrollments: true,
            course_reviews: true,
            course_modules: true
          }
        }
      }
    })

    return NextResponse.json({
      course: {
        id: updatedCourse.id,
        title: updatedCourse.title,
        status: updatedCourse.is_published ? 'published' : 'draft',
        isPublished: updatedCourse.is_published,
        updatedAt: updatedCourse.updated_at.toISOString(),
      },
      message: 'Course updated successfully'
    })
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

    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.INSTRUCTOR) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Instructors can only delete their own courses
    const whereCondition: any = { id: params.id }
    if (user.role === UserRole.INSTRUCTOR) {
      whereCondition.instructor_id = user.id
    }

    // Check if course exists and user has access
    const existingCourse = await prisma.courses.findUnique({
      where: whereCondition,
      include: {
        course_enrollments: true
      }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      )
    }

    // Check if course has enrollments (prevent deletion if it does)
    if (existingCourse.course_enrollments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments. Archive it instead.' },
        { status: 400 }
      )
    }

    // Delete related data first (due to foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete lessons first
      await tx.course_lessons.deleteMany({
        where: {
          module_id: {
            in: await tx.course_modules.findMany({
              where: { course_id: params.id },
              select: { id: true }
            }).then(modules => modules.map(m => m.id))
          }
        }
      })

      // Delete modules
      await tx.course_modules.deleteMany({
        where: { course_id: params.id }
      })

      // Delete reviews
      await tx.course_reviews.deleteMany({
        where: { course_id: params.id }
      })

      // Delete the course
      await tx.courses.delete({
        where: { id: params.id }
      })
    })

    return NextResponse.json({
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Delete course error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}