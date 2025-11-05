import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createRazorpayOrder, createStripePaymentIntent } from '@/lib/payments'
import { getPaymentSettings } from '@/lib/settings'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/courses/[id]/purchase - Create payment order for course
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const courseId = params.id

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
        { error: 'Course is not available for purchase' },
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

    const price = Number(course.price)

    // Free courses don't need payment
    if (price === 0) {
      return NextResponse.json(
        { error: 'This is a free course. Use the enroll endpoint instead.' },
        { status: 400 }
      )
    }

    // Get payment settings
    const paymentSettings = await getPaymentSettings()
    const currency = course.currency || paymentSettings.defaultCurrency || 'INR'

    // Determine which payment gateway to use
    let paymentGateway = 'razorpay' // Default
    if (currency === 'INR' && paymentSettings.enableRazorpay) {
      paymentGateway = 'razorpay'
    } else if (paymentSettings.enableStripe) {
      paymentGateway = 'stripe'
    } else if (paymentSettings.enableRazorpay) {
      paymentGateway = 'razorpay'
    } else {
      return NextResponse.json(
        { error: 'No payment gateway is configured. Please contact support.' },
        { status: 503 }
      )
    }

    // Create payment record
    const payment = await prisma.payments.create({
      data: {
        id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        amount: price,
        currency: currency,
        status: 'PENDING',
        payment_method: paymentGateway.toUpperCase(),
        description: `Payment for course: ${course.title}`,
        metadata: JSON.stringify({
          courseId: course.id,
          courseTitle: course.title,
          userId: user.id,
          userEmail: user.email,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      }
    })

    // Create payment order based on gateway
    let orderData: any

    if (paymentGateway === 'razorpay') {
      const orderResult = await createRazorpayOrder({
        amount: price,
        currency: currency,
        receipt: payment.id,
        notes: {
          courseId: course.id,
          courseTitle: course.title,
          userId: user.id,
          paymentId: payment.id,
        }
      })

      if (!orderResult.success) {
        // Delete the payment record if order creation failed
        await prisma.payments.delete({ where: { id: payment.id } })

        return NextResponse.json(
          { error: orderResult.error || 'Failed to create payment order' },
          { status: 500 }
        )
      }

      // Update payment with order ID
      await prisma.payments.update({
        where: { id: payment.id },
        data: {
          transaction_id: orderResult.orderId,
          updated_at: new Date(),
        }
      })

      orderData = {
        gateway: 'razorpay',
        orderId: orderResult.orderId,
        amount: orderResult.amount,
        currency: orderResult.currency,
        keyId: paymentSettings.razorpayKeyId,
        paymentId: payment.id,
      }
    } else if (paymentGateway === 'stripe') {
      const intentResult = await createStripePaymentIntent({
        amount: price,
        currency: currency,
        metadata: {
          courseId: course.id,
          courseTitle: course.title,
          userId: user.id,
          paymentId: payment.id,
        }
      })

      if (!intentResult.success) {
        // Delete the payment record if intent creation failed
        await prisma.payments.delete({ where: { id: payment.id } })

        return NextResponse.json(
          { error: 'Failed to create payment intent' },
          { status: 500 }
        )
      }

      // Update payment with intent ID
      await prisma.payments.update({
        where: { id: payment.id },
        data: {
          transaction_id: intentResult.paymentIntentId,
          updated_at: new Date(),
        }
      })

      orderData = {
        gateway: 'stripe',
        clientSecret: intentResult.clientSecret,
        paymentIntentId: intentResult.paymentIntentId,
        publicKey: paymentSettings.stripePublicKey,
        paymentId: payment.id,
      }
    }

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        price: price,
        currency: currency,
      },
      payment: orderData,
    })

  } catch (error) {
    console.error('Course purchase error:', error)

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
