import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

const testimonialSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  content: z.string().min(1, 'Testimonial content is required'),
  rating: z.number().min(1).max(5),
  courseId: z.string().optional(),
  country: z.string().optional(),
  university: z.string().optional(),
  program: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  position: z.number().optional(),
})

// GET /api/testimonials - Get all published testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'

    const where: any = {}

    if (!includeUnpublished) {
      where.is_published = true
    }

    if (featured) {
      where.is_featured = true
    }

    const testimonials = await prisma.testimonials.findMany({
      where,
      orderBy: [
        { is_featured: 'desc' },
        { position: 'asc' },
        { created_at: 'desc' }
      ],
      take: limit,
    })

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error('Testimonials fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}

// POST /api/testimonials - Create new testimonial (Admin only)
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
    const validatedData = testimonialSchema.parse(body)

    const testimonial = await prisma.testimonials.create({
      data: {
        id: crypto.randomUUID(),
        student_name: validatedData.studentName,
        content: validatedData.content,
        rating: validatedData.rating,
        course_id: validatedData.courseId,
        country: validatedData.country,
        university: validatedData.university,
        program: validatedData.program,
        image_url: validatedData.imageUrl,
        video_url: validatedData.videoUrl,
        is_published: validatedData.isPublished,
        is_featured: validatedData.isFeatured,
        position: validatedData.position,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      testimonial,
      message: 'Testimonial created successfully'
    })

  } catch (error) {
    console.error('Testimonial creation error:', error)

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
      { error: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
}