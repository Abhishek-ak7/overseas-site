import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

const partnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  country: z.string().optional(),
  partnerType: z.string().default('university'),
  description: z.string().optional(),
  ranking: z.number().optional(),
  establishedYear: z.number().optional(),
  studentCount: z.number().optional(),
  coursesOffered: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPreferred: z.boolean().default(false),
  orderIndex: z.number().default(0),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

// GET /api/partners - Get all active partners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const partnerType = searchParams.get('type')
    const country = searchParams.get('country')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const where: any = {
      is_active: true,
    }

    if (featured) {
      where.is_featured = true
    }

    if (partnerType) {
      where.partner_type = partnerType
    }

    if (country) {
      where.country = country
    }

    const partners = await prisma.partners.findMany({
      where,
      orderBy: [
        { is_preferred: 'desc' },
        { is_featured: 'desc' },
        { order_index: 'asc' },
        { name: 'asc' }
      ],
      take: limit,
    })

    return NextResponse.json({ partners })
  } catch (error) {
    console.error('Partners fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

// POST /api/partners - Create new partner (Admin only)
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
    const validatedData = partnerSchema.parse(body)

    const partner = await prisma.partners.create({
      data: {
        id: crypto.randomUUID(),
        name: validatedData.name,
        logo_url: validatedData.logoUrl,
        website_url: validatedData.websiteUrl,
        country: validatedData.country,
        partner_type: validatedData.partnerType,
        description: validatedData.description,
        ranking: validatedData.ranking,
        established_year: validatedData.establishedYear,
        student_count: validatedData.studentCount,
        courses_offered: validatedData.coursesOffered || [],
        is_active: validatedData.isActive,
        is_featured: validatedData.isFeatured,
        is_preferred: validatedData.isPreferred,
        order_index: validatedData.orderIndex,
        contact_email: validatedData.contactEmail,
        contact_phone: validatedData.contactPhone,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zip_code: validatedData.zipCode,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      partner,
      message: 'Partner created successfully'
    })

  } catch (error) {
    console.error('Partner creation error:', error)

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
      { error: 'Failed to create partner' },
      { status: 500 }
    )
  }
}