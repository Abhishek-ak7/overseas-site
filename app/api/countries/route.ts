import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const countrySchema = z.object({
  name: z.string().min(1, 'Country name is required'),
  code: z.string().min(2, 'Country code is required').max(3),
  description: z.string().optional(),
  flagUrl: z.string().optional(),
  universities: z.any().optional(),
  programs: z.any().optional(),
  requirements: z.any().optional(),
  livingCost: z.any().optional(),
  scholarships: z.any().optional(),
  workRights: z.any().optional(),
  intake: z.any().optional(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true)
})

// GET /api/countries - Get all countries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const featured = searchParams.get('featured') === 'true'
    const popular = searchParams.get('popular') === 'true'
    const continent = searchParams.get('continent')
    const limit = searchParams.get('limit')

    const where: any = {}
    if (!includeInactive) {
      where.is_active = true
    }
    if (featured) {
      where.is_popular = true
    }
    if (popular) {
      where.is_popular = true
    }

    const countries = await prisma.countries.findMany({
      where,
      orderBy: [
        { is_popular: 'desc' },
        { name: 'asc' }
      ],
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json({ countries })
  } catch (error) {
    console.error('Countries fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    )
  }
}

// POST /api/countries - Create new country (Admin only)
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
    const validatedData = countrySchema.parse(body)
    const { name, code } = validatedData

    // Check if country with same name or code already exists
    const existingCountry = await prisma.countries.findFirst({
      where: {
        OR: [
          { name },
          { code }
        ]
      }
    })

    if (existingCountry) {
      return NextResponse.json(
        { message: 'Country with this name or code already exists' },
        { status: 409 }
      )
    }

    // Map the fields to match database schema
    const countryData = {
      id: randomUUID(),
      name: validatedData.name,
      code: validatedData.code,
      description: validatedData.description || null,
      flag_url: validatedData.flagUrl || null,
      universities: validatedData.universities || null,
      programs: validatedData.programs || null,
      requirements: validatedData.requirements || null,
      living_cost: validatedData.livingCost || null,
      scholarships: validatedData.scholarships || null,
      work_rights: validatedData.workRights || null,
      intake: validatedData.intake || null,
      is_popular: validatedData.isPopular || false,
      is_active: validatedData.isActive !== false,
      created_at: new Date(),
      updated_at: new Date()
    }

    const country = await prisma.countries.create({
      data: countryData
    })

    return NextResponse.json({
      country,
      message: 'Country created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Country creation error:', error)

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
      { error: 'Failed to create country' },
      { status: 500 }
    )
  }
}