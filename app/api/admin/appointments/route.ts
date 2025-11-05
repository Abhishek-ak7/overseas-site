import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { AppointmentStatus, UserRole } from '@prisma/client'

const adminAppointmentsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  consultantId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['date', 'consultant', 'user', 'status', 'created']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

const updateAppointmentStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']),
  notes: z.string().optional(),
  cancelReason: z.string().optional(),
})

// GET /api/admin/appointments - Admin appointment management
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = adminAppointmentsQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (validatedQuery.search) {
      where.OR = [
        { title: { contains: validatedQuery.search, mode: 'insensitive' } },
        { description: { contains: validatedQuery.search, mode: 'insensitive' } },
        { users: {
          OR: [
            { first_name: { contains: validatedQuery.search, mode: 'insensitive' } },
            { last_name: { contains: validatedQuery.search, mode: 'insensitive' } },
            { email: { contains: validatedQuery.search, mode: 'insensitive' } },
          ]
        }},
        { consultants: {
          name: { contains: validatedQuery.search, mode: 'insensitive' }
        }},
      ]
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status as AppointmentStatus
    }

    if (validatedQuery.consultantId) {
      where.consultant_id = validatedQuery.consultantId
    }

    if (validatedQuery.dateFrom || validatedQuery.dateTo) {
      where.scheduled_date = {}
      if (validatedQuery.dateFrom) {
        where.scheduled_date.gte = new Date(validatedQuery.dateFrom)
      }
      if (validatedQuery.dateTo) {
        where.scheduled_date.lte = new Date(validatedQuery.dateTo)
      }
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (validatedQuery.sortBy) {
      case 'date':
        orderBy.scheduled_date = validatedQuery.sortOrder
        break
      case 'consultant':
        orderBy.consultants = { name: validatedQuery.sortOrder }
        break
      case 'user':
        orderBy.users = { first_name: validatedQuery.sortOrder }
        break
      case 'status':
        orderBy.status = validatedQuery.sortOrder
        break
      case 'created':
      default:
        orderBy.created_at = validatedQuery.sortOrder
        break
    }

    // Get appointments with detailed information
    const [appointments, totalCount] = await Promise.all([
      prisma.appointments.findMany({
        where,
        orderBy: {
          scheduled_date: 'desc'
        },
        skip,
        take: limit,
        include: {
          users: {
            include: {
              user_profiles: true
            }
          },
          consultants: true,
          appointment_types: true
        }
      }),
      prisma.appointments.count({ where }),
    ])

    // Simply return the appointments data

    const response = {
      success: true,
      appointments: appointments,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get admin appointments error:', error)

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

// POST /api/admin/appointments - Create new appointment (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const {
      userId,
      consultantId,
      typeId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      meetingLink,
      notes,
      status = 'SCHEDULED'
    } = body

    // Validate required fields
    if (!userId || !consultantId || !typeId || !scheduledDate || !scheduledTime) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 400 })
    }

    // Check if consultant exists and is active
    const consultant = await prisma.consultants.findUnique({
      where: { id: consultantId }
    })

    if (!consultant || !consultant.is_active) {
      return NextResponse.json({
        success: false,
        message: 'Consultant not found or inactive'
      }, { status: 400 })
    }

    // Check if appointment type exists
    const appointmentType = await prisma.appointment_types.findUnique({
      where: { id: typeId }
    })

    if (!appointmentType || !appointmentType.is_active) {
      return NextResponse.json({
        success: false,
        message: 'Appointment type not found or inactive'
      }, { status: 400 })
    }

    // Parse scheduled date and time
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)

    // Check for conflicts
    const conflictingAppointment = await prisma.appointments.findFirst({
      where: {
        consultant_id: consultantId,
        scheduled_date: {
          gte: new Date(scheduledDate),
          lt: new Date(new Date(scheduledDate).getTime() + 24 * 60 * 60 * 1000)
        },
        scheduled_time: {
          gte: new Date(`1970-01-01T${scheduledTime}`),
          lt: new Date(new Date(`1970-01-01T${scheduledTime}`).getTime() + appointmentType.duration * 60 * 1000)
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json({
        success: false,
        message: 'Consultant is not available at this time slot'
      }, { status: 400 })
    }

    // Create appointment
    const appointment = await prisma.appointments.create({
      data: {
        id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        consultant_id: consultantId,
        type_id: typeId,
        title: title || appointmentType.name,
        description: description,
        scheduled_date: new Date(scheduledDate),
        scheduled_time: scheduledDateTime,
        duration: appointmentType.duration,
        status: status,
        meeting_link: meetingLink,
        notes: notes,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        users: {
          include: {
            user_profiles: true
          }
        },
        consultants: true,
        appointment_types: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment created successfully',
      appointment: appointment
    }, { status: 201 })

  } catch (error) {
    console.error('Create appointment error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to create appointment'
    }, { status: 500 })
  }
}

// PUT /api/admin/appointments - Bulk update appointment status
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const { appointmentIds, ...updateData } = body

    if (!appointmentIds || !Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      return NextResponse.json(
        { error: 'Appointment IDs are required' },
        { status: 400 }
      )
    }

    const validatedData = updateAppointmentStatusSchema.parse(updateData)

    // Update multiple appointments
    const updatedAppointments = await prisma.appointments.updateMany({
      where: {
        id: { in: appointmentIds },
      },
      data: {
        status: validatedData.status as AppointmentStatus,
        notes: validatedData.notes,
        cancel_reason: validatedData.cancelReason,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      message: `Successfully updated ${updatedAppointments.count} appointment(s)`,
      updatedCount: updatedAppointments.count,
    }, { status: 200 })
  } catch (error) {
    console.error('Bulk update appointments error:', error)

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