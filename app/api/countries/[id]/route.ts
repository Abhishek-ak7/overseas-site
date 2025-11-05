import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const countryUpdateSchema = z.object({
  name: z.string().min(1, 'Country name is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  flagUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  continent: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  capital: z.string().optional(),
  population: z.number().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  orderIndex: z.number().optional(),
  studyCost: z.string().optional(),
  livingCost: z.string().optional(),
  visaRequirements: z.string().optional(),
  workPermit: z.string().optional(),
  universities: z.array(z.string()).optional(),
  popularCourses: z.array(z.string()).optional(),
  scholarships: z.array(z.string()).optional(),
  admissionRequirements: z.string().optional(),
  applicationDeadlines: z.string().optional(),
  intakeSeasons: z.array(z.string()).optional(),
  processingTime: z.string().optional(),
  successRate: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/countries/[id] - Get single country
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const country = await prisma.country.findUnique({
      where: { id: params.id },
    })

    if (!country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ country })
  } catch (error) {
    console.error('Country fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch country' },
      { status: 500 }
    )
  }
}

// PUT /api/countries/[id] - Update country (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const validatedData = countryUpdateSchema.parse(body)

    // Check if country exists
    const existingCountry = await prisma.country.findUnique({
      where: { id: params.id }
    })

    if (!existingCountry) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      )
    }

    // Check if slug already exists for another country
    if (validatedData.slug && validatedData.slug !== existingCountry.slug) {
      const slugExists = await prisma.country.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Country with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const country = await prisma.country.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      country,
      message: 'Country updated successfully'
    })

  } catch (error) {
    console.error('Country update error:', error)

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
      { error: 'Failed to update country' },
      { status: 500 }
    )
  }
}

// DELETE /api/countries/[id] - Delete country (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if country exists
    const existingCountry = await prisma.country.findUnique({
      where: { id: params.id }
    })

    if (!existingCountry) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      )
    }

    await prisma.country.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Country deleted successfully'
    })

  } catch (error) {
    console.error('Country deletion error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete country' },
      { status: 500 }
    )
  }
}