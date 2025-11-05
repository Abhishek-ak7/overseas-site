import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

const createConsultantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  experience: z.string().optional(),
  education: z.string().optional(),
  certifications: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default(['English']),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive'),
  timeZone: z.string().optional().default('UTC'),
  availability: z.record(z.any()).optional(), // Weekly schedule
})

const consultantsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  search: z.string().optional(),
  specialty: z.string().optional(),
  language: z.string().optional(),
  minRate: z.string().optional(),
  maxRate: z.string().optional(),
  available: z.string().optional(), // date string for availability check
  sortBy: z.enum(['name', 'hourlyRate', 'rating', 'experience']).optional().default('rating'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// GET /api/consultants - List consultants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = consultantsQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Check if admin access
    let isAdmin = false
    try {
      const user = await getUserFromToken(request)
      isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
    } catch {
      // Not admin, continue with public access
    }

    // Build where clause
    const where: any = {}

    // Only filter by active status for non-admin users
    if (!isAdmin) {
      where.is_active = true
    }

    if (validatedQuery.search) {
      where.OR = [
        { name: { contains: validatedQuery.search, mode: 'insensitive' } },
        { bio: { contains: validatedQuery.search, mode: 'insensitive' } },
        { specialties: { hasSome: [validatedQuery.search] } },
        { languages: { hasSome: [validatedQuery.search] } },
      ]
    }

    if (validatedQuery.specialty) {
      where.specialties = { hasSome: [validatedQuery.specialty] }
    }

    if (validatedQuery.language) {
      where.languages = { hasSome: [validatedQuery.language] }
    }

    if (validatedQuery.minRate || validatedQuery.maxRate) {
      where.hourlyRate = {}
      if (validatedQuery.minRate) {
        where.hourlyRate.gte = parseFloat(validatedQuery.minRate)
      }
      if (validatedQuery.maxRate) {
        where.hourlyRate.lte = parseFloat(validatedQuery.maxRate)
      }
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (validatedQuery.sortBy) {
      case 'name':
        orderBy.name = validatedQuery.sortOrder
        break
      case 'hourlyRate':
        orderBy.hourlyRate = validatedQuery.sortOrder
        break
      case 'rating':
        orderBy.rating = validatedQuery.sortOrder
        break
      case 'experience':
        orderBy.experience = validatedQuery.sortOrder
        break
      default:
        orderBy.rating = 'desc'
        break
    }

    // Get consultants from the correct table
    const [consultants, totalCount] = await Promise.all([
      prisma.consultants.findMany({
        where,
        orderBy: {
          rating: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.consultants.count({ where }),
    ])

    const formattedConsultants = consultants.map(consultant => ({
      id: consultant.id,
      name: consultant.name,
      email: consultant.email,
      phone: consultant.phone,
      bio: consultant.bio,
      specialties: consultant.specialties,
      experience: consultant.experience,
      education: consultant.education,
      certifications: consultant.certifications,
      languages: consultant.languages,
      hourlyRate: Number(consultant.hourly_rate),
      currency: consultant.currency,
      avatarUrl: consultant.avatar_url,
      isActive: consultant.is_active,
      rating: consultant.rating,
      totalReviews: consultant.total_reviews,
      availability: consultant.availability,
      timeZone: consultant.time_zone
    }))

    const response = {
      success: true,
      consultants: formattedConsultants,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get consultants error:', error)

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

// POST /api/consultants - Create new consultant (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = createConsultantSchema.parse(body)

    // Check if email already exists
    const existingConsultant = await prisma.consultants.findUnique({
      where: { email: validatedData.email },
    })

    if (existingConsultant) {
      return NextResponse.json(
        { success: false, error: 'Consultant with this email already exists' },
        { status: 400 }
      )
    }

    const consultant = await prisma.consultants.create({
      data: {
        id: `consultant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        bio: validatedData.bio,
        specialties: validatedData.specialties,
        experience: validatedData.experience,
        education: validatedData.education,
        certifications: validatedData.certifications || [],
        languages: validatedData.languages || ['English'],
        hourly_rate: validatedData.hourlyRate,
        currency: 'USD',
        avatar_url: null,
        is_active: true,
        rating: 4.5,
        total_reviews: 0,
        availability: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' }
        },
        time_zone: validatedData.timeZone || 'UTC',
        created_at: new Date(),
        updated_at: new Date()
      },
    })

    return NextResponse.json({
      success: true,
      consultant: {
        id: consultant.id,
        name: consultant.name,
        email: consultant.email,
        phone: consultant.phone,
        bio: consultant.bio,
        specialties: consultant.specialties,
        experience: consultant.experience,
        education: consultant.education,
        certifications: consultant.certifications,
        languages: consultant.languages,
        hourlyRate: Number(consultant.hourly_rate),
        currency: consultant.currency,
        avatarUrl: consultant.avatar_url,
        isActive: consultant.is_active,
        rating: consultant.rating,
        totalReviews: consultant.total_reviews,
        availability: consultant.availability,
        timeZone: consultant.time_zone
      },
      message: 'Consultant created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create consultant error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}