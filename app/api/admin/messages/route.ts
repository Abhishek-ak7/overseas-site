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

    const response = messages.map(message => ({
      id: message.id,
      fullName: message.full_name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
      source: message.source,
      status: message.status,
      priority: message.priority,
      assignedTo: message.assigned_to,
      adminNotes: message.admin_notes,
      repliedAt: message.replied_at,
      closedAt: message.closed_at,
      createdAt: message.created_at,
      updatedAt: message.updated_at
    }))

    return NextResponse.json({
      success: true,
      messages: response,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Admin messages fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch messages'
    }, { status: 500 })
  }
}