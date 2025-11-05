import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

const createEnrollmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
})

// GET /api/course-enrollments - Get user's enrollments
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {
      user_id: user.id,
    }

    if (status) {
      where.status = status
    }

    const [enrollments, totalCount] = await Promise.all([
      prisma.course_enrollments.findMany({
        where,
        include: {
          courses: {
            include: {
              categories: true,
              _count: {
                select: {
                  course_modules: true,
                },
              },
            },
          },
        },
        orderBy: {
          enrolled_at: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.course_enrollments.count({ where }),
    ])

    return NextResponse.json({
      enrollments,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Get enrollments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/course-enrollments - Enroll in a course
export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { courseId } = createEnrollmentSchema.parse(body)

    // Check if course exists and is published
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
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
    const existingEnrollment = await prisma.course_enrollments.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Check max students limit
    if (course.max_students) {
      const enrollmentCount = await prisma.course_enrollments.count({
        where: {
          course_id: courseId,
          status: 'ACTIVE',
        },
      })

      if (enrollmentCount >= course.max_students) {
        return NextResponse.json(
          { error: 'Course is full' },
          { status: 400 }
        )
      }
    }

    // Create enrollment
    const enrollment = await prisma.course_enrollments.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        course_id: courseId,
        status: 'ACTIVE',
        progress: 0,
        enrolled_at: new Date(),
        last_accessed_at: new Date(),
      },
      include: {
        courses: {
          include: {
            categories: true,
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

    // If course is not free, create a transaction record
    if (Number(course.price) > 0) {
      await prisma.transactions.create({
        data: {
          id: randomUUID(),
          user_id: user.id,
          course_id: courseId,
          amount: course.price,
          currency: course.currency,
          status: 'COMPLETED', // Simplified - in real app, handle payment processing
          type: 'COURSE_PURCHASE',
          payment_method: 'CARD', // Default
          reference_id: `txn_${Date.now()}`,
          description: `Course enrollment: ${course.title}`,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
    }

    return NextResponse.json({
      enrollment,
      message: 'Successfully enrolled in course',
    }, { status: 201 })
  } catch (error) {
    console.error('Create enrollment error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}