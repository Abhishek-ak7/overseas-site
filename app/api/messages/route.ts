import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const createMessageSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
  source: z.string().default('contact_form')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMessageSchema.parse(body)

    // Create message
    const message = await prisma.messages.create({
      data: {
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject || null,
        message: validatedData.message,
        source: validatedData.source
      }
    })

    return NextResponse.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      data: {
        id: message.id,
        full_name: message.full_name,
        email: message.email,
        status: message.status
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Message creation error:', error)
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
      message: 'Failed to send message. Please try again.',
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
    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count
    const total = await prisma.messages.count({ where })

    // Get messages
    const messages = await prisma.messages.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    })

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch messages'
    }, { status: 500 })
  }
}