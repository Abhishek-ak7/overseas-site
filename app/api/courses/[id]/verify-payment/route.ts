import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { verifyRazorpaySignature } from '@/lib/payments'
import { randomUUID } from 'crypto'
import { sendEmail, EmailType } from '@/lib/email'

interface RouteParams {
  params: {
    id: string
  }
}

const verifySchema = z.object({
  paymentId: z.string(),
  orderId: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
})

// POST /api/courses/[id]/verify-payment - Verify payment and enroll user
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const courseId = params.id
    const body = await request.json()
    const validatedData = verifySchema.parse(body)

    // Find the payment record
    const payment = await prisma.payments.findUnique({
      where: { id: validatedData.paymentId },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to payment' },
        { status: 403 }
      )
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment already verified' },
        { status: 400 }
      )
    }

    // Verify payment based on gateway
    let isVerified = false

    if (payment.payment_method === 'RAZORPAY') {
      if (!validatedData.razorpay_order_id || !validatedData.razorpay_payment_id || !validatedData.razorpay_signature) {
        return NextResponse.json(
          { error: 'Missing Razorpay verification data' },
          { status: 400 }
        )
      }

      isVerified = await verifyRazorpaySignature({
        orderId: validatedData.razorpay_order_id,
        paymentId: validatedData.razorpay_payment_id,
        signature: validatedData.razorpay_signature,
      })

      if (isVerified) {
        // Update payment record
        await prisma.payments.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            transaction_id: validatedData.razorpay_payment_id,
            payment_response: JSON.stringify({
              razorpay_order_id: validatedData.razorpay_order_id,
              razorpay_payment_id: validatedData.razorpay_payment_id,
              razorpay_signature: validatedData.razorpay_signature,
            }),
            paid_at: new Date(),
            updated_at: new Date(),
          }
        })
      }
    } else if (payment.payment_method === 'STRIPE') {
      // For Stripe, payment is already confirmed by webhook
      // Just verify the payment intent ID matches
      if (validatedData.stripePaymentIntentId === payment.transaction_id) {
        isVerified = true

        await prisma.payments.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paid_at: new Date(),
            updated_at: new Date(),
          }
        })
      }
    }

    if (!isVerified) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Get course details
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

    // Check if already enrolled
    if (course.course_enrollments.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'You are already enrolled in this course',
        enrollment: course.course_enrollments[0],
      })
    }

    // Create enrollment
    const enrollment = await prisma.course_enrollments.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        course_id: course.id,
        enrolled_at: new Date(),
        status: 'ACTIVE',
        progress: 0,
      },
      include: {
        courses: {
          select: {
            title: true,
            thumbnail_url: true,
            instructor_name: true,
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

    // Get user details for email
    const userDetails = await prisma.users.findUnique({
      where: { id: user.id },
      select: {
        first_name: true,
        last_name: true,
        email: true,
      }
    })

    // Send enrollment confirmation email
    if (userDetails) {
      await sendEmail({
        to: userDetails.email,
        type: EmailType.COURSE_ENROLLMENT,
        data: {
          firstName: userDetails.first_name,
          courseName: course.title,
          instructorName: course.instructor_name,
          duration: `${Math.round(course.duration / 60)} hours`,
          courseUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/courses/${course.id}/learn`,
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and enrollment successful!',
      enrollment,
      courseUrl: `/courses/${course.id}/learn`,
    })

  } catch (error) {
    console.error('Payment verification error:', error)

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
