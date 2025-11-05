import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get categories with blog post counts
    const categories = await prisma.categories.findMany({
      where: {
        is_active: true,
        blog_posts: {
          some: {
            status: 'PUBLISHED'
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            blog_posts: {
              where: {
                status: 'PUBLISHED'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Transform data for frontend
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      postCount: category._count.blog_posts
    }))

    return NextResponse.json({
      categories: transformedCategories
    })

  } catch (error) {
    console.error('Blog categories fetch error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    )
  }
}