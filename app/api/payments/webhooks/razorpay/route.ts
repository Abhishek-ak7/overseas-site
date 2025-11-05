import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRazorpaySignature } from '@/lib/payments'
import { TransactionStatus, EnrollmentStatus, AppointmentStatus } from '@prisma/client'
import { sendEmail, EmailType } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = body.event
    const payload = body.payload

    console.log(`Received Razorpay webhook: ${event}`)

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity)
        break

      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity)
        break

      case 'order.paid':
        await handleOrderPaid(payload.order.entity, payload.payment.entity)
        break

      case 'refund.created':
        await handleRefundCreated(payload.refund.entity)
        break

      case 'refund.processed':
        await handleRefundProcessed(payload.refund.entity)
        break

      case 'subscription.activated':
        await handleSubscriptionActivated(payload.subscription.entity)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity)
        break

      default:
        console.log(`Unhandled event type: ${event}`)
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCaptured(payment: any) {
  const orderId = payment.order_id
  const transactionId = payment.notes?.transactionId

  if (!transactionId) {
    console.error('No transaction ID in payment notes')
    return
  }

  try {
    // Find and update transaction
    const transaction = await prisma.transactions.findUnique({
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
    await prisma.transactions.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.COMPLETED,
        gateway_response: {
          paymentId: payment.id,
          orderId: orderId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          capturedAt: new Date().toISOString(),
        }
      }
    })

    // Process the purchase
    await processPurchase(transaction)

    console.log(`Payment captured for transaction: ${transactionId}`)
  } catch (error) {
    console.error(`Error processing payment capture for transaction ${transactionId}:`, error)
  }
}

async function handlePaymentFailed(payment: any) {
  const transactionId = payment.notes?.transactionId

  if (!transactionId) {
    console.error('No transaction ID in payment notes')
    return
  }

  try {
    await prisma.transactions.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.FAILED,
        failure_reason: payment.error_description || 'Payment failed',
        gateway_response: {
          paymentId: payment.id,
          orderId: payment.order_id,
          errorCode: payment.error_code,
          errorDescription: payment.error_description,
          failedAt: new Date().toISOString(),
        }
      }
    })

    console.log(`Payment failed for transaction: ${transactionId}`)
  } catch (error) {
    console.error(`Error processing payment failure for transaction ${transactionId}:`, error)
  }
}

async function handleOrderPaid(order: any, payment: any) {
  const transactionId = order.notes?.transactionId

  if (!transactionId) {
    console.error('No transaction ID in order notes')
    return
  }

  try {
    // This is similar to payment captured, but for orders
    const transaction = await prisma.transactions.findUnique({
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
    await prisma.transactions.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.COMPLETED,
        gatewayResponse: {
          orderId: order.id,
          paymentId: payment.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          paidAt: new Date().toISOString(),
        }
      }
    })

    // Process the purchase
    await processPurchase(transaction)

    console.log(`Order paid for transaction: ${transactionId}`)
  } catch (error) {
    console.error(`Error processing order payment for transaction ${transactionId}:`, error)
  }
}

async function handleRefundCreated(refund: any) {
  console.log(`Refund created: ${refund.id} for payment: ${refund.payment_id}`)

  try {
    // Find transaction by payment ID
    const transaction = await prisma.transactions.findFirst({
      where: {
        gatewayResponse: {
          path: ['paymentId'],
          equals: refund.payment_id
        }
      }
    })

    if (transaction) {
      await prisma.transactions.update({
        where: { id: transaction.id },
        data: {
          refundAmount: refund.amount / 100, // Convert from paise to rupees
          refundReason: refund.notes?.reason || 'Refund requested',
          status: TransactionStatus.REFUNDED,
        }
      })
    }
  } catch (error) {
    console.error(`Error processing refund creation:`, error)
  }
}

async function handleRefundProcessed(refund: any) {
  console.log(`Refund processed: ${refund.id}`)

  try {
    // Find transaction and update refund status
    const transaction = await prisma.transactions.findFirst({
      where: {
        gatewayResponse: {
          path: ['paymentId'],
          equals: refund.payment_id
        }
      }
    })

    if (transaction) {
      // Handle post-refund processing (e.g., revoke access, update enrollments)
      await handleRefundProcessing(transaction, refund)
    }
  } catch (error) {
    console.error(`Error processing refund completion:`, error)
  }
}

async function handleSubscriptionActivated(subscription: any) {
  console.log(`Subscription activated: ${subscription.id}`)

  // Handle subscription activation
  const userId = subscription.notes?.userId

  if (userId) {
    await prisma.subscription.create({
      data: {
        userId: userId,
        planType: subscription.notes?.planType || 'basic',
        subscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_start * 1000),
        currentPeriodEnd: new Date(subscription.current_end * 1000),
        status: 'ACTIVE',
      }
    })
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log(`Subscription cancelled: ${subscription.id}`)

  // Handle subscription cancellation
  await prisma.subscription.updateMany({
    where: { subscriptionId: subscription.id },
    data: {
      status: 'CANCELLED',
      canceledAt: new Date(),
    }
  })
}

async function processPurchase(transaction: any) {
  switch (transaction.type) {
    case 'COURSE_PURCHASE':
      if (transaction.course_id) {
        // Check if enrollment already exists
        const existingEnrollment = await prisma.course_enrollments.findUnique({
          where: {
            user_id_course_id: {
              user_id: transaction.user_id,
              course_id: transaction.course_id,
            }
          }
        })

        if (!existingEnrollment) {
          // Create enrollment
          await prisma.course_enrollments.create({
            data: {
              user_id: transaction.user_id,
              course_id: transaction.course_id,
              status: EnrollmentStatus.ACTIVE,
            }
          })

          // Update course student count
          await prisma.courses.update({
            where: { id: transaction.course_id },
            data: {
              total_students: { increment: 1 }
            }
          })
        }
      }
      break

    case 'APPOINTMENT_BOOKING':
      if (transaction.appointment_id) {
        // Confirm appointment
        await prisma.appointments.update({
          where: { id: transaction.appointment_id },
          data: {
            status: AppointmentStatus.CONFIRMED,
          }
        })
      }
      break

    case 'SUBSCRIPTION':
      // Subscription handling is done in subscription-specific webhooks
      break

    default:
      console.warn(`Unhandled transaction type: ${transaction.type}`)
  }

  // Send confirmation email
  try {
    const user = await prisma.users.findUnique({
      where: { id: transaction.user_id },
      select: { first_name: true, email: true }
    })

    if (user) {
      let emailData: any = {
        firstName: user.first_name,
        amount: transaction.amount,
        currency: transaction.currency,
        transactionId: transaction.id,
      }

      if (transaction.type === 'COURSE_PURCHASE' && transaction.course_id) {
        const course = await prisma.courses.findUnique({
          where: { id: transaction.course_id },
          select: { title: true, instructor_name: true, duration: true }
        })

        await sendEmail({
          to: user.email,
          type: EmailType.COURSE_ENROLLMENT,
          data: {
            ...emailData,
            courseName: course?.title,
            instructorName: course?.instructor_name,
            duration: course?.duration,
            courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${transaction.course_id}`,
            itemName: course?.title,
          },
        })
      } else if (transaction.type === 'APPOINTMENT_BOOKING' && transaction.appointment_id) {
        const appointment = await prisma.appointments.findUnique({
          where: { id: transaction.appointment_id },
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

async function handleRefundProcessing(transaction: any, refund: any) {
  switch (transaction.type) {
    case 'COURSE_PURCHASE':
      if (transaction.course_id) {
        // Revoke course access
        await prisma.courseEnrollment.updateMany({
          where: {
            userId: transaction.userId,
            courseId: transaction.courseId,
          },
          data: {
            status: EnrollmentStatus.REFUNDED,
          }
        })

        // Update course student count
        await prisma.course.update({
          where: { id: transaction.courseId },
          data: {
            totalStudents: { decrement: 1 }
          }
        })
      }
      break

    case 'APPOINTMENT_BOOKING':
      if (transaction.appointment_id) {
        // Cancel appointment
        await prisma.appointments.update({
          where: { id: transaction.appointment_id },
          data: {
            status: AppointmentStatus.CANCELLED,
            cancelReason: 'Payment refunded',
          }
        })
      }
      break

    default:
      console.warn(`Unhandled refund type: ${transaction.type}`)
  }
}