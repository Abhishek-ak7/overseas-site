import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/menus - Get all public menus (no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') as 'HEADER' | 'FOOTER' | 'SIDEBAR' | 'MOBILE' | 'CUSTOM'
    const includeItems = searchParams.get('includeItems') === 'true'

    // Build where clause - only show active menus for public
    const where: any = { is_active: true }
    if (location) {
      where.location = location
    }

    // Query menus
    const menus = await prisma.menus.findMany({
      where,
      orderBy: { created_at: 'desc' },
      ...(includeItems && {
        include: {
          items: {
            where: { is_active: true },
            orderBy: { order_index: 'asc' },
            include: {
              parent: true,
              children: true,
            }
          }
        }
      })
    })

    // Transform data to match frontend interface
    const transformedMenus = menus.map((menu: any) => ({
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      description: menu.description,
      location: menu.location,
      isActive: menu.is_active,
      createdAt: menu.created_at.toISOString(),
      updatedAt: menu.updated_at.toISOString(),
      items: includeItems && menu.items ? menu.items.map((item: any) => ({
        id: item.id,
        label: item.label,
        url: item.url,
        type: item.type,
        orderIndex: item.order_index,
        isActive: item.is_active,
        parentId: item.parent_id,
        menuId: item.menu_id,
        category: item.category,
        description: item.description,
        target: item.target,
        cssClass: item.css_class,
        createdAt: item.created_at.toISOString(),
        updatedAt: item.updated_at.toISOString(),
      })) : undefined
    }))

    return NextResponse.json({
      success: true,
      menus: transformedMenus,
      count: transformedMenus.length
    })

  } catch (error) {
    console.error('Public menu fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch menus',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}