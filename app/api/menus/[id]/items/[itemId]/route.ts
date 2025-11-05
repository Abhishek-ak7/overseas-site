import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const menuItemUpdateSchema = z.object({
  label: z.string().min(1, 'Label is required').optional(),
  url: z.string().min(1, 'URL is required').optional(),
  type: z.string().optional(),
  orderIndex: z.number().optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  target: z.string().optional(),
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
    itemId: string
  }
}

// GET /api/menus/[id]/items/[itemId] - Get specific menu item
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const menuItem = await prisma.menu_items.findUnique({
      where: {
        id: params.itemId,
        menu_id: params.id
      },
      include: {
        parent: true,
        children: true,
      }
    })

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ menuItem })

  } catch (error) {
    console.error('Menu item fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    )
  }
}

// PUT /api/menus/[id]/items/[itemId] - Update menu item
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = menuItemUpdateSchema.parse(body)

    const existingMenuItem = await prisma.menu_items.findUnique({
      where: {
        id: params.itemId,
        menu_id: params.id
      }
    })

    if (!existingMenuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

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

    const updatedMenuItem = await prisma.menu_items.update({
      where: {
        id: params.itemId,
        menu_id: params.id
      },
      data: {
        // Only include fields that are actually being updated
        ...(validatedData.label && { label: validatedData.label }),
        ...(validatedData.url && { url: validatedData.url }),
        ...(validatedData.type && { type: validatedData.type }),
        ...(validatedData.orderIndex !== undefined && { order_index: validatedData.orderIndex }),
        ...(validatedData.isActive !== undefined && { is_active: validatedData.isActive }),
        ...(validatedData.parentId !== undefined && { parent_id: validatedData.parentId }),
        ...(validatedData.category !== undefined && { category: validatedData.category }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.target && { target: validatedData.target }),
        ...(validatedData.cssClass !== undefined && { css_class: validatedData.cssClass }),
      },
    })

    return NextResponse.json({
      menuItem: updatedMenuItem,
      message: 'Menu item updated successfully'
    })

  } catch (error) {
    console.error('Menu item update error:', error)

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
      { error: 'Failed to update menu item' },
      { status: 500 }
    )
  }
}

// DELETE /api/menus/[id]/items/[itemId] - Delete menu item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const existingMenuItem = await prisma.menu_items.findUnique({
      where: {
        id: params.itemId,
        menu_id: params.id
      }
    })

    if (!existingMenuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // Delete all children first
    await prisma.menu_items.deleteMany({
      where: { parent_id: params.itemId }
    })

    // Delete the menu item
    await prisma.menu_items.delete({
      where: {
        id: params.itemId,
        menu_id: params.id
      }
    })

    return NextResponse.json({
      message: 'Menu item deleted successfully'
    })

  } catch (error) {
    console.error('Menu item deletion error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}
