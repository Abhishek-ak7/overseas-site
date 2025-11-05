import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const testimonialUpdateSchema = z.object({
  studentName: z.string().min(1, 'Student name is required').optional(),
  studentEmail: z.string().email('Invalid email format').optional(),
  studentPhone: z.string().optional(),
  university: z.string().optional(),
  course: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  graduationYear: z.number().min(2000).max(2030).optional(),
  currentPosition: z.string().optional(),
  company: z.string().optional(),
  testimonialText: z.string().min(1, 'Testimonial text is required').optional(),
  rating: z.number().min(1).max(5).optional(),
  image: z.string().url('Invalid URL format').optional(),
  video: z.string().url('Invalid URL format').optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  category: z.string().optional(),
  orderIndex: z.number().optional(),
})

// GET /api/testimonials/[id] - Get single testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testimonial = await prisma.testimonials.findUnique({
      where: { id: params.id },
    })

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ testimonial })
  } catch (error) {
    console.error('Testimonial fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonial' },
      { status: 500 }
    )
  }
}

// PUT /api/testimonials/[id] - Update testimonial (Admin only)
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
    const validatedData = testimonialUpdateSchema.parse(body)

    // Check if testimonial exists
    const existingTestimonial = await prisma.testimonials.findUnique({
      where: { id: params.id },
    })

    if (!existingTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date(),
    }

    if (validatedData.studentName !== undefined) updateData.student_name = validatedData.studentName
    if (validatedData.studentEmail !== undefined) updateData.student_email = validatedData.studentEmail
    if (validatedData.studentPhone !== undefined) updateData.student_phone = validatedData.studentPhone
    if (validatedData.university !== undefined) updateData.university = validatedData.university
    if (validatedData.course !== undefined) updateData.course = validatedData.course
    if (validatedData.country !== undefined) updateData.country = validatedData.country
    if (validatedData.city !== undefined) updateData.city = validatedData.city
    if (validatedData.graduationYear !== undefined) updateData.graduation_year = validatedData.graduationYear
    if (validatedData.currentPosition !== undefined) updateData.current_position = validatedData.currentPosition
    if (validatedData.company !== undefined) updateData.company = validatedData.company
    if (validatedData.testimonialText !== undefined) updateData.testimonial_text = validatedData.testimonialText
    if (validatedData.rating !== undefined) updateData.rating = validatedData.rating
    if (validatedData.image !== undefined) updateData.image = validatedData.image
    if (validatedData.video !== undefined) updateData.video = validatedData.video
    if (validatedData.isFeatured !== undefined) updateData.is_featured = validatedData.isFeatured
    if (validatedData.isPublished !== undefined) updateData.is_published = validatedData.isPublished
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.orderIndex !== undefined) updateData.order_index = validatedData.orderIndex

    const testimonial = await prisma.testimonials.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      testimonial,
      message: 'Testimonial updated successfully'
    })

  } catch (error) {
    console.error('Testimonial update error:', error)

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
      { error: 'Failed to update testimonial' },
      { status: 500 }
    )
  }
}

// DELETE /api/testimonials/[id] - Delete testimonial (Admin only)
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

    // Check if testimonial exists
    const existingTestimonial = await prisma.testimonials.findUnique({
      where: { id: params.id },
    })

    if (!existingTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    await prisma.testimonials.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Testimonial deleted successfully'
    })

  } catch (error) {
    console.error('Testimonial delete error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    )
  }
}