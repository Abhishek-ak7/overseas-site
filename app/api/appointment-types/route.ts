import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { MeetingType, UserRole } from '@prisma/client'

const createAppointmentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  meetingType: z.enum(['VIDEO', 'PHONE', 'IN_PERSON', 'CHAT']),
  features: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
})

const appointmentTypesQuerySchema = z.object({
  active: z.string().optional(),
  meetingType: z.string().optional(),
})

// GET /api/appointment-types - List appointment types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = appointmentTypesQuerySchema.parse(queryParams)

    // Build where clause
    const where: any = {}

    if (validatedQuery.active !== undefined) {
      where.isActive = validatedQuery.active === 'true'
    }

    if (validatedQuery.meetingType) {
      where.meetingType = validatedQuery.meetingType as MeetingType
    }

    // Get appointment types from the correct table
    const appointmentTypes = await prisma.appointment_types.findMany({
      where: {
        is_active: validatedQuery.active !== 'false'
      },
      orderBy: [
        { price: 'asc' },
        { name: 'asc' },
      ]
    })

    const response = {
      success: true,
      appointmentTypes: appointmentTypes.map(type => ({
        id: type.id,
        name: type.name,
        description: type.description,
        price: Number(type.price),
        duration: type.duration,
        meetingType: type.meeting_type,
        features: type.features,
        currency: type.currency,
        isActive: type.is_active
      }))
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get appointment types error:', error)

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

// POST /api/appointment-types - Create new appointment type (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = createAppointmentTypeSchema.parse(body)

    // Check if name already exists
    const existingType = await prisma.appointment_types.findUnique({
      where: { name: validatedData.name },
    })

    if (existingType) {
      return NextResponse.json(
        { success: false, error: 'Appointment type with this name already exists' },
        { status: 400 }
      )
    }

    const appointmentType = await prisma.appointment_types.create({
      data: {
        id: `apt_type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedData.name,
        description: validatedData.description,
        price: 0, // Always free
        duration: validatedData.duration,
        meeting_type: validatedData.meetingType as MeetingType,
        features: validatedData.features || [],
        currency: 'USD',
        is_active: validatedData.isActive,
        created_at: new Date(),
        updated_at: new Date()
      },
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
      message: 'Appointment type created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create appointment type error:', error)

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