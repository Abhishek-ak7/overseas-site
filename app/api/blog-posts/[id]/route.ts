import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const blogPostUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  readTime: z.number().optional(),
})

// GET /api/blog-posts/[id] - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const incrementViews = searchParams.get('incrementViews') === 'true'
    const isSlug = searchParams.get('bySlug') === 'true'

    // Determine if we're searching by ID or slug
    const whereClause = isSlug ? { slug: params.id } : { id: params.id }

    const blogPost = await prisma.blogPost.findUnique({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
                bio: true
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      }
    })

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Check if user can access draft posts
    const authHeader = request.headers.get('authorization')
    if (blogPost.status !== 'PUBLISHED' && !authHeader) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Increment view count if requested (for public viewing)
    if (incrementViews && blogPost.status === 'PUBLISHED') {
      await prisma.blogPost.update({
        where: whereClause,
        data: {
          viewCount: {
            increment: 1
          }
        }
      })
      blogPost.viewCount += 1
    }

    return NextResponse.json({
      blogPost: {
        ...blogPost,
        isPublished: blogPost.status === 'PUBLISHED'
      }
    })
  } catch (error) {
    console.error('Blog post fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PUT /api/blog-posts/[id] - Update blog post (Admin only)
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
    const validatedData = blogPostUpdateSchema.parse(body)

    // Handle tag associations
    const { tagIds, ...postData } = validatedData

    // Prepare update data
    const updateData: any = {
      ...postData,
      updatedAt: new Date(),
    }

    // Handle published date
    if (validatedData.status === 'PUBLISHED' && validatedData.publishedAt) {
      updateData.publishedAt = new Date(validatedData.publishedAt)
    } else if (validatedData.status === 'PUBLISHED' && !validatedData.publishedAt) {
      // If publishing without specific date, use current date
      const currentPost = await prisma.blogPost.findUnique({
        where: { id: params.id },
        select: { publishedAt: true, status: true }
      })

      if (currentPost && currentPost.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date()
      }
    } else if (validatedData.status === 'DRAFT') {
      updateData.publishedAt = null
    }

    // Handle tag connections
    if (tagIds !== undefined) {
      updateData.tags = {
        set: [], // Clear existing connections
        connect: tagIds.map(tagId => ({ id: tagId }))
      }
    }

    const blogPost = await prisma.blogPost.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        category: true,
        tags: true
      }
    })

    return NextResponse.json({
      blogPost,
      message: 'Blog post updated successfully'
    })

  } catch (error) {
    console.error('Blog post update error:', error)

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
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog-posts/[id] - Delete blog post (Admin only)
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

    await prisma.blogPost.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Blog post deleted successfully'
    })

  } catch (error) {
    console.error('Blog post deletion error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}