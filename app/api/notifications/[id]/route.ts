import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
})

// GET /api/notifications/[id] - Get specific notification
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const notificationId = params.id

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to notification' },
        { status: 403 }
      )
    }

    return NextResponse.json({ notification }, { status: 200 })
  } catch (error) {
    console.error('Get notification error:', error)

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

// PUT /api/notifications/[id] - Update notification (mark as read/unread)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const notificationId = params.id

    const body = await request.json()
    const validatedData = updateNotificationSchema.parse(body)

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (existingNotification.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to notification' },
        { status: 403 }
      )
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: validatedData,
    })

    return NextResponse.json({
      notification: updatedNotification,
      message: 'Notification updated successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Update notification error:', error)

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

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const notificationId = params.id

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (existingNotification.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to notification' },
        { status: 403 }
      )
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId },
    })

    return NextResponse.json(
      { message: 'Notification deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete notification error:', error)

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