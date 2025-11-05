import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createStripePaymentIntent, createRazorpayOrder, getRecommendedPaymentMethod, validatePaymentAmount } from '@/lib/payments'
import { TransactionType } from '@prisma/client'

const createPaymentIntentSchema = z.object({
  type: z.enum(['COURSE_PURCHASE', 'APPOINTMENT_BOOKING', 'SUBSCRIPTION']),
  itemId: z.string().min(1, 'Item ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(3).max(3).default('USD'),
  paymentMethod: z.enum(['stripe', 'razorpay']).optional(),
  metadata: z.record(z.string()).optional(),
})

// POST /api/payments/create-intent - Create payment intent
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = createPaymentIntentSchema.parse(body)

    // Validate payment amount
    if (!validatePaymentAmount(validatedData.amount, validatedData.currency)) {
      return NextResponse.json(
        { error: 'Payment amount is below minimum required' },
        { status: 400 }
      )
    }

    // Verify the item exists and get details
    let itemDetails: any = null
    let actualAmount = validatedData.amount

    switch (validatedData.type) {
      case 'COURSE_PURCHASE':
        const course = await prisma.courses.findUnique({
          where: { id: validatedData.itemId },
          select: { id: true, title: true, price: true, currency: true, is_published: true }
        })

        if (!course || !course.is_published) {
          return NextResponse.json(
            { error: 'Course not found or not available' },
            { status: 404 }
          )
        }

        // Check if user is already enrolled
        const existingEnrollment = await prisma.course_enrollments.findUnique({
          where: {
            user_id_course_id: {
              user_id: user.id,
              course_id: course.id,
            }
          }
        })

        if (existingEnrollment) {
          return NextResponse.json(
            { error: 'You are already enrolled in this course' },
            { status: 400 }
          )
        }

        itemDetails = course
        actualAmount = parseFloat(course.price.toString())
        break

      case 'APPOINTMENT_BOOKING':
        const appointment = await prisma.appointments.findUnique({
          where: { id: validatedData.itemId },
          include: {
            appointment_types: { select: { price: true, currency: true } },
            consultants: { select: { name: true } }
          }
        })

        if (!appointment) {
          return NextResponse.json(
            { error: 'Appointment not found' },
            { status: 404 }
          )
        }

        if (appointment.user_id !== user.id) {
          return NextResponse.json(
            { error: 'Unauthorized access to appointment' },
            { status: 403 }
          )
        }

        itemDetails = appointment
        actualAmount = parseFloat(appointment.appointment_types.price.toString())
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported payment type' },
          { status: 400 }
        )
    }

    // Determine payment method
    const paymentMethod = validatedData.paymentMethod ||
      getRecommendedPaymentMethod(validatedData.currency, user.country || undefined)

    // Create transaction record
    const transaction = await prisma.transactions.create({
      data: {
        user_id: user.id,
        amount: actualAmount,
        currency: validatedData.currency,
        type: validatedData.type as TransactionType,
        description: getTransactionDescription(validatedData.type, itemDetails),
        payment_gateway: paymentMethod,
        course_id: validatedData.type === 'COURSE_PURCHASE' ? validatedData.itemId : undefined,
        appointment_id: validatedData.type === 'APPOINTMENT_BOOKING' ? validatedData.itemId : undefined,
        status: 'PENDING',
      }
    })

    // Create payment intent based on method
    let paymentResult: any = {}

    if (paymentMethod === 'stripe') {
      paymentResult = await createStripePaymentIntent({
        amount: actualAmount,
        currency: validatedData.currency.toLowerCase(),
        metadata: {
          transactionId: transaction.id,
          userId: user.id,
          type: validatedData.type,
          itemId: validatedData.itemId,
          ...validatedData.metadata,
        }
      })
    } else if (paymentMethod === 'razorpay') {
      paymentResult = await createRazorpayOrder({
        amount: actualAmount,
        currency: validatedData.currency,
        receipt: `txn_${transaction.id}`,
        notes: {
          transactionId: transaction.id,
          userId: user.id,
          type: validatedData.type,
          itemId: validatedData.itemId,
          ...validatedData.metadata,
        }
      })
    }

    if (!paymentResult.success) {
      // Update transaction status to failed
      await prisma.transactions.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          failure_reason: paymentResult.error,
        }
      })

      return NextResponse.json(
        { error: paymentResult.error },
        { status: 500 }
      )
    }

    // Update transaction with payment reference
    await prisma.transactions.update({
      where: { id: transaction.id },
      data: {
        reference_id: paymentResult.paymentIntentId || paymentResult.orderId,
      }
    })

    const response = {
      transactionId: transaction.id,
      paymentMethod,
      amount: actualAmount,
      currency: validatedData.currency,
      ...paymentResult,
      itemDetails: {
        id: itemDetails.id,
        title: itemDetails.title || itemDetails.consultants?.name,
        type: validatedData.type,
      }
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Create payment intent error:', error)

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

// Helper function to generate transaction description
function getTransactionDescription(type: string, itemDetails: any): string {
  switch (type) {
    case 'COURSE_PURCHASE':
      return `Course purchase: ${itemDetails.title}`
    case 'APPOINTMENT_BOOKING':
      return `Appointment booking with ${itemDetails.consultants?.name}`
    case 'SUBSCRIPTION':
      return `Subscription payment`
    default:
      return 'Payment'
  }
}