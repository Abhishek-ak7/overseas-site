import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const reorderSchema = z.object({
  itemIds: z.array(z.string()).min(1, 'At least one item ID is required'),
})

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/menus/[id]/items/reorder - Reorder menu items
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
    const { itemIds } = reorderSchema.parse(body)

    // Verify all items belong to the specified menu
    const menuItems = await prisma.menu_items.findMany({
      where: {
        id: { in: itemIds },
        menu_id: params.id
      }
    })

    if (menuItems.length !== itemIds.length) {
      return NextResponse.json(
        { error: 'Some menu items do not exist or do not belong to this menu' },
        { status: 400 }
      )
    }

    // Update order_index for each item
    const updatePromises = itemIds.map((itemId, index) => 
      prisma.menu_items.update({
        where: { id: itemId },
        data: { order_index: index }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      message: 'Menu items reordered successfully'
    })

  } catch (error) {
    console.error('Menu item reorder error:', error)

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
      { error: 'Failed to reorder menu items' },
      { status: 500 }
    )
  }
}