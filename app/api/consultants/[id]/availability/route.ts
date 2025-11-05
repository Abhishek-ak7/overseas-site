import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AppointmentStatus } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

const availabilityQuerySchema = z.object({
  date: z.string().optional(), // YYYY-MM-DD format
  days: z.string().optional().default('7'), // Number of days to check
})

// GET /api/consultants/[id]/availability - Get consultant availability
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const consultantId = params.id

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = availabilityQuerySchema.parse(queryParams)

    // Find consultant
    const consultant = await prisma.consultants.findUnique({
      where: { id: consultantId },
      select: {
        id: true,
        name: true,
        is_active: true,
        availability: true,
        time_zone: true,
      },
    })

    if (!consultant || !consultant.is_active) {
      return NextResponse.json(
        { error: 'Consultant not found or inactive' },
        { status: 404 }
      )
    }

    // Set date range
    const startDate = validatedQuery.date ? new Date(validatedQuery.date) : new Date()
    const days = parseInt(validatedQuery.days)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + days)

    // Get existing appointments in the date range
    const existingAppointments = await prisma.appointments.findMany({
      where: {
        consultant_id: consultantId,
        scheduled_date: {
          gte: startDate,
          lt: endDate,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
      select: {
        scheduled_date: true,
        scheduled_time: true,
        duration: true,
      },
    })

    // Generate availability slots
    const availabilitySlots = []
    const currentDate = new Date(startDate)

    while (currentDate < endDate) {
      const dayOfWeek = currentDate.toLocaleLowerCase('en-US', { weekday: 'long' })
      const dateString = currentDate.toISOString().split('T')[0]

      // Get consultant's availability for this day
      // This is a simplified version - in a real app, you'd have complex scheduling logic
      const dayAvailability = consultant.availability?.[dayOfWeek] || {
        available: true,
        startTime: '09:00',
        endTime: '17:00',
        breaks: [{ start: '12:00', end: '13:00' }]
      }

      if (dayAvailability.available) {
        // Generate time slots (e.g., every 60 minutes)
        const slots = generateTimeSlots(
          dayAvailability.startTime,
          dayAvailability.endTime,
          60, // slot duration in minutes
          dayAvailability.breaks || []
        )

        // Filter out booked slots
        const availableSlots = slots.filter(slot => {
          const slotDateTime = new Date(`${dateString}T${slot.time}`)
          return !isSlotBooked(slotDateTime, existingAppointments, 60)
        })

        availabilitySlots.push({
          date: dateString,
          dayOfWeek: dayOfWeek,
          slots: availableSlots,
        })
      } else {
        availabilitySlots.push({
          date: dateString,
          dayOfWeek: dayOfWeek,
          slots: [],
        })
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    const response = {
      consultant: {
        id: consultant.id,
        name: consultant.name,
        timeZone: consultant.time_zone,
      },
      dateRange: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      },
      availability: availabilitySlots,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get availability error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate time slots
function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number,
  breaks: Array<{ start: string; end: string }>
): Array<{ time: string; available: boolean }> {
  const slots = []
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)

  for (let time = start; time < end; time += duration) {
    const timeString = minutesToTime(time)

    // Check if this slot conflicts with any break
    const isBreak = breaks.some(breakPeriod => {
      const breakStart = timeToMinutes(breakPeriod.start)
      const breakEnd = timeToMinutes(breakPeriod.end)
      return time >= breakStart && time < breakEnd
    })

    if (!isBreak) {
      slots.push({
        time: timeString,
        available: true,
      })
    }
  }

  return slots
}

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper function to convert minutes to time string
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Helper function to check if a slot is already booked
function isSlotBooked(
  slotDateTime: Date,
  appointments: Array<{ scheduledDate: Date; scheduledTime: Date; duration: number }>,
  slotDuration: number
): boolean {
  return appointments.some(appointment => {
    const appointmentStart = new Date(appointment.scheduledTime)
    const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60 * 1000)
    const slotEnd = new Date(slotDateTime.getTime() + slotDuration * 60 * 1000)

    // Check for overlap
    return slotDateTime < appointmentEnd && slotEnd > appointmentStart
  })
}