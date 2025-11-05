import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const updateAppointmentSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  cancel_reason: z.string().optional(),
  notes: z.string().optional(),
  meetingLink: z.string().optional(),
})

// GET /api/appointments/[id] - Get single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Build where clause based on user role
    const whereClause: any = { id: params.id }
    
    // If not admin, only allow access to own appointments
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN
    if (!isAdmin) {
      whereClause.user_id = user.id
    }

    const appointment = await prisma.appointments.findFirst({
      where: whereClause,
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            phone: true,
          }
        },
        consultants: {
          select: {
            id: true,
            name: true,
            email: true,
            specialties: true,
            avatar_url: true,
          }
        },
        appointment_types: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            meeting_type: true,
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Get appointment error:', error)

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

// PATCH /api/appointments/[id] - Update appointment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = updateAppointmentSchema.parse(body)

    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN

    // Build where clause based on user role
    const whereClause: any = { id: params.id }
    if (!isAdmin) {
      whereClause.user_id = user.id
    }

    // Check if appointment exists
    const existingAppointment = await prisma.appointments.findFirst({
      where: whereClause
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // For non-admin users, only allow cancellation if appointment is scheduled or confirmed
    if (!isAdmin && validatedData.status && validatedData.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'You can only cancel appointments' },
        { status: 403 }
      )
    }

    if (!isAdmin && !['SCHEDULED', 'CONFIRMED'].includes(existingAppointment.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel this appointment' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date()
    }

    if (validatedData.status) {
      updateData.status = validatedData.status
    }

    if (validatedData.cancel_reason !== undefined) {
      updateData.cancel_reason = validatedData.cancel_reason
    }

    // Admin-only fields
    if (isAdmin) {
      if (validatedData.notes !== undefined) {
        updateData.notes = validatedData.notes
      }
      if (validatedData.meetingLink !== undefined) {
        updateData.meeting_link = validatedData.meetingLink
      }
    }

    // Update appointment
    const updatedAppointment = await prisma.appointments.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      appointment: updatedAppointment,
      message: 'Appointment updated successfully'
    })
  } catch (error) {
    console.error('Update appointment error:', error)

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
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}
