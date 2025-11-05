import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const journeyStepUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  icon: z.string().optional(),
  iconType: z.string().optional(),
  iconColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  orderIndex: z.number().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  category: z.string().optional(),
})

// GET /api/journey-steps/[id] - Get single journey step
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const journeyStep = await prisma.journeyStep.findUnique({
      where: { id: params.id },
    })

    if (!journeyStep) {
      return NextResponse.json(
        { error: 'Journey step not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ journeyStep })
  } catch (error) {
    console.error('Journey step fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journey step' },
      { status: 500 }
    )
  }
}

// PUT /api/journey-steps/[id] - Update journey step (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = journeyStepUpdateSchema.parse(body)

    const journeyStep = await prisma.journeyStep.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      journeyStep,
      message: 'Journey step updated successfully'
    })

  } catch (error) {
    console.error('Journey step update error:', error)

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
      { error: 'Failed to update journey step' },
      { status: 500 }
    )
  }
}

// DELETE /api/journey-steps/[id] - Delete journey step (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await prisma.journeyStep.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Journey step deleted successfully'
    })

  } catch (error) {
    console.error('Journey step deletion error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete journey step' },
      { status: 500 }
    )
  }
}