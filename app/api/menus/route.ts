import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const menuSchema = z.object({
  name: z.string().min(1, 'Menu name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  location: z.enum(['HEADER', 'FOOTER', 'SIDEBAR', 'MOBILE', 'CUSTOM']),
  isActive: z.boolean().default(true),
})

// GET /api/menus - Get all menus
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') as 'HEADER' | 'FOOTER' | 'SIDEBAR' | 'MOBILE' | 'CUSTOM'
    const includeItems = searchParams.get('includeItems') === 'true'
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Build where clause
    const where: any = {}
    if (location) {
      where.location = location === 'HEADER' ? 'HEADER_PRIMARY' : location
    }
    if (!includeInactive) {
      where.is_active = true
    }

    // Query menus
    const menus = await prisma.menus.findMany({
      where,
      orderBy: { created_at: 'desc' },
      ...(includeItems && {
        include: {
          items: {
            where: includeInactive ? {} : { is_active: true },
            orderBy: { order_index: 'asc' },
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
      menus: transformedMenus,
      count: transformedMenus.length
    })

  } catch (error) {
    console.error('Menu fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
}

// POST /api/menus - Create new menu (Admin only)
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
    const validatedData = menuSchema.parse(body)

    // Check if slug already exists
    const existingMenu = await prisma.menus.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingMenu) {
      return NextResponse.json(
        { error: 'A menu with this slug already exists' },
        { status: 409 }
      )
    }

    const menu = await prisma.menus.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        location: validatedData.location,
        is_active: validatedData.isActive,
      },
    })

    // Transform response to match frontend interface
    const transformedMenu = {
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      description: menu.description,
      location: menu.location,
      isActive: menu.is_active,
      createdAt: menu.created_at.toISOString(),
      updatedAt: menu.updated_at.toISOString(),
    }

    return NextResponse.json({
      menu: transformedMenu,
      message: 'Menu created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Menu creation error:', error)

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
      { error: 'Failed to create menu' },
      { status: 500 }
    )
  }
}
