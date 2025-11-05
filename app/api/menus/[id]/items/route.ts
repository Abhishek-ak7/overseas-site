import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const menuItemSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  url: z.string().min(1, 'URL is required'),
  type: z.string().default('custom'),
  orderIndex: z.number().default(0),
  isActive: z.boolean().default(true),
  parentId: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  target: z.string().default('_self'),
  cssClass: z.string().optional().nullable(),
}).transform(data => ({
  ...data,
  // Convert empty strings to null for optional fields
  parentId: data.parentId === '' ? null : data.parentId,
  category: data.category === '' ? null : data.category,
  description: data.description === '' ? null : data.description,
  cssClass: data.cssClass === '' ? null : data.cssClass,
}))

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/menus/[id]/items - Get menu items
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const menu = await prisma.menus.findUnique({
      where: { id: params.id }
    })

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    const items = await prisma.menu_items.findMany({
      where: { menu_id: params.id },
      orderBy: { order_index: 'asc' },
      include: {
        parent: true,
        children: true,
      }
    })

    return NextResponse.json({ items })

  } catch (error) {
    console.error('Menu items fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

// POST /api/menus/[id]/items - Create menu item
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('Received menu item request body:', body)

    const validatedData = menuItemSchema.parse(body)
    console.log('Validated menu item data:', validatedData)

    const menu = await prisma.menus.findUnique({
      where: { id: params.id }
    })

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    // Check for parent item if parentId is provided
    if (validatedData.parentId) {
      const parentItem = await prisma.menu_items.findUnique({
        where: {
          id: validatedData.parentId,
          menu_id: params.id
        }
      })

      if (!parentItem) {
        return NextResponse.json(
          { error: 'Parent menu item not found' },
          { status: 400 }
        )
      }
    }

    console.log('Creating menu item for menu:', params.id)
    console.log('Menu item data to be created:', {
      label: validatedData.label,
      url: validatedData.url,
      type: validatedData.type,
      category: validatedData.category,
      description: validatedData.description,
      target: validatedData.target,
      menu_id: params.id,
      order_index: validatedData.orderIndex,
      is_active: validatedData.isActive,
      parent_id: validatedData.parentId,
      css_class: validatedData.cssClass,
    })

    const menuItem = await prisma.menu_items.create({
      data: {
        label: validatedData.label,
        url: validatedData.url,
        type: validatedData.type,
        category: validatedData.category,
        description: validatedData.description,
        target: validatedData.target,
        menu_id: params.id,
        order_index: validatedData.orderIndex,
        is_active: validatedData.isActive,
        parent_id: validatedData.parentId,
        css_class: validatedData.cssClass,
      },
    })

    return NextResponse.json({
      menuItem,
      message: 'Menu item created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Menu item creation error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      params,
      validatedData
    })

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

    // Return more detailed error in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Failed to create menu item',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
