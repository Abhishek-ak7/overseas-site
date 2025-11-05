import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const event = await prisma.events.findUnique({
      where: {
        slug: params.slug,
        is_published: true,
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

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.events.update({
      where: { id: event.id },
      data: { view_count: { increment: 1 } },
    })

    // Get related events (same type or same country)
    const relatedEvents = await prisma.events.findMany({
      where: {
        is_published: true,
        id: { not: event.id },
        OR: [
          { event_type: event.event_type },
          { country: event.country },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        event_type: true,
        start_date: true,
        city: true,
        country: true,
        is_online: true,
        is_free: true,
      },
      take: 4,
      orderBy: { start_date: 'asc' },
    })

    return NextResponse.json({
      event,
      relatedEvents,
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
