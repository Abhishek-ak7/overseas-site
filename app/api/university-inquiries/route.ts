import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const [inquiries, total] = await Promise.all([
      prisma.university_inquiries.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.university_inquiries.count({ where })
    ])

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('University inquiries API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch university inquiries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const inquiry = await prisma.university_inquiries.create({
      data: {
        university_ids: body.universityIds,
        name: body.name,
        email: body.email,
        phone: body.phone,
        type: body.type || 'information_request',
        status: 'pending'
      }
    })

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('University inquiry creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create university inquiry' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const inquiry = await prisma.university_inquiries.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('University inquiry update error:', error)
    return NextResponse.json(
      { error: 'Failed to update university inquiry' },
      { status: 500 }
    )
  }
}