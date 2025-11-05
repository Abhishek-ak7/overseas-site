import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const heroSlideUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  backgroundImage: z.string().optional(),
  backgroundVideo: z.string().optional(),
  textColor: z.string().optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  orderIndex: z.number().optional(),
  isActive: z.boolean().optional(),
  displayDuration: z.number().optional(),
  animationType: z.string().optional(),
  mobileImage: z.string().optional(),
})

// GET /api/hero-slides/[id] - Get single hero slide
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const heroSlide = await prisma.hero_slides.findUnique({
      where: { id: params.id },
    })

    if (!heroSlide) {
      return NextResponse.json(
        { error: 'Hero slide not found' },
        { status: 404 }
      )
    }

    // Transform database field names to match frontend expectations
    const transformedSlide = {
      id: heroSlide.id,
      title: heroSlide.title,
      subtitle: heroSlide.subtitle,
      description: heroSlide.description,
      ctaText: heroSlide.cta_text,
      ctaLink: heroSlide.cta_link,
      secondaryCtaText: heroSlide.secondary_cta_text,
      secondaryCtaLink: heroSlide.secondary_cta_link,
      backgroundImage: heroSlide.background_image,
      backgroundVideo: heroSlide.background_video,
      textColor: heroSlide.text_color,
      overlayColor: heroSlide.overlay_color,
      overlayOpacity: heroSlide.overlay_opacity,
      orderIndex: heroSlide.order_index,
      isActive: heroSlide.is_active,
      displayDuration: heroSlide.display_duration,
      animationType: heroSlide.animation_type,
      mobileImage: heroSlide.mobile_image,
      createdAt: heroSlide.created_at,
      updatedAt: heroSlide.updated_at,
    }

    return NextResponse.json({ heroSlide: transformedSlide })
  } catch (error) {
    console.error('Hero slide fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero slide' },
      { status: 500 }
    )
  }
}

// PUT /api/hero-slides/[id] - Update hero slide (Admin only)
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
    const validatedData = heroSlideUpdateSchema.parse(body)

    // Check if hero slide exists
    const existingSlide = await prisma.hero_slides.findUnique({
      where: { id: params.id },
    })

    if (!existingSlide) {
      return NextResponse.json(
        { error: 'Hero slide not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date(),
    }

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.subtitle !== undefined) updateData.subtitle = validatedData.subtitle
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.ctaText !== undefined) updateData.cta_text = validatedData.ctaText
    if (validatedData.ctaLink !== undefined) updateData.cta_link = validatedData.ctaLink
    if (validatedData.secondaryCtaText !== undefined) updateData.secondary_cta_text = validatedData.secondaryCtaText
    if (validatedData.secondaryCtaLink !== undefined) updateData.secondary_cta_link = validatedData.secondaryCtaLink
    if (validatedData.backgroundImage !== undefined) updateData.background_image = validatedData.backgroundImage
    if (validatedData.backgroundVideo !== undefined) updateData.background_video = validatedData.backgroundVideo
    if (validatedData.textColor !== undefined) updateData.text_color = validatedData.textColor
    if (validatedData.overlayColor !== undefined) updateData.overlay_color = validatedData.overlayColor
    if (validatedData.overlayOpacity !== undefined) updateData.overlay_opacity = validatedData.overlayOpacity
    if (validatedData.orderIndex !== undefined) updateData.order_index = validatedData.orderIndex
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive
    if (validatedData.displayDuration !== undefined) updateData.display_duration = validatedData.displayDuration
    if (validatedData.animationType !== undefined) updateData.animation_type = validatedData.animationType
    if (validatedData.mobileImage !== undefined) updateData.mobile_image = validatedData.mobileImage

    const heroSlide = await prisma.hero_slides.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      heroSlide,
      message: 'Hero slide updated successfully'
    })

  } catch (error) {
    console.error('Hero slide update error:', error)

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
      { error: 'Failed to update hero slide' },
      { status: 500 }
    )
  }
}

// DELETE /api/hero-slides/[id] - Delete hero slide (Admin only)
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

    // Check if hero slide exists
    const existingSlide = await prisma.hero_slides.findUnique({
      where: { id: params.id },
    })

    if (!existingSlide) {
      return NextResponse.json(
        { error: 'Hero slide not found' },
        { status: 404 }
      )
    }

    await prisma.hero_slides.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Hero slide deleted successfully'
    })

  } catch (error) {
    console.error('Hero slide delete error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete hero slide' },
      { status: 500 }
    )
  }
}