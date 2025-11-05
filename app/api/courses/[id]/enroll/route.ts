import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { randomUUID } from 'crypto'

interface RouteParams {
  params: {
    id: string
  }
}

const enrollSchema = z.object({
  paymentIntentId: z.string().optional(), // For future payment integration
})

// POST /api/courses/[id]/enroll - Enroll in a course
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const courseId = params.id

    // Only students can enroll in courses
    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: 'Only students can enroll in courses' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = enrollSchema.parse(body)

    // Find the course
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      include: {
        course_enrollments: {
          where: { user_id: user.id },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (!course.is_published) {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    if (course.course_enrollments.length > 0) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      )
    }

    // Check max students limit
    if (course.max_students) {
      const currentEnrollments = await prisma.course_enrollments.count({
        where: { course_id: course.id },
      })

      if (currentEnrollments >= course.max_students) {
        return NextResponse.json(
          { error: 'Course is full. Maximum students limit reached.' },
          { status: 400 }
        )
      }
    }

    // For free courses, create enrollment directly
    // For paid courses, this would normally happen after payment confirmation
    if (course.price.toNumber() === 0) {
      const enrollment = await prisma.course_enrollments.create({
        data: {
          id: randomUUID(),
          user_id: user.id,
          course_id: course.id,
        },
        include: {
          courses: {
            select: {
              title: true,
              thumbnail_url: true,
            },
          },
        },
      })

      // Update course total students count
      await prisma.courses.update({
        where: { id: courseId },
        data: {
          total_students: {
            increment: 1,
          },
        },
      })

      return NextResponse.json({
        enrollment,
        message: 'Successfully enrolled in the course!'
      }, { status: 201 })
    } else {
      // For paid courses, we need payment processing
      // This is a placeholder - actual implementation would integrate with payment gateway
      return NextResponse.json(
        {
          error: 'Payment required',
          paymentRequired: true,
          course: {
            id: course.id,
            title: course.title,
            price: course.price,
            currency: course.currency,
          }
        },
        { status: 402 }
      )
    }
  } catch (error) {
    console.error('Course enrollment error:', error)

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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[id]/enroll - Unenroll from course
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const courseId = params.id

    // Find the enrollment
    const enrollment = await prisma.course_enrollments.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: courseId,
        },
      },
      include: {
        courses: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 404 }
      )
    }

    // Check if course allows unenrollment (business logic)
    // For example, might not allow unenrollment after certain progress
    if (enrollment.progress > 50) {
      return NextResponse.json(
        { error: 'Cannot unenroll after completing 50% of the course' },
        { status: 400 }
      )
    }

    // Delete enrollment
    await prisma.course_enrollments.delete({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: courseId,
        },
      },
    })

    // Update course total students count
    await prisma.courses.update({
      where: { id: courseId },
      data: {
        total_students: {
          decrement: 1,
        },
      },
    })

    // If this was a paid course, might need to process refund here

    return NextResponse.json(
      { message: 'Successfully unenrolled from the course' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Course unenrollment error:', error)

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