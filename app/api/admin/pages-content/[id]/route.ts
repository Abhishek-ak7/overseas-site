import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

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

// GET /api/admin/pages-content/[id] - Get single page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const page = await prisma.pages.findUnique({
      where: { id: params.id },
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

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Get page error:', error)

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

// PUT /api/admin/pages-content/[id] - Update page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = pageSchema.parse(body)

    // Check if page exists
    const existingPage = await prisma.pages.findUnique({
      where: { id: params.id }
    })

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    // Check if slug is unique (excluding current page)
    if (validatedData.slug !== existingPage.slug) {
      const slugExists = await prisma.pages.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const page = await prisma.pages.update({
      where: { id: params.id },
      data: {
        ...validatedData,
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

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Update page error:', error)

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

// DELETE /api/admin/pages-content/[id] - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    // Check if page exists
    const existingPage = await prisma.pages.findUnique({
      where: { id: params.id }
    })

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    // Delete page (cascade will delete sections)
    await prisma.pages.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Page deleted successfully' })
  } catch (error) {
    console.error('Delete page error:', error)

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