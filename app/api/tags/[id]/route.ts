import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const tagUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  description: z.string().optional(),
  color: z.string().optional(),
})

// GET /api/tags/[id] - Get single tag
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const isSlug = searchParams.get('bySlug') === 'true'
    const withPosts = searchParams.get('withPosts') === 'true'

    const whereClause = isSlug ? { slug: params.id } : { id: params.id }

    const tag = await prisma.tag.findUnique({
      where: whereClause,
      include: {
        ...(withPosts && {
          blogPosts: {
            where: {
              status: 'PUBLISHED'
            },
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              featuredImage: true,
              publishedAt: true,
              viewCount: true,
              author: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: {
              publishedAt: 'desc'
            }
          }
        })
      }
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tag })
  } catch (error) {
    console.error('Tag fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    )
  }
}

// PUT /api/tags/[id] - Update tag (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = tagUpdateSchema.parse(body)

    // Check if slug is unique (if being updated)
    if (validatedData.slug) {
      const existingTag = await prisma.tag.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: params.id }
        }
      })

      if (existingTag) {
        return NextResponse.json(
          { error: 'Tag with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json({
      tag,
      message: 'Tag updated successfully'
    })

  } catch (error) {
    console.error('Tag update error:', error)

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
      { error: 'Failed to update tag' },
      { status: 500 }
    )
  }
}

// DELETE /api/tags/[id] - Delete tag (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Note: Tags can be deleted even if they have associated posts
    // The relationship will be automatically handled by Prisma
    await prisma.tag.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Tag deleted successfully'
    })

  } catch (error) {
    console.error('Tag deletion error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
}