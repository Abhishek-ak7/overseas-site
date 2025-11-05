import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { AppointmentStatus } from '@prisma/client'

const appointmentsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  upcoming: z.string().optional(),
})

// GET /api/user/appointments - Get user's appointments
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = appointmentsQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      user_id: user.id,
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status as AppointmentStatus
    }

    // Filter for upcoming appointments
    if (validatedQuery.upcoming === 'true') {
      where.scheduled_date = {
        gte: new Date(),
      }
      where.status = {
        notIn: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
      }
    }

    // Get appointments with details
    const [appointments, totalCount] = await Promise.all([
      prisma.appointments.findMany({
        where,
        include: {
          consultants: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
              specialties: true,
              rating: true,
            },
          },
          appointment_types: {
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              meeting_type: true,
              price: true,
              currency: true,
            },
          },
        },
        orderBy: { scheduled_date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.appointments.count({ where }),
    ])

    // Calculate statistics
    const stats = {
      total: await prisma.appointments.count({
        where: { user_id: user.id },
      }),
      upcoming: await prisma.appointments.count({
        where: {
          user_id: user.id,
          scheduled_date: { gte: new Date() },
          status: {
            notIn: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
          },
        },
      }),
      completed: await prisma.appointments.count({
        where: {
          user_id: user.id,
          status: AppointmentStatus.COMPLETED,
        },
      }),
      cancelled: await prisma.appointments.count({
        where: {
          user_id: user.id,
          status: AppointmentStatus.CANCELLED,
        },
      }),
    }

    const response = {
      appointments: appointments.map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        scheduledAt: appointment.scheduled_date.toISOString(),
        scheduledTime: appointment.scheduled_time.toISOString(),
        duration: appointment.duration,
        status: appointment.status,
        meetingLink: appointment.meeting_link,
        notes: appointment.notes,
        consultantName: appointment.consultants.name,
        consultantAvatar: appointment.consultants.avatar_url,
        consultantSpecialties: appointment.consultants.specialties,
        type: appointment.appointment_types.name,
        meetingType: appointment.appointment_types.meeting_type,
        price: appointment.appointment_types.price,
        currency: appointment.appointment_types.currency,
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      statistics: stats,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get appointments error:', error)

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
