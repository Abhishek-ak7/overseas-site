import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const menuUpdateSchema = z.object({
  name: z.string().min(1, 'Menu name is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  description: z.string().optional(),
  location: z.enum(['HEADER', 'FOOTER', 'SIDEBAR', 'MOBILE', 'CUSTOM']).optional(),
  isActive: z.boolean().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/menus/[id] - Get specific menu with items
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const includeItems = new URL(request.url).searchParams.get('includeItems') === 'true'
    
    const include = includeItems ? {
      items: {
        orderBy: {
          order_index: 'asc' as const
        }
      }
    } : undefined

    const menu = await prisma.menus.findUnique({
      where: { id: params.id },
      include
    })
    
    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ menu })

  } catch (error) {
    console.error('Menu fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}

// PUT /api/menus/[id] - Update menu (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const validatedData = menuUpdateSchema.parse(body)

    // Check if menu exists
    const existingMenu = await prisma.menus.findUnique({
      where: { id: params.id }
    })

    if (!existingMenu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    // Validate slug uniqueness if being updated
    if (validatedData.slug && validatedData.slug !== existingMenu.slug) {
      const slugExists = await prisma.menus.findUnique({
        where: { 
          slug: validatedData.slug,
          id: { not: params.id }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Menu with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const menu = await prisma.menus.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({
      menu,
      message: 'Menu updated successfully'
    })

  } catch (error) {
    console.error('Menu update error:', error)

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
      { error: 'Failed to update menu' },
      { status: 500 }
    )
  }
}

// DELETE /api/menus/[id] - Delete menu (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if menu exists
    const existingMenu = await prisma.menus.findUnique({
      where: { id: params.id },
      include: {
        items: true
      }
    })

    if (!existingMenu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    // Delete menu (cascade will delete associated items)
    await prisma.menus.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Menu deleted successfully'
    })

  } catch (error) {
    console.error('Menu deletion error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    )
  }
}