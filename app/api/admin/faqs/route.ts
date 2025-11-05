import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  page_slug: z.string().optional(),
  order_index: z.number().default(0),
  is_active: z.boolean().default(true),
})

const faqsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  category: z.string().optional(),
  page_slug: z.string().optional(),
  active: z.string().optional(),
})

// GET /api/admin/faqs - Get all FAQs
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = faqsQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (validatedQuery.search) {
      where.OR = [
        { question: { contains: validatedQuery.search, mode: 'insensitive' } },
        { answer: { contains: validatedQuery.search, mode: 'insensitive' } },
      ]
    }

    if (validatedQuery.category) {
      where.category = validatedQuery.category
    }

    if (validatedQuery.page_slug) {
      where.page_slug = validatedQuery.page_slug
    }

    if (validatedQuery.active === 'true') {
      where.is_active = true
    } else if (validatedQuery.active === 'false') {
      where.is_active = false
    }

    const [faqs, totalFaqs] = await Promise.all([
      prisma.faqs.findMany({
        where,
        orderBy: [
          { order_index: 'asc' },
          { created_at: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.faqs.count({ where }),
    ])

    return NextResponse.json({
      faqs,
      pagination: {
        page,
        limit,
        total: totalFaqs,
        totalPages: Math.ceil(totalFaqs / limit),
        hasNext: page < Math.ceil(totalFaqs / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Get FAQs error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/faqs - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = faqSchema.parse(body)

    const faq = await prisma.faqs.create({
      data: {
        id: `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...validatedData,
      },
    })

    return NextResponse.json({ faq }, { status: 201 })
  } catch (error) {
    console.error('Create FAQ error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}