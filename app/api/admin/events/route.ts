import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET - List all events with stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // all, published, draft
    const eventType = searchParams.get('eventType') || 'all'
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status === 'published') {
      where.is_published = true
    } else if (status === 'draft') {
      where.is_published = false
    }

    if (eventType !== 'all') {
      where.event_type = eventType
    }

    const [events, total] = await Promise.all([
      prisma.events.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.events.count({ where }),
    ])

    // Get stats
    const stats = await prisma.events.aggregate({
      _count: { id: true },
      _sum: {
        view_count: true,
        attendee_count: true,
      },
    })

    const publishedCount = await prisma.events.count({
      where: { is_published: true },
    })

    const upcomingCount = await prisma.events.count({
      where: {
        is_published: true,
        start_date: { gte: new Date() },
      },
    })

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: stats._count.id,
        published: publishedCount,
        upcoming: upcomingCount,
        totalViews: stats._sum.view_count || 0,
        totalAttendees: stats._sum.attendee_count || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      console.error('Auth failed:', { session, role: session?.user?.role })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Creating event with data:', { title: body.title, slug: body.slug })
    console.log('Prisma object:', typeof prisma, prisma ? 'defined' : 'undefined')

    // Generate slug from title if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    console.log('About to check existing slug:', slug)

    // Check if slug already exists
    const existing = await prisma.events.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An event with this slug already exists' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.title || !body.start_date) {
      return NextResponse.json(
        { error: 'Title and start date are required' },
        { status: 400 }
      )
    }

    const event = await prisma.events.create({
      data: {
        title: body.title,
        slug,
        content: body.content || '',
        excerpt: body.excerpt,
        featured_image: body.featured_image,
        images: body.images || [],
        event_type: body.event_type,

        // Location details
        venue: body.venue,
        address: body.address,
        city: body.city,
        country: body.country,
        is_online: body.is_online || false,
        meeting_link: body.meeting_link,

        // Date & Time
        start_date: new Date(body.start_date),
        end_date: body.end_date ? new Date(body.end_date) : null,
        registration_deadline: body.registration_deadline
          ? new Date(body.registration_deadline)
          : null,

        // Registration
        is_free: body.is_free !== undefined ? body.is_free : true,
        price: body.price,
        currency: body.currency || 'USD',
        max_attendees: body.max_attendees,
        registration_link: body.registration_link,

        // Organizer
        organizer_name: body.organizer_name,
        organizer_email: body.organizer_email,
        organizer_phone: body.organizer_phone,

        // SEO
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        tags: body.tags || [],

        // Status
        is_published: body.is_published || false,
        is_featured: body.is_featured || false,

        author_id: session.user.id,
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
