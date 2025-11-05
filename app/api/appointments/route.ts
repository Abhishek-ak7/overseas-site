import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getUserFromToken, requireAuth } from '@/lib/auth'
import { UserRole, AppointmentStatus } from '@prisma/client'
import { sendEmail, EmailType } from '@/lib/email'

const createAppointmentSchema = z.object({
  typeId: z.string().min(1, 'Appointment type is required'),
  consultantId: z.string().min(1, 'Consultant is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  meetingType: z.enum(['VIDEO', 'PHONE', 'IN_PERSON', 'CHAT']).default('VIDEO'),
  description: z.string().optional(),
  specialRequests: z.string().optional(),
  // Guest booking fields (when user is not authenticated)
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

const appointmentsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  consultantId: z.string().optional(),
  typeId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

// GET /api/appointments - List appointments
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = appointmentsQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause based on user role
    const where: any = {}

    if (user.role === UserRole.STUDENT) {
      where.user_id = user.id
    } else if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      // Admins can see all appointments
    } else {
      // Other roles can only see their own appointments
      where.user_id = user.id
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status as AppointmentStatus
    }

    if (validatedQuery.consultantId) {
      where.consultant_id = validatedQuery.consultantId
    }

    if (validatedQuery.typeId) {
      where.type_id = validatedQuery.typeId
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

    // Get appointments
    const [appointments, totalCount] = await Promise.all([
      prisma.appointments.findMany({
        where,
        include: {
          consultants: {
            select: {
              id: true,
              name: true,
              email: true,
              specialties: true,
              avatar_url: true,
              hourly_rate: true,
              rating: true,
            },
          },
          appointment_types: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              duration: true,
              meeting_type: true,
            },
          },
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { scheduled_date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.appointments.count({ where }),
    ])

    // Get appointment statistics
    const stats = await prisma.appointments.groupBy({
      by: ['status'],
      where: user.role === UserRole.STUDENT ? { user_id: user.id } : {},
      _count: {
        status: true,
      },
    })

    const response = {
      appointments,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      statistics: stats.map(stat => ({
        status: stat.status,
        count: stat._count.status,
      })),
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

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createAppointmentSchema.parse(body)

    // Check if user is authenticated
    const user = await getUserFromToken(request)

    let userId: string
    let userEmail: string

    if (user) {
      // User is authenticated
      userId = user.id
      userEmail = user.email
    } else {
      // Guest booking - create a guest user or handle differently
      if (!validatedData.email || !validatedData.firstName || !validatedData.lastName || !validatedData.phone) {
        return NextResponse.json({
          success: false,
          message: 'For guest bookings, all contact information is required'
        }, { status: 400 })
      }

      // Check if user exists with this email
      const existingUser = await prisma.users.findUnique({
        where: { email: validatedData.email }
      })

      if (existingUser) {
        userId = existingUser.id
        userEmail = existingUser.email
      } else {
        // Create guest user account
        const newUser = await prisma.users.create({
          data: {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: validatedData.email,
            password_hash: `guest_${Date.now()}`, // Temporary password for guest user
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
            phone: validatedData.phone,
            role: 'STUDENT',
            is_verified: false,
            created_at: new Date(),
            updated_at: new Date()
          }
        })

        // Create user profile
        await prisma.user_profiles.create({
          data: {
            id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: newUser.id,
            bio: 'Guest user profile'
          }
        })

        userId = newUser.id
        userEmail = newUser.email
      }
    }

    // Parse the scheduled date and time
    const scheduledDateTime = new Date(validatedData.scheduledDate)
    const [hours, minutes] = validatedData.scheduledTime.split(':').map(Number)
    scheduledDateTime.setHours(hours, minutes, 0, 0)

    // Get appointment type details for duration and pricing
    const appointmentType = await prisma.appointment_types.findUnique({
      where: { id: validatedData.typeId }
    })

    if (!appointmentType || !appointmentType.is_active) {
      return NextResponse.json({
        success: false,
        message: 'Invalid appointment type'
      }, { status: 400 })
    }

    // Check consultant availability (simplified check)
    const existingAppointment = await prisma.appointments.findFirst({
      where: {
        consultant_id: validatedData.consultantId,
        scheduled_date: {
          gte: new Date(scheduledDateTime.getTime() - 30 * 60 * 1000), // 30 min before
          lte: new Date(scheduledDateTime.getTime() + 30 * 60 * 1000), // 30 min after
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json({
        success: false,
        message: 'This time slot is not available. Please choose a different time.'
      }, { status: 400 })
    }

    // Create the appointment
    const appointment = await prisma.appointments.create({
      data: {
        id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        consultant_id: validatedData.consultantId,
        type_id: validatedData.typeId,
        title: appointmentType.name,
        description: validatedData.description,
        scheduled_date: scheduledDateTime,
        scheduled_time: scheduledDateTime,
        duration: appointmentType.duration,
        status: 'SCHEDULED',
        notes: validatedData.specialRequests,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    // Generate meeting link for video calls
    let meetingLink = null
    if (validatedData.meetingType === 'VIDEO') {
      meetingLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`

      await prisma.appointments.update({
        where: { id: appointment.id },
        data: { meeting_link: meetingLink }
      })
    }

    // Get user details for email
    const userDetails = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        first_name: true,
        last_name: true,
        email: true
      }
    })

    // Get consultant details for email
    const consultantDetails = await prisma.consultants.findUnique({
      where: { id: validatedData.consultantId },
      select: { name: true }
    })

    // Send confirmation email
    const appointmentDate = new Date(scheduledDateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const appointmentTime = new Date(scheduledDateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })

    await sendEmail({
      to: userEmail,
      type: EmailType.APPOINTMENT_CONFIRMATION,
      data: {
        firstName: userDetails?.first_name || validatedData.firstName || 'Student',
        consultantName: consultantDetails?.name || 'Our team',
        appointmentType: appointmentType.name,
        appointmentDate,
        appointmentTime,
        duration: appointmentType.duration,
        meetingLink: meetingLink || undefined,
        preparationTips: validatedData.specialRequests || undefined,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully. Confirmation email sent.',
      data: {
        id: appointment.id,
        scheduledDate: appointment.scheduled_date,
        duration: appointment.duration,
        meetingLink,
        status: appointment.status
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Appointment booking error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid form data',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to book appointment. Please try again.'
    }, { status: 500 })
  }
}

