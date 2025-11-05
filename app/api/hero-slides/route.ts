import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const heroSlideSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  backgroundImage: z.string().optional(),
  backgroundVideo: z.string().optional(),
  textColor: z.string().default('#FFFFFF'),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).default(0.3),
  orderIndex: z.number().default(0),
  isActive: z.boolean().default(true),
  displayDuration: z.number().default(5000),
  animationType: z.string().default('fade'),
  mobileImage: z.string().optional(),
})

// GET /api/hero-slides - Get all active hero slides
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {}
    if (!includeInactive) {
      where.is_active = true
    }

    const heroSlides = await prisma.hero_slides.findMany({
      where,
      orderBy: { order_index: 'asc' },
    })

    // Transform database field names to match frontend expectations
    const transformedSlides = heroSlides.map(slide => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      ctaText: slide.cta_text,
      ctaLink: slide.cta_link,
      secondaryCtaText: slide.secondary_cta_text,
      secondaryCtaLink: slide.secondary_cta_link,
      backgroundImage: slide.background_image,
      backgroundVideo: slide.background_video,
      textColor: slide.text_color,
      overlayColor: slide.overlay_color,
      overlayOpacity: slide.overlay_opacity,
      orderIndex: slide.order_index,
      isActive: slide.is_active,
      displayDuration: slide.display_duration,
      animationType: slide.animation_type,
      mobileImage: slide.mobile_image,
      createdAt: slide.created_at,
      updatedAt: slide.updated_at,
    }))

    return NextResponse.json({ heroSlides: transformedSlides })
  } catch (error) {
    console.error('Hero slides fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero slides' },
      { status: 500 }
    )
  }
}

// POST /api/hero-slides - Create new hero slide (Admin only)
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
    const validatedData = heroSlideSchema.parse(body)

    const heroSlide = await prisma.hero_slides.create({
      data: {
        id: randomUUID(),
        title: validatedData.title,
        subtitle: validatedData.subtitle,
        description: validatedData.description,
        cta_text: validatedData.ctaText,
        cta_link: validatedData.ctaLink,
        secondary_cta_text: validatedData.secondaryCtaText,
        secondary_cta_link: validatedData.secondaryCtaLink,
        background_image: validatedData.backgroundImage,
        background_video: validatedData.backgroundVideo,
        text_color: validatedData.textColor,
        overlay_color: validatedData.overlayColor,
        overlay_opacity: validatedData.overlayOpacity,
        order_index: validatedData.orderIndex,
        is_active: validatedData.isActive,
        display_duration: validatedData.displayDuration,
        animation_type: validatedData.animationType,
        mobile_image: validatedData.mobileImage,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      heroSlide,
      message: 'Hero slide created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Hero slide creation error:', error)

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
      { error: 'Failed to create hero slide' },
      { status: 500 }
    )
  }
}