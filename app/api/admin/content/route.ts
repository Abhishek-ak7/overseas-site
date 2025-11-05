import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole, PostStatus } from '@prisma/client'
import { randomUUID } from 'crypto'

const contentQuerySchema = z.object({
  type: z.enum(['blog', 'testimonials', 'countries']).optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  sortBy: z.enum(['title', 'created', 'updated', 'views']).optional().default('created'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  publishedAt: z.string().optional(),
})

const createTestimonialSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().min(1).max(5),
  courseId: z.string().optional(),
  country: z.string().optional(),
  university: z.string().optional(),
  program: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isPublished: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  position: z.number().optional(),
})

const createCountrySchema = z.object({
  name: z.string().min(1, 'Country name is required'),
  code: z.string().min(2).max(3),
  description: z.string().optional(),
  flagUrl: z.string().optional(),
  universities: z.array(z.any()).optional().default([]),
  programs: z.array(z.any()).optional().default([]),
  requirements: z.any().optional(),
  livingCost: z.any().optional(),
  scholarships: z.any().optional(),
  workRights: z.any().optional(),
  intake: z.any().optional(),
  isPopular: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
})

// GET /api/admin/content - Get content based on type
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = contentQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    let response: any = {}

    switch (validatedQuery.type) {
      case 'blog':
        response = await getBlogPosts(validatedQuery, skip, limit)
        break
      case 'testimonials':
        response = await getTestimonials(validatedQuery, skip, limit)
        break
      case 'countries':
        response = await getCountries(validatedQuery, skip, limit)
        break
      default:
        // Get overview of all content types
        const [blogCount, testimonialCount, countryCount] = await Promise.all([
          prisma.blog_posts.count(),
          prisma.testimonials.count(),
          prisma.countries.count(),
        ])

        response = {
          overview: {
            blogPosts: blogCount,
            testimonials: testimonialCount,
            countries: countryCount,
          }
        }
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get admin content error:', error)

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

// POST /api/admin/content - Create new content
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const { type, ...data } = body

    let result: any = {}

    switch (type) {
      case 'blog':
        result = await createBlogPost(data, user.id, user.first_name + ' ' + user.last_name)
        break
      case 'testimonial':
        result = await createTestimonial(data)
        break
      case 'country':
        result = await createCountry(data)
        break
      default:
        return NextResponse.json(
          { error: `Invalid content type: "${type}". Expected: blog, testimonial, or country` },
          { status: 400 }
        )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create content error:', error)

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

// Helper functions
async function getBlogPosts(query: any, skip: number, limit: number) {
  const where: any = {}

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { content: { contains: query.search, mode: 'insensitive' } },
      { excerpt: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  if (query.status) {
    where.status = query.status as PostStatus
  }

  let orderBy: any = {}
  switch (query.sortBy) {
    case 'title':
      orderBy.title = query.sortOrder
      break
    case 'views':
      orderBy.view_count = query.sortOrder
      break
    case 'updated':
      orderBy.updated_at = query.sortOrder
      break
    case 'created':
    default:
      orderBy.created_at = query.sortOrder
      break
  }

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

  return {
    posts: posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      status: post.status,
      publishedAt: post.published_at?.toISOString(),
      seoTitle: post.seo_title,
      seoDescription: post.seo_description,
      readTime: post.read_time,
      createdAt: post.created_at.toISOString(),
      updatedAt: post.updated_at.toISOString(),
      author: {
        id: post.users.id,
        name: `${post.users.first_name} ${post.users.last_name}`,
        email: post.users.email
      },
      category: post.categories ? {
        id: post.categories.id,
        name: post.categories.name,
        slug: post.categories.slug
      } : null,
      tags: post.tags?.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      })) || []
    })),
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    }
  }
}

async function getTestimonials(query: any, skip: number, limit: number) {
  const where: any = {}

  if (query.search) {
    where.OR = [
      { student_name: { contains: query.search, mode: 'insensitive' } },
      { content: { contains: query.search, mode: 'insensitive' } },
      { country: { contains: query.search, mode: 'insensitive' } },
      { university: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [testimonials, totalCount] = await Promise.all([
    prisma.testimonials.findMany({
      where,
      orderBy: { position: 'asc' },
      skip,
      take: limit,
    }),
    prisma.testimonials.count({ where })
  ])

  return {
    testimonials,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    }
  }
}

async function getCountries(query: any, skip: number, limit: number) {
  const where: any = {}

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { code: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [countries, totalCount] = await Promise.all([
    prisma.countries.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.countries.count({ where })
  ])

  return {
    countries,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    }
  }
}

async function createBlogPost(data: any, authorId: string, authorName: string) {
  console.log('createBlogPost received data:', JSON.stringify(data, null, 2))
  const validatedData = createBlogPostSchema.parse(data)
  console.log('validatedData:', JSON.stringify(validatedData, null, 2))

  // Generate slug if not provided
  let slug = validatedData.slug
  if (!slug) {
    slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Check if slug exists
  const existingPost = await prisma.blog_posts.findUnique({
    where: { slug }
  })

  if (existingPost) {
    slug = `${slug}-${Date.now()}`
  }

  const { tags, ...postData } = validatedData
  console.log('postData.categoryId:', postData.categoryId, 'type:', typeof postData.categoryId)
  console.log('tags to connect:', tags)

  // Check if category exists before using it
  let validCategoryId = null
  if (postData.categoryId) {
    const existingCategory = await prisma.categories.findUnique({
      where: { id: postData.categoryId }
    })
    if (existingCategory) {
      validCategoryId = postData.categoryId
      console.log('Found existing category:', validCategoryId)
    } else {
      console.log('Category not found:', postData.categoryId)
    }
  }

  // Check if tags exist before connecting
  let existingTags: any[] = []
  if (tags && tags.length > 0) {
    existingTags = await prisma.tags.findMany({
      where: {
        id: { in: tags }
      }
    })
    console.log('Found existing tags:', existingTags.map(t => t.id))
  }

  // Calculate read time if not provided
  const readTime = Math.max(1, Math.ceil((postData.content?.length || 0) / 1000) + 1)

  const post = await prisma.blog_posts.create({
    data: {
      id: randomUUID(),
      title: postData.title,
      slug,
      content: postData.content,
      excerpt: postData.excerpt,
      featured_image: postData.featuredImage,
      ...(validCategoryId && { category_id: validCategoryId }),
      status: postData.status,
      seo_title: postData.seoTitle,
      seo_description: postData.seoDescription,
      author_id: authorId,
      author_name: authorName,
      read_time: readTime,
      published_at: postData.status === 'PUBLISHED' ? new Date() : postData.publishedAt ? new Date(postData.publishedAt) : null,
      updated_at: new Date(),
      ...(existingTags.length > 0 && {
        tags: {
          connect: existingTags.map(tag => ({ id: tag.id }))
        }
      })
    }
  })

  return { post, message: 'Blog post created successfully' }
}

async function createTestimonial(data: any) {
  const validatedData = createTestimonialSchema.parse(data)

  const testimonial = await prisma.testimonials.create({
    data: {
      id: randomUUID(),
      student_name: validatedData.studentName,
      content: validatedData.content,
      rating: validatedData.rating,
      course_id: validatedData.courseId,
      country: validatedData.country,
      university: validatedData.university,
      program: validatedData.program,
      image_url: validatedData.imageUrl,
      video_url: validatedData.videoUrl,
      is_published: validatedData.isPublished || false,
      is_featured: validatedData.isFeatured || false,
      position: validatedData.position || 0,
      updated_at: new Date(),
    }
  })

  return { testimonial, message: 'Testimonial created successfully' }
}

async function createCountry(data: any) {
  const validatedData = createCountrySchema.parse(data)

  // Check if country exists
  const existingCountry = await prisma.countries.findFirst({
    where: {
      OR: [
        { name: validatedData.name },
        { code: validatedData.code },
      ]
    }
  })

  if (existingCountry) {
    throw new Error('Country with this name or code already exists')
  }

  const country = await prisma.countries.create({
    data: {
      id: randomUUID(),
      name: validatedData.name,
      code: validatedData.code,
      description: validatedData.description,
      flag_url: validatedData.flagUrl,
      universities: validatedData.universities,
      programs: validatedData.programs,
      requirements: validatedData.requirements,
      living_cost: validatedData.livingCost,
      scholarships: validatedData.scholarships,
      work_rights: validatedData.workRights,
      intake: validatedData.intake,
      is_popular: validatedData.isPopular || false,
      is_active: validatedData.isActive !== false,
      updated_at: new Date(),
    }
  })

  return { country, message: 'Country created successfully' }
}