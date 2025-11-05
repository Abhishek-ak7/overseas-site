import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

interface RouteParams {
  params: {
    id: string
  }
}

const progressUpdateSchema = z.object({
  progress: z.number().min(0).max(100),
})

// GET /api/courses/[id]/progress - Get user's progress for a course
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)

    // Get user's enrollment and progress
    const enrollment = await prisma.course_enrollments.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: params.id,
        }
      },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            duration: true,
          }
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      )
    }

    // Get course modules for additional details
    const modules = await prisma.course_modules.findMany({
      where: {
        course_id: params.id,
        is_published: true,
      },
      include: {
        course_lessons: {
          where: { is_published: true },
          select: { id: true, title: true }
        }
      },
      orderBy: { order_index: 'asc' }
    })

    const totalLessons = modules.reduce((count, module) => count + module.course_lessons.length, 0)

    return NextResponse.json({
      enrollment,
      progress: {
        percentage: enrollment.progress,
        totalLessons,
        enrolledAt: enrollment.enrolled_at,
        lastAccessedAt: enrollment.last_accessed_at,
        completedAt: enrollment.completed_at,
        status: enrollment.status
      },
      course: enrollment.courses,
      modules: modules.map(module => ({
        id: module.id,
        title: module.title,
        totalLessons: module.course_lessons.length,
        lessons: module.course_lessons
      }))
    })

  } catch (error) {
    console.error('Course progress fetch error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch course progress' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[id]/progress - Update course progress
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const validatedData = progressUpdateSchema.parse(body)

    // Check if user has access to the course
    const enrollment = await prisma.course_enrollments.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: params.id,
        }
      }
    })

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Access denied - active enrollment required' },
        { status: 403 }
      )
    }

    // Update progress
    const updatedEnrollment = await prisma.course_enrollments.update({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: params.id,
        }
      },
      data: {
        progress: validatedData.progress,
        last_accessed_at: new Date(),
        completed_at: validatedData.progress >= 100 ? new Date() : null,
      },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    return NextResponse.json({
      enrollment: updatedEnrollment,
      message: 'Progress updated successfully'
    })

  } catch (error) {
    console.error('Progress update error:', error)

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
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}