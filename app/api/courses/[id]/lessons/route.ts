import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/courses/[id]/lessons - Get course lessons (only if user has access)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)

    // First check if user has access to the course
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
            is_published: true,
          }
        }
      }
    })

    const course = await prisma.courses.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        is_published: true,
        price: true,
      }
    })

    if (!course || !course.is_published) {
      return NextResponse.json(
        { error: 'Course not found or not published' },
        { status: 404 }
      )
    }

    // Check access
    const hasAccess = course.price.toNumber() === 0 || (enrollment && enrollment.status === 'ACTIVE')

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied - enrollment required' },
        { status: 403 }
      )
    }

    // Get course modules and lessons
    const modules = await prisma.course_modules.findMany({
      where: {
        course_id: params.id,
        is_published: true,
      },
      include: {
        course_lessons: {
          where: { is_published: true },
          orderBy: { order_index: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            content_type: true,
            duration: true,
            order_index: true,
            is_free: true,
            content_url: true,
          }
        }
      },
      orderBy: { order_index: 'asc' }
    })

    // Get user progress - simplified to just return modules without detailed progress tracking
    const modulesWithProgress = modules.map((module: any) => ({
      ...module,
      lessons: module.course_lessons.map((lesson: any) => ({
        ...lesson,
        progress: {
          isCompleted: false,
          progressPercentage: 0,
          lastAccessedAt: null
        }
      }))
    }))

    return NextResponse.json({
      modules: modulesWithProgress,
      hasAccess: true,
      enrollment: enrollment || null
    })

  } catch (error) {
    console.error('Course lessons fetch error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch course lessons' },
      { status: 500 }
    )
  }
}