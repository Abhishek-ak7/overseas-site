import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole, PostStatus } from '@prisma/client'

const updateBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().optional(),
  content: z.string().min(1, 'Content is required').optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  publishedAt: z.string().optional(),
})

// GET /api/admin/content/[id] - Get specific content item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const { id } = params

    // Try to find in blog posts first
    const blogPost = await prisma.blog_posts.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        featured_image: true,
        category_id: true,
        status: true,
        published_at: true,
        view_count: true,
        created_at: true,
        updated_at: true,
        author_name: true,
        seo_title: true,
        seo_description: true,
        read_time: true
      }
    })

    if (blogPost) {
      return NextResponse.json({
        post: {
          ...blogPost,
          author: {
            firstName: blogPost.author_name?.split(' ')[0] || 'Unknown',
            lastName: blogPost.author_name?.split(' ').slice(1).join(' ') || ''
          }
        }
      })
    }

    // Try other content types (testimonials, countries) if needed
    return NextResponse.json(
      { error: 'Content not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Get content error:', error)

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

// PUT /api/admin/content/[id] - Update specific content item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const { id } = params
    const body = await request.json()

    // Try to find and update in blog posts first
    const existingPost = await prisma.blog_posts.findUnique({
      where: { id }
    })

    if (existingPost) {
      const validatedData = updateBlogPostSchema.parse(body)

      // Generate slug if title changed
      let slug = validatedData.slug || existingPost.slug
      if (validatedData.title && validatedData.title !== existingPost.title && !validatedData.slug) {
        slug = validatedData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }

      // Check if slug exists for other posts
      if (slug !== existingPost.slug) {
        const existingSlug = await prisma.blog_posts.findFirst({
          where: { 
            slug,
            id: { not: id }
          }
        })

        if (existingSlug) {
          slug = `${slug}-${Date.now()}`
        }
      }

      const { tags, ...postData } = validatedData

      const updatedPost = await prisma.blog_posts.update({
        where: { id },
        data: {
          ...(postData.title && { title: postData.title }),
          slug,
          ...(postData.content && { content: postData.content }),
          ...(postData.excerpt !== undefined && { excerpt: postData.excerpt }),
          ...(postData.featuredImage !== undefined && { featured_image: postData.featuredImage }),
          ...(postData.categoryId !== undefined && { category_id: postData.categoryId }),
          ...(postData.status && { status: postData.status }),
          ...(postData.seoTitle !== undefined && { seo_title: postData.seoTitle }),
          ...(postData.seoDescription !== undefined && { seo_description: postData.seoDescription }),
          ...(validatedData.status === 'PUBLISHED' && !existingPost.published_at && { published_at: new Date() }),
          updated_at: new Date(),
        }
      })

      return NextResponse.json({ 
        post: updatedPost, 
        message: 'Blog post updated successfully' 
      })
    }

    // Try other content types if needed
    return NextResponse.json(
      { error: 'Content not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Update content error:', error)

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

// DELETE /api/admin/content/[id] - Delete specific content item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const { id } = params

    // Try to find and delete from blog posts first
    const existingPost = await prisma.blog_posts.findUnique({
      where: { id }
    })

    if (existingPost) {
      await prisma.blog_posts.delete({
        where: { id }
      })

      return NextResponse.json({ 
        message: 'Blog post deleted successfully' 
      })
    }

    // Try other content types if needed
    return NextResponse.json(
      { error: 'Content not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Delete content error:', error)

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