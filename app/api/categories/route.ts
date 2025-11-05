import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  orderIndex: z.number().default(0),
  isActive: z.boolean().default(true),
})

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      orderBy: [
        { order_index: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        is_active: true,
        order_index: true,
        created_at: true
      }
    })

    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isActive: cat.is_active,
        orderIndex: cat.order_index,
        createdAt: cat.created_at
      }))
    })
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category (Admin only)
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
    const validatedData = categorySchema.parse(body)

    // Check if slug is unique
    const existingCategory = await prisma.categories.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.categories.create({
      data: {
        id: crypto.randomUUID(),
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        parent_id: validatedData.parentId,
        order_index: validatedData.orderIndex,
        is_active: validatedData.isActive,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      category,
      message: 'Category created successfully'
    })

  } catch (error) {
    console.error('Category creation error:', error)

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
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}