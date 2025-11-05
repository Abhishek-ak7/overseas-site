import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pages - Get published pages (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (slug) {
      // Get specific page by slug
      const page = await prisma.pages.findUnique({
        where: {
          slug: slug,
          is_published: true
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
          page_sections: {
            where: { is_active: true },
            orderBy: { order_index: 'asc' },
          },
        },
      })

      if (!page) {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ page })
    } else {
      // Get all published pages
      const pages = await prisma.pages.findMany({
        where: { is_published: true },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          published_at: true,
          updated_at: true,
          template: true,
        },
        orderBy: { published_at: 'desc' },
        take: limit,
      })

      return NextResponse.json({ pages })
    }
  } catch (error) {
    console.error('Get pages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}