import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

const statisticSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  icon: z.string().optional(),
  iconColor: z.string().default('#EF4444'),
  backgroundColor: z.string().default('#FFFFFF'),
  isAnimated: z.boolean().default(true),
  animationDuration: z.number().default(2000),
  suffix: z.string().optional(),
  prefix: z.string().optional(),
  orderIndex: z.number().default(0),
  isActive: z.boolean().default(true),
  category: z.string().optional(),
  autoUpdate: z.boolean().default(false),
  querySource: z.string().optional(),
})

// GET /api/statistics - Get all active statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const where: any = {
      is_active: true,
    }

    if (category) {
      where.category = category
    }

    const statistics = await prisma.statistics.findMany({
      where,
      orderBy: { order_index: 'asc' },
      take: limit,
    })

    // Transform the data to match frontend expectations
    const transformedStatistics = statistics.map(stat => ({
      id: stat.id,
      label: stat.label,
      value: stat.value,
      icon: stat.icon,
      iconColor: stat.icon_color,
      backgroundColor: stat.background_color,
      isAnimated: stat.is_animated,
      animationDuration: stat.animation_duration,
      suffix: stat.suffix,
      prefix: stat.prefix,
      orderIndex: stat.order_index,
      isActive: stat.is_active,
      category: stat.category,
      autoUpdate: stat.auto_update,
      querySource: stat.query_source,
    }))

    return NextResponse.json({ statistics: transformedStatistics })
  } catch (error) {
    console.error('Statistics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

// POST /api/statistics - Create new statistic (Admin only)
export async function POST(request: NextRequest) {
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
    const validatedData = statisticSchema.parse(body)

    const statistic = await prisma.statistics.create({
      data: {
        id: crypto.randomUUID(),
        label: validatedData.label,
        value: validatedData.value,
        icon: validatedData.icon,
        icon_color: validatedData.iconColor,
        background_color: validatedData.backgroundColor,
        is_animated: validatedData.isAnimated,
        animation_duration: validatedData.animationDuration,
        suffix: validatedData.suffix,
        prefix: validatedData.prefix,
        order_index: validatedData.orderIndex,
        is_active: validatedData.isActive,
        category: validatedData.category,
        auto_update: validatedData.autoUpdate,
        query_source: validatedData.querySource,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Transform the created statistic for response
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

    return NextResponse.json({
      statistic: transformedStatistic,
      message: 'Statistic created successfully'
    })

  } catch (error) {
    console.error('Statistic creation error:', error)

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
      { error: 'Failed to create statistic' },
      { status: 500 }
    )
  }
}