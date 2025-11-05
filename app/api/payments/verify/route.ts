import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  transactionId: z.string(),
})

// POST /api/payments/verify - Verify Razorpay payment and complete enrollment
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const validatedData = verifySchema.parse(body)

    // Verify the signature
    const isValid = await verifyRazorpaySignature({
      razorpay_order_id: validatedData.razorpay_order_id,
      razorpay_payment_id: validatedData.razorpay_payment_id,
      razorpay_signature: validatedData.razorpay_signature,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Find the transaction
    const transaction = await prisma.transactions.findUnique({
      where: { id: validatedData.transactionId },
      include: { courses: true },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Verify user owns this transaction
    if (transaction.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if transaction already processed
    if (transaction.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 400 }
      )
    }

    if (!transaction.course_id || !transaction.courses) {
      return NextResponse.json(
        { error: 'Course not found for this transaction' },
        { status: 404 }
      )
    }

    // Update transaction status
    await prisma.transactions.update({
      where: { id: transaction.id },
      data: {
        status: 'COMPLETED',
        payment_method: 'Razorpay',
        gateway_response: {
          payment_id: validatedData.razorpay_payment_id,
          order_id: validatedData.razorpay_order_id,
        },
        updated_at: new Date(),
      },
    })

    // Check if already enrolled
    const existingEnrollment = await prisma.course_enrollments.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: transaction.course_id,
        },
      },
    })

    if (existingEnrollment) {
      // Already enrolled, just return success
      return NextResponse.json({
        success: true,
        message: 'Payment successful. You were already enrolled.',
        enrollment: existingEnrollment,
      }, { status: 200 })
    }

    // Create course enrollment
    const enrollment = await prisma.course_enrollments.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        course_id: transaction.course_id,
      },
      include: {
        courses: {
          select: {
            title: true,
            thumbnail_url: true,
            slug: true,
          },
        },
      },
    })

    // Update course total students count
    await prisma.courses.update({
      where: { id: transaction.course_id },
      data: {
        total_students: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment successful! You are now enrolled in the course.',
      enrollment,
      course: transaction.courses,
    }, { status: 200 })
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
