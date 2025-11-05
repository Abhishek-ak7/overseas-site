import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const featureUpdateSchema = z.object({
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

// GET /api/features/[id] - Get single feature
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feature = await prisma.features.findUnique({
      where: { id: params.id },
    })

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ feature })
  } catch (error) {
    console.error('Feature fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature' },
      { status: 500 }
    )
  }
}

// PUT /api/features/[id] - Update feature (Admin only)
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
    const validatedData = featureUpdateSchema.parse(body)

    // Check if feature exists
    const existingFeature = await prisma.features.findUnique({
      where: { id: params.id },
    })

    if (!existingFeature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date(),
    }

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
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

    const feature = await prisma.features.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      feature,
      message: 'Feature updated successfully'
    })

  } catch (error) {
    console.error('Feature update error:', error)

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
      { error: 'Failed to update feature' },
      { status: 500 }
    )
  }
}

// DELETE /api/features/[id] - Delete feature (Admin only)
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

    // Check if feature exists
    const existingFeature = await prisma.features.findUnique({
      where: { id: params.id },
    })

    if (!existingFeature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    await prisma.features.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Feature deleted successfully'
    })

  } catch (error) {
    console.error('Feature delete error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete feature' },
      { status: 500 }
    )
  }
}