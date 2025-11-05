import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const messageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
})

// GET /api/appointments/[id]/messages - Get all messages for an appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Build where clause based on user role
    let appointmentWhere: any = { id: params.id }
    
    // If not admin, check if user owns the appointment
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      appointmentWhere.user_id = user.id
    }

    // Check if appointment exists and user has access
    const appointment = await prisma.appointments.findFirst({
      where: appointmentWhere
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or you do not have access' },
        { status: 404 }
      )
    }

    // Fetch messages using Prisma ORM
    const messages = await prisma.appointment_messages.findMany({
      where: {
        appointment_id: params.id
      },
      orderBy: {
        created_at: 'asc'
      }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)

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

// POST /api/appointments/[id]/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = messageSchema.parse(body)

    // Build where clause based on user role
    let appointmentWhere: any = { id: params.id }
    
    // If not admin, check if user owns the appointment
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      appointmentWhere.user_id = user.id
    }

    // Check if appointment exists and user has access
    const appointment = await prisma.appointments.findFirst({
      where: appointmentWhere
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or you do not have access' },
        { status: 404 }
      )
    }

    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN

    // Create the message using Prisma ORM
    const message = await prisma.appointment_messages.create({
      data: {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        appointment_id: params.id,
        sender_id: user.id,
        message: validatedData.message,
        is_admin: isAdmin,
        created_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: message
    })
  } catch (error) {
    console.error('Send message error:', error)

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
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
