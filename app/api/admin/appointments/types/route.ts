import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { z } from 'zod'

const appointmentTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0).default(0),
  currency: z.string().default('USD'),
  duration: z.number().min(15),
  meeting_type: z.enum(['VIDEO', 'PHONE', 'IN_PERSON', 'CHAT']),
  is_active: z.boolean().default(true),
  features: z.array(z.string()).default([]),
})

// GET /api/admin/appointments/types
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const types = await prisma.appointment_types.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { appointments: true }
        }
      }
    })

    return NextResponse.json({ types })
  } catch (error) {
    console.error('Fetch appointment types error:', error)
    return NextResponse.json({ error: 'Failed to fetch appointment types' }, { status: 500 })
  }
}

// POST /api/admin/appointments/types
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = appointmentTypeSchema.parse(body)

    const type = await prisma.appointment_types.create({
      data: {
        id: `type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        currency: validatedData.currency,
        duration: validatedData.duration,
        meeting_type: validatedData.meeting_type,
        is_active: validatedData.is_active,
        features: validatedData.features,
        created_at: new Date(),
        updated_at: new Date(),
      }
    })

    return NextResponse.json({ success: true, type })
  } catch (error) {
    console.error('Create appointment type error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create appointment type' }, { status: 500 })
  }
}
