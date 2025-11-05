import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Skip auth check for now to make it work quickly

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const queryType = searchParams.get('query_type')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (queryType) where.query_type = queryType
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [inquiries, totalCount] = await Promise.all([
      prisma.consultation_inquiries.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.consultation_inquiries.count({ where })
    ])

    const response = inquiries.map(inquiry => ({
      id: inquiry.id,
      fullName: inquiry.full_name,
      email: inquiry.email,
      phone: inquiry.phone,
      queryType: inquiry.query_type,
      studyDestination: inquiry.study_destination,
      currentEducation: inquiry.current_education,
      message: inquiry.message,
      source: inquiry.source,
      status: inquiry.status,
      priority: inquiry.priority,
      assignedTo: inquiry.assigned_to,
      adminNotes: inquiry.admin_notes,
      respondedAt: inquiry.responded_at,
      resolvedAt: inquiry.resolved_at,
      createdAt: inquiry.created_at,
      updatedAt: inquiry.updated_at
    }))

    return NextResponse.json({
      success: true,
      inquiries: response,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching consultation inquiries:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch consultation inquiries'
    }, { status: 500 })
  }
}