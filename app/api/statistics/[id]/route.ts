import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const statisticUpdateSchema = z.object({
  label: z.string().min(1, 'Label is required').optional(),
  value: z.string().min(1, 'Value is required').optional(),
  icon: z.string().optional(),
  iconColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  isAnimated: z.boolean().optional(),
  animationDuration: z.number().optional(),
  suffix: z.string().optional(),
  prefix: z.string().optional(),
  orderIndex: z.number().optional(),
  isActive: z.boolean().optional(),
  category: z.string().optional(),
  autoUpdate: z.boolean().optional(),
  querySource: z.string().optional(),
})

// GET /api/statistics/[id] - Get single statistic
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const statistic = await prisma.statistics.findUnique({
      where: { id: params.id },
    })

    if (!statistic) {
      return NextResponse.json(
        { error: 'Statistic not found' },
        { status: 404 }
      )
    }

    // Transform the data to match frontend expectations
    const transformedStatistic = {
      id: statistic.id,
      label: statistic.label,
      value: statistic.value,
      icon: statistic.icon,
      iconColor: statistic.icon_color,
      backgroundColor: statistic.background_color,
      isAnimated: statistic.is_animated,
      animationDuration: statistic.animation_duration,
      suffix: statistic.suffix,
      prefix: statistic.prefix,
      orderIndex: statistic.order_index,
      isActive: statistic.is_active,
      category: statistic.category,
      autoUpdate: statistic.auto_update,
      querySource: statistic.query_source,
    }

    return NextResponse.json({ statistic: transformedStatistic })
  } catch (error) {
    console.error('Statistic fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistic' },
      { status: 500 }
    )
  }
}

// PUT /api/statistics/[id] - Update statistic (Admin only)
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
    const validatedData = statisticUpdateSchema.parse(body)

    // Check if statistic exists
    const existingStatistic = await prisma.statistics.findUnique({
      where: { id: params.id },
    })

    if (!existingStatistic) {
      return NextResponse.json(
        { error: 'Statistic not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date(),
    }

    if (validatedData.label !== undefined) updateData.label = validatedData.label
    if (validatedData.value !== undefined) updateData.value = validatedData.value
    if (validatedData.icon !== undefined) updateData.icon = validatedData.icon
    if (validatedData.iconColor !== undefined) updateData.icon_color = validatedData.iconColor
    if (validatedData.backgroundColor !== undefined) updateData.background_color = validatedData.backgroundColor
    if (validatedData.isAnimated !== undefined) updateData.is_animated = validatedData.isAnimated
    if (validatedData.animationDuration !== undefined) updateData.animation_duration = validatedData.animationDuration
    if (validatedData.suffix !== undefined) updateData.suffix = validatedData.suffix
    if (validatedData.prefix !== undefined) updateData.prefix = validatedData.prefix
    if (validatedData.orderIndex !== undefined) updateData.order_index = validatedData.orderIndex
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.autoUpdate !== undefined) updateData.auto_update = validatedData.autoUpdate
    if (validatedData.querySource !== undefined) updateData.query_source = validatedData.querySource

    const statistic = await prisma.statistics.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      statistic,
      message: 'Statistic updated successfully'
    })

  } catch (error) {
    console.error('Statistic update error:', error)

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
      { error: 'Failed to update statistic' },
      { status: 500 }
    )
  }
}

// DELETE /api/statistics/[id] - Delete statistic (Admin only)
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

    // Check if statistic exists
    const existingStatistic = await prisma.statistics.findUnique({
      where: { id: params.id },
    })

    if (!existingStatistic) {
      return NextResponse.json(
        { error: 'Statistic not found' },
        { status: 404 }
      )
    }

    await prisma.statistics.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Statistic deleted successfully'
    })

  } catch (error) {
    console.error('Statistic delete error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete statistic' },
      { status: 500 }
    )
  }
}