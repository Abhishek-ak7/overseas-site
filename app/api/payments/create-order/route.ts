import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { createRazorpayOrder } from '@/lib/razorpay'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'

const orderSchema = z.object({
  courseId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
})

// POST /api/payments/create-order - Create Razorpay payment order for course purchase
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const validatedData = orderSchema.parse(body)

    // Verify the course exists and get pricing
    const course = await prisma.courses.findUnique({
      where: { id: validatedData.courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (!course.is_published) {
      return NextResponse.json(
        { error: 'Course is not available for purchase' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.course_enrollments.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: course.id,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      )
    }

    // Verify amount matches course price
    const coursePrice = parseFloat(course.price.toString())
    if (Math.abs(validatedData.amount - coursePrice) > 0.01) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Convert amount to paise (smallest currency unit for INR)
    const amountInPaise = Math.round(validatedData.amount * 100)

    // Create transaction record
    const transactionId = randomUUID()
    const receipt = `order_${transactionId.substring(0, 8)}`

    // Create Razorpay order
    const orderResult = await createRazorpayOrder({
      amount: amountInPaise,
      currency: validatedData.currency,
      receipt,
      notes: {
        userId: user.id,
        userEmail: user.email,
        courseId: course.id,
        courseTitle: course.title,
        transactionId,
      },
    })

    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json(
        { error: orderResult.error || 'Failed to create payment order' },
        { status: 500 }
      )
    }

    // Create transaction record in database
    await prisma.transactions.create({
      data: {
        id: transactionId,
        user_id: user.id,
        amount: course.price,
        currency: validatedData.currency,
        status: 'PENDING',
        type: 'COURSE_PURCHASE',
        description: `Purchase of ${course.title}`,
        payment_gateway: 'Razorpay',
        reference_id: orderResult.order.id,
        course_id: course.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      orderId: orderResult.order.id,
      amount: orderResult.order.amount,
      currency: orderResult.order.currency,
      transactionId,
      course: {
        id: course.id,
        title: course.title,
        thumbnail_url: course.thumbnail_url,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Create order error:', error)

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
