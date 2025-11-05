import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendEmail, EmailType } from '@/lib/email'
import { NotificationType, UserRole } from '@prisma/client'

const sendNotificationSchema = z.object({
  type: z.enum(['email', 'in-app', 'both']),
  recipients: z.array(z.string()).min(1, 'At least one recipient is required'),
  notificationType: z.enum([
    'COURSE_ENROLLMENT',
    'COURSE_COMPLETION',
    'APPOINTMENT_REMINDER',
    'APPOINTMENT_CONFIRMATION',
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED',
    'TEST_COMPLETED',
    'SYSTEM_UPDATE',
    'MARKETING'
  ]),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  actionUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  emailType: z.enum([
    'WELCOME',
    'EMAIL_VERIFICATION',
    'PASSWORD_RESET',
    'COURSE_ENROLLMENT',
    'COURSE_COMPLETION',
    'APPOINTMENT_CONFIRMATION',
    'APPOINTMENT_REMINDER',
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED',
    'TEST_COMPLETED',
    'NEWSLETTER'
  ]).optional(),
})

const getNotificationsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  unreadOnly: z.string().optional(),
  type: z.string().optional(),
})

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = getNotificationsSchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: user.id,
    }

    if (validatedQuery.unreadOnly === 'true') {
      where.isRead = false
    }

    if (validatedQuery.type) {
      where.type = validatedQuery.type as NotificationType
    }

    // Get notifications
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        },
      }),
    ])

    const response = {
      notifications,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      unreadCount,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get notifications error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
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

// POST /api/notifications - Send notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = sendNotificationSchema.parse(body)

    // Get recipient users
    const recipients = await prisma.user.findMany({
      where: {
        id: { in: validatedData.recipients },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    })

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No valid recipients found' },
        { status: 400 }
      )
    }

    const results = {
      inAppNotifications: 0,
      emailsSent: 0,
      errors: [] as string[],
    }

    // Send in-app notifications
    if (validatedData.type === 'in-app' || validatedData.type === 'both') {
      try {
        const notifications = await prisma.notification.createMany({
          data: recipients.map(recipient => ({
            userId: recipient.id,
            title: validatedData.title,
            message: validatedData.message,
            type: validatedData.notificationType as NotificationType,
            actionUrl: validatedData.actionUrl,
            metadata: validatedData.metadata || {},
          })),
        })

        results.inAppNotifications = notifications.count
      } catch (error) {
        console.error('Error creating in-app notifications:', error)
        results.errors.push('Failed to create in-app notifications')
      }
    }

    // Send email notifications
    if (validatedData.type === 'email' || validatedData.type === 'both') {
      if (!validatedData.emailType) {
        return NextResponse.json(
          { error: 'Email type is required for email notifications' },
          { status: 400 }
        )
      }

      for (const recipient of recipients) {
        try {
          const emailResult = await sendEmail({
            to: recipient.email,
            type: validatedData.emailType as EmailType,
            data: {
              firstName: recipient.firstName,
              lastName: recipient.lastName,
              title: validatedData.title,
              message: validatedData.message,
              actionUrl: validatedData.actionUrl,
              ...validatedData.metadata,
            },
          })

          if (emailResult.success) {
            results.emailsSent += 1
          } else {
            results.errors.push(`Failed to send email to ${recipient.email}: ${emailResult.error}`)
          }
        } catch (error) {
          console.error(`Error sending email to ${recipient.email}:`, error)
          results.errors.push(`Failed to send email to ${recipient.email}`)
        }
      }
    }

    return NextResponse.json({
      message: 'Notifications sent successfully',
      results,
    }, { status: 200 })
  } catch (error) {
    console.error('Send notification error:', error)

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

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}