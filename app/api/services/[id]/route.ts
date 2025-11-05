import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const serviceUpdateSchema = z.object({
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

// GET /api/services/[id] - Get single service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.services.findUnique({
      where: { id: params.id },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Service fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

// PUT /api/services/[id] - Update service (Admin only)
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
    const validatedData = serviceUpdateSchema.parse(body)

    // Map form fields to database fields
    const updateData: any = {
      updated_at: new Date(),
    }

    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.description) updateData.description = validatedData.description
    if (validatedData.icon !== undefined) updateData.icon = validatedData.icon
    if (validatedData.iconType !== undefined) updateData.icon_type = validatedData.iconType
    if (validatedData.iconColor !== undefined) updateData.icon_color = validatedData.iconColor
    if (validatedData.backgroundColor !== undefined) updateData.background_color = validatedData.backgroundColor
    if (validatedData.ctaText !== undefined) updateData.cta_text = validatedData.ctaText
    if (validatedData.ctaLink !== undefined) updateData.cta_link = validatedData.ctaLink
    if (validatedData.orderIndex !== undefined) updateData.order_index = validatedData.orderIndex
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive
    if (validatedData.isFeatured !== undefined) updateData.is_featured = validatedData.isFeatured
    if (validatedData.category !== undefined) updateData.category = validatedData.category

    const service = await prisma.services.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      service,
      message: 'Service updated successfully'
    })

  } catch (error) {
    console.error('Service update error:', error)

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
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id] - Delete service (Admin only)
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

    await prisma.services.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Service deleted successfully'
    })

  } catch (error) {
    console.error('Service deletion error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}