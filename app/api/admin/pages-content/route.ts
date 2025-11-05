import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

const pagesQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  published: z.string().optional(),
  sortBy: z.enum(['title', 'slug', 'published_at', 'created_at']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string(),
  excerpt: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  featured_image: z.string().optional(),
  template: z.string().optional().default('default'),
  is_published: z.boolean().default(false),
  published_at: z.string().optional().nullable(),
})

// GET /api/admin/pages-content - Get all pages with content management
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = pagesQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (validatedQuery.search) {
      where.OR = [
        { title: { contains: validatedQuery.search, mode: 'insensitive' } },
        { slug: { contains: validatedQuery.search, mode: 'insensitive' } },
        { content: { contains: validatedQuery.search, mode: 'insensitive' } },
      ]
    }

    if (validatedQuery.published === 'true') {
      where.is_published = true
    } else if (validatedQuery.published === 'false') {
      where.is_published = false
    }

    // Build orderBy
    const orderBy: any = {}
    orderBy[validatedQuery.sortBy] = validatedQuery.sortOrder

    // Fetch pages with sections
    const [pages, totalPages] = await Promise.all([
      prisma.pages.findMany({
        where,
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          page_sections: {
            orderBy: { order_index: 'asc' },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.pages.count({ where }),
    ])

    return NextResponse.json({
      pages,
      pagination: {
        page,
        limit,
        total: totalPages,
        totalPages: Math.ceil(totalPages / limit),
        hasNext: page < Math.ceil(totalPages / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Get pages error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/pages-content - Create new page
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = pageSchema.parse(body)

    // Check if slug is unique
    const existingPage = await prisma.pages.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      )
    }

    const page = await prisma.pages.create({
      data: {
        ...validatedData,
        id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        author_id: user.id,
        published_at: validatedData.published_at ? new Date(validatedData.published_at) : null,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        page_sections: {
          orderBy: { order_index: 'asc' },
        },
      },
    })

    return NextResponse.json({ page }, { status: 201 })
  } catch (error) {
    console.error('Create page error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}