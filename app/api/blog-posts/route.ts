import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  readTime: z.number().optional(),
})

const blogQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featured: z.string().optional(),
  sort: z.string().optional().default('latest'),
})

// GET /api/blog-posts - Get all blog posts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = blogQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Only show published posts for public access, all posts for admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      where.status = 'PUBLISHED'
    } else if (validatedQuery.status) {
      where.status = validatedQuery.status
    }

    if (validatedQuery.search) {
      where.OR = [
        { title: { contains: validatedQuery.search, mode: 'insensitive' } },
        { content: { contains: validatedQuery.search, mode: 'insensitive' } },
        { excerpt: { contains: validatedQuery.search, mode: 'insensitive' } },
      ]
    }

    if (validatedQuery.categoryId) {
      where.category_id = validatedQuery.categoryId
    }

    if (validatedQuery.featured === 'true') {
      // For featured posts, we'll use a simple logic - most recent published posts
      where.status = 'PUBLISHED'
    }

    // Build order by clause
    let orderBy: any = { created_at: 'desc' }
    switch (validatedQuery.sort) {
      case 'popular':
        orderBy = { view_count: 'desc' }
        break
      case 'oldest':
        orderBy = { created_at: 'asc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      default:
        orderBy = { published_at: 'desc' }
    }

    // Get posts with related data
    const [posts, totalCount] = await Promise.all([
      prisma.blog_posts.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              user_profiles: {
                select: {
                  avatar_url: true
                }
              }
            }
          },
          categories: {
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

    // Transform posts data
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featured_image,
      status: post.status,
      publishedAt: post.published_at,
      viewCount: post.view_count,
      readTime: post.read_time,
      seoTitle: post.seo_title,
      seoDescription: post.seo_description,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      author: {
        id: post.users.id,
        firstName: post.users.first_name,
        lastName: post.users.last_name,
        email: post.users.email,
        profile: post.users.user_profiles
      },
      category: post.categories,
      tags: [], // No tags relation in current schema
      isPublished: post.status === 'PUBLISHED',
      isFeatured: validatedQuery.featured === 'true' // Simple featured logic
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

// POST /api/blog-posts - Create new blog post (Admin only)
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
    const validatedData = blogPostSchema.parse(body)

    // Handle tag associations
    const { tagIds, ...postData } = validatedData

    // Create the blog post
    const blogPost = await prisma.blog_posts.create({
      data: {
        id: `post-${Date.now()}`,
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        excerpt: postData.excerpt,
        featured_image: postData.featuredImage,
        category_id: postData.categoryId,
        status: postData.status,
        published_at: postData.status === 'PUBLISHED'
          ? (postData.publishedAt ? new Date(postData.publishedAt) : new Date())
          : null,
        seo_title: postData.seoTitle,
        seo_description: postData.seoDescription,
        read_time: postData.readTime,
        author_id: user.id,
        author_name: `${user.first_name} ${user.last_name}`,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        categories: true
      }
    })

    return NextResponse.json({
      blogPost,
      message: 'Blog post created successfully'
    })

  } catch (error) {
    console.error('Blog post creation error:', error)

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
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}