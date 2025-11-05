import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { randomUUID } from 'crypto'

interface RouteParams {
  params: {
    id: string
  }
}

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10, 'Review must be at least 10 characters').optional(),
})

const reviewQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
})

// GET /api/courses/[id]/reviews - Get course reviews
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = reviewQuerySchema.parse(queryParams)

    const courseId = params.id
    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Check if course exists
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.course_reviews.findMany({
        where: {
          course_id: courseId,
          is_published: true,
        },
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              user_profiles: {
                select: {
                  avatar_url: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.course_reviews.count({
        where: {
          course_id: courseId,
          is_published: true,
        },
      }),
    ])

    // Calculate rating statistics
    const ratingStats = await prisma.course_reviews.groupBy({
      by: ['rating'],
      where: {
        course_id: courseId,
        is_published: true,
      },
      _count: {
        rating: true,
      },
    })

    const avgRating = await prisma.course_reviews.aggregate({
      where: {
        course_id: courseId,
        is_published: true,
      },
      _avg: {
        rating: true,
      },
    })

    const response = {
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        reviewText: review.review_text,
        createdAt: review.created_at,
        user: {
          name: `${review.users.first_name} ${review.users.last_name}`,
          avatar: review.users.user_profiles?.avatar_url,
        },
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      statistics: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews: totalCount,
        ratingDistribution: ratingStats.map(stat => ({
          rating: stat.rating,
          count: stat._count.rating,
        })),
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get reviews error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[id]/reviews - Create course review
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const courseId = params.id

    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Check if course exists
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.course_enrollments.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You must be enrolled in this course to leave a review' },
        { status: 403 }
      )
    }

    // Check if user has already reviewed this course
    const existingReview = await prisma.course_reviews.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: courseId,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this course' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.course_reviews.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        course_id: courseId,
        rating: validatedData.rating,
        review_text: validatedData.reviewText,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            user_profiles: {
              select: {
                avatar_url: true,
              },
            },
          },
        },
      },
    })

    // Update course rating and review count
    const allReviews = await prisma.course_reviews.findMany({
      where: {
        course_id: courseId,
        is_published: true,
      },
      select: { rating: true },
    })

    const totalRatings = allReviews.length
    const averageRating = allReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalRatings

    await prisma.courses.update({
      where: { id: courseId },
      data: {
        rating: averageRating,
        total_ratings: totalRatings,
      },
    })

    const response = {
      id: review.id,
      rating: review.rating,
      reviewText: review.review_text,
      createdAt: review.created_at,
      user: {
        name: `${review.users.first_name} ${review.users.last_name}`,
        avatar: review.users.user_profiles?.avatar_url,
      },
    }

    return NextResponse.json({
      review: response,
      message: 'Review created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)

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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}