import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const createConsultationSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  query_type: z.enum(['university_selection', 'visa_guidance', 'document_help', 'general_inquiry'], {
    errorMap: () => ({ message: 'Please select a valid query type' })
  }),
  study_destination: z.string().optional(),
  current_education: z.string().optional(),
  message: z.string().optional(),
  source: z.string().default('consultation_form')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createConsultationSchema.parse(body)

    const inquiry = await prisma.consultation_inquiries.create({
      data: {
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        query_type: validatedData.query_type,
        study_destination: validatedData.study_destination || null,
        current_education: validatedData.current_education || null,
        message: validatedData.message || null,
        source: validatedData.source
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Consultation request submitted successfully! We will contact you within 24 hours.',
      inquiry: {
        id: inquiry.id,
        full_name: inquiry.full_name,
        email: inquiry.email,
        query_type: inquiry.query_type,
        status: inquiry.status,
        created_at: inquiry.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating consultation inquiry:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      prismaError: error
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to submit consultation request. Please try again.',
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
    const query_type = searchParams.get('query_type')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (query_type) where.query_type = query_type
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count
    const total = await prisma.consultation_inquiries.count({ where })

    // Get inquiries
    const inquiries = await prisma.consultation_inquiries.findMany({
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
    console.error('Consultation inquiries fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch consultation inquiries'
    }, { status: 500 })
  }
}