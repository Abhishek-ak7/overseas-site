import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole, AppointmentStatus } from '@prisma/client'
import { z } from 'zod'
import { sendEmail, EmailType } from '@/lib/email'

const updateAppointmentSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  notes: z.string().optional(),
  cancel_reason: z.string().optional(),
  meeting_link: z.string().url().optional(),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
})

// GET /api/admin/appointments/[id] - Get single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const appointment = await prisma.appointments.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            country: true,
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

    const transformedAppointment = {
      id: appointment.id,
      title: appointment.title,
      studentName: `${appointment.users.first_name} ${appointment.users.last_name}`,
      studentEmail: appointment.users.email,
      studentPhone: appointment.users.phone,
      studentCountry: appointment.users.country,
      consultantName: appointment.consultants?.name || 'Unknown',
      consultantEmail: appointment.consultants?.email,
      appointmentType: appointment.appointment_types?.name || 'General Consultation',
      scheduledDate: appointment.scheduled_date.toISOString().split('T')[0],
      scheduledTime: appointment.scheduled_time || '10:00',
      duration: appointment.appointment_types?.duration || 60,
      status: appointment.status,
      meetingType: appointment.appointment_types?.meeting_type || 'VIDEO',
      meetingLink: appointment.meeting_link,
      price: parseFloat(appointment.appointment_types?.price?.toString() || '0'),
      paid: appointment.payment_status === 'COMPLETED',
      notes: appointment.notes,
      feedback: appointment.feedback,
      rating: appointment.rating,
      cancelReason: appointment.cancel_reason,
      createdAt: appointment.created_at.toISOString(),
      updatedAt: appointment.updated_at.toISOString(),
    }

    return NextResponse.json({ appointment: transformedAppointment })
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

// PATCH /api/admin/appointments/[id] - Update appointment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateAppointmentSchema.parse(body)

    // Check if appointment exists
    const existingAppointment = await prisma.appointments.findUnique({
      where: { id: params.id }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date()
    }

    if (validatedData.status) {
      updateData.status = validatedData.status as AppointmentStatus
    }

    if (validatedData.notes) updateData.notes = validatedData.notes
    if (validatedData.cancel_reason) updateData.cancel_reason = validatedData.cancel_reason
    if (validatedData.meeting_link) updateData.meeting_link = validatedData.meeting_link
    if (validatedData.feedback) updateData.feedback = validatedData.feedback
    if (validatedData.rating) updateData.rating = validatedData.rating

    const updatedAppointment = await prisma.appointments.update({
      where: { id: params.id },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        },
        consultants: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        appointment_types: {
          select: {
            id: true,
            name: true,
            duration: true,
          }
        }
      }
    })

    // Send email notification if appointment is confirmed
    if (validatedData.status === 'CONFIRMED') {
      const appointmentDate = new Date(updatedAppointment.scheduled_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const appointmentTime = updatedAppointment.scheduled_time
        ? new Date(updatedAppointment.scheduled_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'TBD'

      // Send confirmation email to student
      await sendEmail({
        to: updatedAppointment.users.email,
        type: EmailType.APPOINTMENT_CONFIRMATION,
        data: {
          firstName: updatedAppointment.users.first_name,
          consultantName: updatedAppointment.consultants?.name || 'Our team',
          appointmentType: updatedAppointment.appointment_types?.name || 'Consultation',
          appointmentDate,
          appointmentTime,
          duration: updatedAppointment.appointment_types?.duration || 60,
          meetingLink: updatedAppointment.meeting_link,
          preparationTips: updatedAppointment.notes || undefined,
        }
      })
    }

    return NextResponse.json({
      appointment: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        notes: updatedAppointment.notes,
        updatedAt: updatedAppointment.updated_at.toISOString(),
      },
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

// DELETE /api/admin/appointments/[id] - Delete appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if appointment exists
    const existingAppointment = await prisma.appointments.findUnique({
      where: { id: params.id }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if appointment can be deleted (not completed or in progress)
    if (['COMPLETED', 'IN_PROGRESS'].includes(existingAppointment.status)) {
      return NextResponse.json(
        { error: 'Cannot delete completed or in-progress appointments' },
        { status: 400 }
      )
    }

    // Delete the appointment
    await prisma.appointments.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Appointment deleted successfully'
    })
  } catch (error) {
    console.error('Delete appointment error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}