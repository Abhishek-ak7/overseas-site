import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const createInquirySchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  study_destination: z.string().optional(),
  message: z.string().optional(),
  source: z.string().default('hero_form')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createInquirySchema.parse(body)

    // Create contact inquiry using the correct table
    const inquiry = await prisma.contact_inquiries.create({
      data: {
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        study_destination: validatedData.study_destination || null,
        message: validatedData.message || null,
        source: validatedData.source
      }
    })

    return NextResponse.json({
      success: true,
      message: "Thank you for your inquiry! We'll contact you within 24 hours.",
      inquiry: {
        id: inquiry.id,
        full_name: inquiry.full_name,
        email: inquiry.email,
        status: inquiry.status
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Contact inquiry creation error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      prismaError: error
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid form data',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to submit contact inquiry. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count
    const total = await prisma.contact_inquiries.count({ where })

    // Get inquiries
    const inquiries = await prisma.contact_inquiries.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    })

    return NextResponse.json({
      success: true,
      inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Contact inquiries fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch contact inquiries'
    }, { status: 500 })
  }
}