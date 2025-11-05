import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/courses/[id]/access - Check if user has access to course
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)

    // Check if user is enrolled in the course
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
            price: true,
          }
        },
      }
    })

    // Check if course exists and is published
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
        {
          hasAccess: false,
          reason: 'Course not found or not published',
          course: null
        },
        { status: 404 }
      )
    }

    // Free courses - allow access without enrollment
    if (course.price.toNumber() === 0) {
      return NextResponse.json({
        hasAccess: true,
        reason: 'Free course',
        course,
        enrollment: enrollment || null,
        progress: enrollment?.progress || 0
      })
    }

    // Paid courses - check enrollment
    if (enrollment && enrollment.status === 'ACTIVE') {
      return NextResponse.json({
        hasAccess: true,
        reason: 'Active enrollment',
        course,
        enrollment,
        progress: enrollment.progress || 0
      })
    }

    return NextResponse.json({
      hasAccess: false,
      reason: enrollment ? 'Enrollment not active' : 'Not enrolled',
      course,
      enrollment: null,
      progress: 0
    })

  } catch (error) {
    console.error('Course access check error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        {
          hasAccess: false,
          reason: 'Authentication required',
          course: null
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        hasAccess: false,
        reason: 'Server error',
        course: null
      },
      { status: 500 }
    )
  }
}