import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

const featureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().optional(),
  iconType: z.string().default('lucide'),
  iconColor: z.string().default('#EF4444'),
  backgroundColor: z.string().default('#FFFFFF'),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  orderIndex: z.number().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  category: z.string().optional(),
})

// GET /api/features - Get all active features
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const category = searchParams.get('category')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const where: any = {
      is_active: true,
    }

    if (featured) {
      where.is_featured = true
    }

    if (category) {
      where.category = category
    }

    const features = await prisma.features.findMany({
      where,
      orderBy: { order_index: 'asc' },
      take: limit,
    })

    return NextResponse.json({ features })
  } catch (error) {
    console.error('Features fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    )
  }
}

// POST /api/features - Create new feature (Admin only)
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
    const validatedData = featureSchema.parse(body)

    const feature = await prisma.features.create({
      data: {
        id: crypto.randomUUID(),
        title: validatedData.title,
        description: validatedData.description,
        icon: validatedData.icon,
        icon_type: validatedData.iconType,
        icon_color: validatedData.iconColor,
        background_color: validatedData.backgroundColor,
        cta_text: validatedData.ctaText,
        cta_link: validatedData.ctaLink,
        order_index: validatedData.orderIndex,
        is_active: validatedData.isActive,
        is_featured: validatedData.isFeatured,
        category: validatedData.category,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      feature,
      message: 'Feature created successfully'
    })

  } catch (error) {
    console.error('Feature creation error:', error)

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
      { error: 'Failed to create feature' },
      { status: 500 }
    )
  }
}