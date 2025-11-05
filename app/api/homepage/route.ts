import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    
    let data: any = {}

    // Get homepage content sections
    switch (section) {
      case 'hero':
        data = await prisma.hero_slides.findMany({
          where: { is_active: true },
          orderBy: { order_index: 'asc' },
          take: 5
        })
        break

      case 'features':
        data = await prisma.features.findMany({
          where: { is_active: true },
          orderBy: [
            { is_featured: 'desc' },
            { order_index: 'asc' }
          ],
          take: 6
        })
        break

      case 'services':
        data = await prisma.services.findMany({
          where: { is_active: true },
          orderBy: [
            { is_featured: 'desc' },
            { order_index: 'asc' }
          ],
          take: 8
        })
        break

      case 'testimonials':
        data = await prisma.testimonials.findMany({
          where: { 
            is_published: true,
            is_featured: true 
          },
          orderBy: { position: 'asc' },
          take: 6
        })
        break

      case 'statistics':
        data = await prisma.statistics.findMany({
          where: { is_active: true },
          orderBy: { order_index: 'asc' },
          take: 4
        })
        break

      case 'partners':
        data = await prisma.partners.findMany({
          where: { 
            is_active: true,
            is_featured: true 
          },
          orderBy: { order_index: 'asc' },
          take: 12
        })
        break

      case 'countries':
        data = await prisma.countries.findMany({
          where: { 
            is_active: true,
            is_popular: true 
          },
          orderBy: { name: 'asc' },
          take: 8,
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            flag_url: true,
            is_popular: true
          }
        })
        break

      case 'blog-posts':
        data = await prisma.blog_posts.findMany({
          where: { 
            status: 'PUBLISHED',
          },
          orderBy: { published_at: 'desc' },
          take: 3,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featured_image: true,
            published_at: true,
            author_name: true,
            view_count: true,
            read_time: true
          }
        })
        break

      case 'journey-steps':
        data = await prisma.journey_steps.findMany({
          where: { is_active: true },
          orderBy: { order_index: 'asc' },
          take: 6
        })
        break

      default:
        // Return overview of all sections
        const [
          heroSlides,
          features,
          services,
          testimonials,
          statistics,
          partners,
          countries,
          blogPosts,
          journeySteps
        ] = await Promise.all([
          prisma.hero_slides.count({ where: { is_active: true } }),
          prisma.features.count({ where: { is_active: true } }),
          prisma.services.count({ where: { is_active: true } }),
          prisma.testimonials.count({ where: { is_published: true } }),
          prisma.statistics.count({ where: { is_active: true } }),
          prisma.partners.count({ where: { is_active: true } }),
          prisma.countries.count({ where: { is_active: true } }),
          prisma.blog_posts.count({ where: { status: 'PUBLISHED' } }),
          prisma.journey_steps.count({ where: { is_active: true } })
        ])

        data = {
          overview: {
            heroSlides,
            features,
            services,
            testimonials,
            statistics,
            partners,
            countries,
            blogPosts,
            journeySteps
          }
        }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Homepage content error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage content' },
      { status: 500 }
    )
  }
}