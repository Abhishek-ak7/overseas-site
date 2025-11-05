import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

const pageUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  excerpt: z.string().optional(),
  isPublished: z.boolean().optional(),
  template: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/admin/pages/[id] - Get single page
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const page = await prisma.page.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        children: {
          select: {
            id: true,
            title: true,
            slug: true,
            isPublished: true,
            order: true,
          },
          orderBy: { order: 'asc' }
        },
        parent: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
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
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/pages/[id] - Update page
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = pageUpdateSchema.parse(body)

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id: params.id }
    })

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    // Check if slug already exists for another page
    if (validatedData.slug && validatedData.slug !== existingPage.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Validate parent page exists if parentId is provided
    if (validatedData.parentId) {
      // Prevent setting itself as parent
      if (validatedData.parentId === params.id) {
        return NextResponse.json(
          { error: 'Page cannot be its own parent' },
          { status: 400 }
        )
      }

      const parentPage = await prisma.page.findUnique({
        where: { id: validatedData.parentId }
      })

      if (!parentPage) {
        return NextResponse.json(
          { error: 'Parent page not found' },
          { status: 400 }
        )
      }

      // Prevent circular references by checking if the target parent is a child of current page
      const isCircular = await checkCircularReference(params.id, validatedData.parentId)
      if (isCircular) {
        return NextResponse.json(
          { error: 'Cannot create circular page hierarchy' },
          { status: 400 }
        )
      }
    }

    // Update publishedAt if publishing status changes
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    }

    if (validatedData.isPublished !== undefined) {
      if (validatedData.isPublished && !existingPage.isPublished) {
        updateData.publishedAt = new Date()
      } else if (!validatedData.isPublished && existingPage.isPublished) {
        updateData.publishedAt = null
      }
    }

    const page = await prisma.page.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        children: {
          select: {
            id: true,
            title: true,
            slug: true,
            isPublished: true,
            order: true,
          },
          orderBy: { order: 'asc' }
        },
        parent: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
      }
    })

    return NextResponse.json({
      page,
      message: 'Page updated successfully'
    })

  } catch (error) {
    console.error('Update page error:', error)

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
      { error: 'Failed to update page' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/pages/[id] - Delete page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id: params.id },
      include: {
        children: true
      }
    })

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    // Check if page has children
    if (existingPage.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete page with child pages. Please delete or move child pages first.' },
        { status: 400 }
      )
    }

    // Delete page
    await prisma.page.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Page deleted successfully'
    })

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
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    )
  }
}

// Helper function to check for circular references in page hierarchy
async function checkCircularReference(pageId: string, potentialParentId: string): Promise<boolean> {
  let currentParentId = potentialParentId

  while (currentParentId) {
    if (currentParentId === pageId) {
      return true // Circular reference found
    }

    const parent = await prisma.page.findUnique({
      where: { id: currentParentId },
      select: { parentId: true }
    })

    if (!parent) {
      break
    }

    currentParentId = parent.parentId
  }

  return false
}