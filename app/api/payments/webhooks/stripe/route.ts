import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe, verifyStripeWebhook } from '@/lib/payments'
import { TransactionStatus, EnrollmentStatus, AppointmentStatus } from '@prisma/client'
import { sendEmail, EmailType } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    if (!verifyStripeWebhook(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    console.log(`Received Stripe webhook: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const transactionId = paymentIntent.metadata?.transactionId

  if (!transactionId) {
    console.error('No transaction ID in payment intent metadata')
    return
  }

  try {
    // Find and update transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      console.error(`Transaction not found: ${transactionId}`)
      return
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      console.log(`Transaction already completed: ${transactionId}`)
      return
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.COMPLETED,
        gatewayResponse: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          completedAt: new Date().toISOString(),
        }
      }
    })

    // Process the purchase
    await processPurchase(transaction)

    console.log(`Payment completed for transaction: ${transactionId}`)
  } catch (error) {
    console.error(`Error processing payment success for transaction ${transactionId}:`, error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const transactionId = paymentIntent.metadata?.transactionId

  if (!transactionId) {
    console.error('No transaction ID in payment intent metadata')
    return
  }

  try {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.FAILED,
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        gatewayResponse: {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error,
          failedAt: new Date().toISOString(),
        }
      }
    })

    console.log(`Payment failed for transaction: ${transactionId}`)
  } catch (error) {
    console.error(`Error processing payment failure for transaction ${transactionId}:`, error)
  }
}

async function handlePaymentIntentCanceled(paymentIntent: any) {
  const transactionId = paymentIntent.metadata?.transactionId

  if (!transactionId) {
    console.error('No transaction ID in payment intent metadata')
    return
  }

  try {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.CANCELLED,
        gatewayResponse: {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          canceledAt: new Date().toISOString(),
        }
      }
    })

    console.log(`Payment canceled for transaction: ${transactionId}`)
  } catch (error) {
    console.error(`Error processing payment cancellation for transaction ${transactionId}:`, error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  // Handle subscription invoice payments
  console.log(`Invoice payment succeeded: ${invoice.id}`)

  // This would typically handle recurring subscription payments
  // You might want to extend subscription periods, send receipts, etc.
}

async function handleInvoicePaymentFailed(invoice: any) {
  // Handle failed subscription payments
  console.log(`Invoice payment failed: ${invoice.id}`)

  // This might trigger dunning emails, subscription suspensions, etc.
}

async function handleSubscriptionCreated(subscription: any) {
  // Handle new subscription creation
  console.log(`Subscription created: ${subscription.id}`)
}

async function handleSubscriptionUpdated(subscription: any) {
  // Handle subscription updates (plan changes, etc.)
  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: any) {
  // Handle subscription cancellation
  console.log(`Subscription deleted: ${subscription.id}`)
}

async function processPurchase(transaction: any) {
  switch (transaction.type) {
    case 'COURSE_PURCHASE':
      if (transaction.courseId) {
        // Create enrollment
        await prisma.courseEnrollment.create({
          data: {
            userId: transaction.userId,
            courseId: transaction.courseId,
            status: EnrollmentStatus.ACTIVE,
          }
        })

        // Update course student count
        await prisma.course.update({
          where: { id: transaction.courseId },
          data: {
            totalStudents: { increment: 1 }
          }
        })
      }
      break

    case 'APPOINTMENT_BOOKING':
      if (transaction.appointmentId) {
        // Confirm appointment
        await prisma.appointment.update({
          where: { id: transaction.appointmentId },
          data: {
            status: AppointmentStatus.CONFIRMED,
          }
        })
      }
      break

    case 'SUBSCRIPTION':
      // Handle subscription activation
      await prisma.subscription.create({
        data: {
          userId: transaction.userId,
          planType: 'basic', // This should come from transaction metadata
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'ACTIVE',
        }
      })
      break

    default:
      console.warn(`Unhandled transaction type: ${transaction.type}`)
  }

  // Send confirmation email
  try {
    const user = await prisma.user.findUnique({
      where: { id: transaction.userId },
      select: { firstName: true, email: true }
    })

    if (user) {
      let emailData: any = {
        firstName: user.firstName,
        amount: transaction.amount,
        currency: transaction.currency,
        transactionId: transaction.id,
      }

      if (transaction.type === 'COURSE_PURCHASE' && transaction.courseId) {
        const course = await prisma.course.findUnique({
          where: { id: transaction.courseId },
          select: { title: true, instructorName: true, duration: true }
        })

        await sendEmail({
          to: user.email,
          type: EmailType.COURSE_ENROLLMENT,
          data: {
            ...emailData,
            courseName: course?.title,
            instructorName: course?.instructorName,
            duration: course?.duration,
            courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${transaction.courseId}`,
            itemName: course?.title,
          },
        })
      } else if (transaction.type === 'APPOINTMENT_BOOKING' && transaction.appointmentId) {
        const appointment = await prisma.appointment.findUnique({
          where: { id: transaction.appointmentId },
          include: {
            consultant: { select: { name: true } },
            type: { select: { name: true, duration: true } }
          }
        })

        await sendEmail({
          to: user.email,
          type: EmailType.APPOINTMENT_CONFIRMATION,
          data: {
            ...emailData,
            consultantName: appointment?.consultant.name,
            appointmentType: appointment?.type.name,
            appointmentDate: appointment?.scheduledDate.toLocaleDateString(),
            appointmentTime: appointment?.scheduledDate.toLocaleTimeString(),
            duration: appointment?.type.duration,
            itemName: `Appointment with ${appointment?.consultant.name}`,
          },
        })
      } else {
        // General payment success email
        await sendEmail({
          to: user.email,
          type: EmailType.PAYMENT_SUCCESS,
          data: {
            ...emailData,
            itemName: transaction.description || 'Purchase',
          },
        })
      }
    }
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError)
  }

  // TODO: Generate receipt/invoice
  // TODO: Trigger analytics events
}