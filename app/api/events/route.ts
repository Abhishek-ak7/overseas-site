import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const eventType = searchParams.get('eventType') || ''
    const country = searchParams.get('country') || ''
    const city = searchParams.get('city') || ''
    const timeframe = searchParams.get('timeframe') || 'all' // all, upcoming, past
    const isFree = searchParams.get('isFree') // true, false, or null
    const isOnline = searchParams.get('isOnline') // true, false, or null
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      is_published: true,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (eventType) {
      where.event_type = eventType
    }

    if (country) {
      where.country = country
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    if (timeframe === 'upcoming') {
      // Show events that haven't ended yet - if end_date exists, check that, otherwise check start_date
      const now = new Date()
      where.AND = [
        {
          OR: [
            { end_date: { gte: now } }, // Events with end_date that haven't ended
            { AND: [{ end_date: null }, { start_date: { gte: now } }] } // Events without end_date that haven't started
          ]
        }
      ]
    } else if (timeframe === 'past') {
      const now = new Date()
      where.AND = [
        {
          OR: [
            { end_date: { lt: now } }, // Events with end_date that have ended
            { AND: [{ end_date: null }, { start_date: { lt: now } }] } // Events without end_date that have started
          ]
        }
      ]
    }

    if (isFree === 'true') {
      where.is_free = true
    } else if (isFree === 'false') {
      where.is_free = false
    }

    if (isOnline === 'true') {
      where.is_online = true
    } else if (isOnline === 'false') {
      where.is_online = false
    }

    const [events, total] = await Promise.all([
      prisma.events.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          event_type: true,
          start_date: true,
          end_date: true,
          venue: true,
          city: true,
          country: true,
          is_online: true,
          is_free: true,
          is_featured: true,
          price: true,
          currency: true,
          max_attendees: true,
          attendee_count: true,
          registration_deadline: true,
          view_count: true,
          created_at: true,
        },
        orderBy: [
          { is_featured: 'desc' },
          { start_date: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.events.count({ where }),
    ])

    // Get filter options
    const [eventTypes, countries, cities] = await Promise.all([
      prisma.events.groupBy({
        by: ['event_type'],
        where: { is_published: true, event_type: { not: null } },
        _count: true,
      }),
      prisma.events.groupBy({
        by: ['country'],
        where: { is_published: true, country: { not: null } },
        _count: true,
      }),
      prisma.events.groupBy({
        by: ['city'],
        where: { is_published: true, city: { not: null } },
        _count: true,
      }),
    ])

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        eventTypes: eventTypes
          .filter(t => t.event_type)
          .map(t => ({
            value: t.event_type,
            count: t._count,
          })),
        countries: countries
          .filter(c => c.country)
          .map(c => ({
            value: c.country,
            count: c._count,
          })),
        cities: cities
          .filter(c => c.city)
          .map(c => ({
            value: c.city,
            count: c._count,
          }))
          .slice(0, 20), // Limit cities to top 20
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
