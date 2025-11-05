import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  isPublished: z.boolean().default(false),
  template: z.string().default('default'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().default(0),
})

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  status: z.enum(['published', 'draft', 'all']).optional().default('all'),
  template: z.string().optional(),
  parentId: z.string().optional(),
})

// GET /api/admin/pages - Get all pages with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = querySchema.parse(queryParams)

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

    if (validatedQuery.status !== 'all') {
      where.is_published = validatedQuery.status === 'published'
    }

    if (validatedQuery.template) {
      where.template = validatedQuery.template
    }

    if (validatedQuery.parentId) {
      // Note: The pages model doesn't have parent relationships in this schema
      // This filter might not be applicable
    }

    // Get pages with pagination
    const [pages, totalCount] = await Promise.all([
      prisma.pages.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updated_at: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            }
          }
        },
      }),
      prisma.pages.count({ where }),
    ])

    return NextResponse.json({
      pages,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
      statistics: {
        total: await prisma.pages.count(),
        published: await prisma.pages.count({ where: { is_published: true } }),
        drafts: await prisma.pages.count({ where: { is_published: false } }),
        templates: await prisma.pages.groupBy({
          by: ['template'],
          _count: { template: true },
        }),
      }
    })

  } catch (error) {
    console.error('Get pages error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

// POST /api/admin/pages - Create new page
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = pageSchema.parse(body)

    // Check if slug already exists
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
        id: `page-${Date.now()}`,
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt,
        is_published: validatedData.isPublished,
        template: validatedData.template,
        meta_title: validatedData.metaTitle,
        meta_description: validatedData.metaDescription,
        author_id: user.id,
        published_at: validatedData.isPublished ? new Date() : null,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      page,
      message: 'Page created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create page error:', error)

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

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    )
  }
}