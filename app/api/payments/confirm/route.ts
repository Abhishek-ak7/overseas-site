import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { verifyRazorpaySignature } from '@/lib/payments'
import { TransactionStatus, EnrollmentStatus, AppointmentStatus } from '@prisma/client'

const confirmPaymentSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  paymentMethod: z.enum(['stripe', 'razorpay']),
  paymentId: z.string().min(1, 'Payment ID is required'),
  // Razorpay specific fields
  orderId: z.string().optional(),
  signature: z.string().optional(),
  // Stripe specific fields
  paymentIntentId: z.string().optional(),
})

// POST /api/payments/confirm - Confirm payment completion
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = confirmPaymentSchema.parse(body)

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: validatedData.transactionId },
      include: {
        user: true,
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (transaction.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to transaction' },
        { status: 403 }
      )
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      return NextResponse.json(
        { error: 'Transaction is not in pending state' },
        { status: 400 }
      )
    }

    // Verify payment based on method
    let isVerified = false

    if (validatedData.paymentMethod === 'razorpay') {
      if (!validatedData.orderId || !validatedData.signature) {
        return NextResponse.json(
          { error: 'Missing Razorpay verification data' },
          { status: 400 }
        )
      }

      isVerified = verifyRazorpaySignature({
        orderId: validatedData.orderId,
        paymentId: validatedData.paymentId,
        signature: validatedData.signature,
      })
    } else if (validatedData.paymentMethod === 'stripe') {
      // For Stripe, payment verification is typically done via webhooks
      // This endpoint might be called after webhook confirmation
      // We could add additional verification here if needed
      isVerified = true
    }

    if (!isVerified) {
      // Update transaction status to failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.FAILED,
          failureReason: 'Payment verification failed',
        }
      })

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Update transaction status to completed
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.COMPLETED,
        gatewayResponse: {
          paymentId: validatedData.paymentId,
          orderId: validatedData.orderId,
          signature: validatedData.signature,
          paymentIntentId: validatedData.paymentIntentId,
          verifiedAt: new Date().toISOString(),
        }
      }
    })

    // Process the purchase based on transaction type
    let result: any = {}

    switch (transaction.type) {
      case 'COURSE_PURCHASE':
        result = await processCourseEnrollment(transaction, user.id)
        break

      case 'APPOINTMENT_BOOKING':
        result = await confirmAppointment(transaction)
        break

      case 'SUBSCRIPTION':
        result = await activateSubscription(transaction, user.id)
        break

      default:
        console.warn(`Unhandled transaction type: ${transaction.type}`)
    }

    // TODO: Send confirmation email
    // TODO: Generate invoice
    // TODO: Update user's purchase history
    // TODO: Trigger analytics events

    const response = {
      success: true,
      transaction: {
        id: updatedTransaction.id,
        status: updatedTransaction.status,
        amount: updatedTransaction.amount,
        currency: updatedTransaction.currency,
        type: updatedTransaction.type,
      },
      ...result,
      message: 'Payment confirmed successfully'
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Confirm payment error:', error)

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

// Helper function to process course enrollment
async function processCourseEnrollment(transaction: any, userId: string) {
  if (!transaction.courseId) {
    throw new Error('Course ID not found in transaction')
  }

  // Create enrollment
  const enrollment = await prisma.courseEnrollment.create({
    data: {
      userId: userId,
      courseId: transaction.courseId,
      status: EnrollmentStatus.ACTIVE,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
        }
      }
    }
  })

  // Update course total students count
  await prisma.course.update({
    where: { id: transaction.courseId },
    data: {
      totalStudents: {
        increment: 1,
      },
    },
  })

  return {
    enrollment: {
      id: enrollment.id,
      courseId: enrollment.courseId,
      courseName: enrollment.course.title,
      enrolledAt: enrollment.enrolledAt,
    }
  }
}

// Helper function to confirm appointment
async function confirmAppointment(transaction: any) {
  if (!transaction.appointmentId) {
    throw new Error('Appointment ID not found in transaction')
  }

  // Update appointment status to confirmed
  const appointment = await prisma.appointment.update({
    where: { id: transaction.appointmentId },
    data: {
      status: AppointmentStatus.CONFIRMED,
    },
    include: {
      consultant: {
        select: {
          name: true,
        }
      },
      type: {
        select: {
          name: true,
        }
      }
    }
  })

  return {
    appointment: {
      id: appointment.id,
      consultantName: appointment.consultant.name,
      typeName: appointment.type.name,
      scheduledDate: appointment.scheduledDate,
      status: appointment.status,
    }
  }
}

// Helper function to activate subscription
async function activateSubscription(transaction: any, userId: string) {
  // This is a placeholder for subscription logic
  // In a real implementation, you would create/update subscription records

  const subscription = await prisma.subscription.create({
    data: {
      userId: userId,
      planType: 'basic', // This should come from transaction metadata
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'ACTIVE',
    }
  })

  return {
    subscription: {
      id: subscription.id,
      planType: subscription.planType,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    }
  }
}