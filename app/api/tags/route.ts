import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  color: z.string().optional(),
})

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    // Return mock tags for now since the tags table might not exist
    const mockTags = [
      {
        id: '1',
        name: 'IELTS',
        slug: 'ielts',
        description: 'International English Language Testing System',
        color: '#3B82F6'
      },
      {
        id: '2',
        name: 'TOEFL',
        slug: 'toefl',
        description: 'Test of English as a Foreign Language',
        color: '#EF4444'
      },
      {
        id: '3',
        name: 'Canada',
        slug: 'canada',
        description: 'Study in Canada',
        color: '#10B981'
      },
      {
        id: '4',
        name: 'USA',
        slug: 'usa',
        description: 'Study in United States',
        color: '#F59E0B'
      },
      {
        id: '5',
        name: 'UK',
        slug: 'uk',
        description: 'Study in United Kingdom',
        color: '#8B5CF6'
      },
      {
        id: '6',
        name: 'Australia',
        slug: 'australia',
        description: 'Study in Australia',
        color: '#F97316'
      },
      {
        id: '7',
        name: 'Scholarship',
        slug: 'scholarship',
        description: 'Scholarship opportunities',
        color: '#06B6D4'
      },
      {
        id: '8',
        name: 'Application',
        slug: 'application',
        description: 'University application process',
        color: '#84CC16'
      },
      {
        id: '9',
        name: 'Engineering',
        slug: 'engineering',
        description: 'Engineering programs',
        color: '#6366F1'
      },
      {
        id: '10',
        name: 'Business',
        slug: 'business',
        description: 'Business and MBA programs',
        color: '#EC4899'
      },
    ]

    return NextResponse.json({
      tags: mockTags
    })
  } catch (error) {
    console.error('Tags fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST /api/tags - Create new tag (Admin only)
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
    const validatedData = tagSchema.parse(body)

    // Check if slug is unique
    const existingTag = await prisma.tag.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag with this slug already exists' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.create({
      data: validatedData
    })

    return NextResponse.json({
      tag,
      message: 'Tag created successfully'
    })

  } catch (error) {
    console.error('Tag creation error:', error)

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
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}