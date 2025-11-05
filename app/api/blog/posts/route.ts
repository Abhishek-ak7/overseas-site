import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const blogQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  featured: z.string().optional(),
  sort: z.string().optional().default('latest'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = blogQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause - only show published posts for public API
    const where: any = {
      status: 'PUBLISHED'
    }

    if (validatedQuery.search) {
      where.OR = [
        { title: { contains: validatedQuery.search, mode: 'insensitive' } },
        { content: { contains: validatedQuery.search, mode: 'insensitive' } },
        { excerpt: { contains: validatedQuery.search, mode: 'insensitive' } },
      ]
    }

    if (validatedQuery.categoryId) {
      where.categoryId = validatedQuery.categoryId
    }

    // For featured posts, get most recent published posts
    if (validatedQuery.featured === 'true') {
      // Keep only published status filter for featured
    }

    // Build order by clause
    let orderBy: any = { publishedAt: 'desc' }
    switch (validatedQuery.sort) {
      case 'popular':
        orderBy = { viewCount: 'desc' }
        break
      case 'oldest':
        orderBy = { publishedAt: 'asc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      default:
        orderBy = { publishedAt: 'desc' }
    }

    // Get posts using proper blog_posts model
    const [posts, totalCount] = await Promise.all([
      prisma.blog_posts.findMany({
        where,
        orderBy: {
          published_at: orderBy.publishedAt === 'desc' ? 'desc' : orderBy.publishedAt === 'asc' ? 'asc' : 'desc'
        },
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          categories: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.blog_posts.count({ where })
    ])

    // Transform posts data to match frontend expectations
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      slug: post.slug,
      featuredImage: post.featured_image,
      author: {
        id: post.users.id,
        name: `${post.users.first_name} ${post.users.last_name}`,
        email: post.users.email,
        avatar: null // No avatar in schema yet
      },
      category: post.categories?.name || 'Uncategorized',
      tags: post.tags?.map(tag => tag.name) || [],
      publishedAt: post.published_at?.toISOString() || post.created_at.toISOString(),
      readTime: post.read_time || Math.ceil((post.content?.length || 0) / 1000) + 1,
      views: post.view_count || 0,
      isFeatured: validatedQuery.featured === 'true' // Simple featured logic for compatibility
    }))

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    })

  } catch (error) {
    console.error('Blog posts fetch error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}