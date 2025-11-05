import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { MeetingType, UserRole } from '@prisma/client'

const updateAppointmentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').optional(),
  meetingType: z.enum(['VIDEO', 'PHONE', 'IN_PERSON', 'CHAT']).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/appointment-types/[id] - Get single appointment type
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentType = await prisma.appointment_types.findUnique({
      where: { id: params.id }
    })

    if (!appointmentType) {
      return NextResponse.json(
        { success: false, error: 'Appointment type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      appointmentType: {
        id: appointmentType.id,
        name: appointmentType.name,
        description: appointmentType.description,
        price: Number(appointmentType.price),
        duration: appointmentType.duration,
        meetingType: appointmentType.meeting_type,
        features: appointmentType.features,
        currency: appointmentType.currency,
        isActive: appointmentType.is_active,
        createdAt: appointmentType.created_at,
        updatedAt: appointmentType.updated_at
      }
    })
  } catch (error) {
    console.error('Get appointment type error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/appointment-types/[id] - Update appointment type
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = updateAppointmentTypeSchema.parse(body)

    // Check if appointment type exists
    const existingType = await prisma.appointment_types.findUnique({
      where: { id: params.id }
    })

    if (!existingType) {
      return NextResponse.json(
        { success: false, error: 'Appointment type not found' },
        { status: 404 }
      )
    }

    // Check if name already exists for another appointment type
    if (validatedData.name && validatedData.name !== existingType.name) {
      const nameExists = await prisma.appointment_types.findFirst({
        where: {
          name: validatedData.name,
          id: { not: params.id }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Appointment type with this name already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {
      updated_at: new Date()
    }

    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.duration) updateData.duration = validatedData.duration
    if (validatedData.meetingType) updateData.meeting_type = validatedData.meetingType as MeetingType
    if (validatedData.features !== undefined) updateData.features = validatedData.features
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive

    const appointmentType = await prisma.appointment_types.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      appointmentType: {
        id: appointmentType.id,
        name: appointmentType.name,
        description: appointmentType.description,
        price: Number(appointmentType.price),
        duration: appointmentType.duration,
        meetingType: appointmentType.meeting_type,
        features: appointmentType.features,
        currency: appointmentType.currency,
        isActive: appointmentType.is_active
      },
      message: 'Appointment type updated successfully'
    })
  } catch (error) {
    console.error('Update appointment type error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointment-types/[id] - Delete appointment type
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    // Check if appointment type exists
    const existingType = await prisma.appointment_types.findUnique({
      where: { id: params.id }
    })

    if (!existingType) {
      return NextResponse.json(
        { success: false, error: 'Appointment type not found' },
        { status: 404 }
      )
    }

    // Check if there are any appointments using this type
    const appointmentsCount = await prisma.appointments.count({
      where: { type_id: params.id }
    })

    if (appointmentsCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete appointment type that has associated appointments. Consider deactivating it instead.' },
        { status: 400 }
      )
    }

    await prisma.appointment_types.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment type deleted successfully'
    })
  } catch (error) {
    console.error('Delete appointment type error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}