import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const viewSchema = z.object({
  slug: z.string().min(1)
})

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const validatedParams = viewSchema.parse(params)

    // Increment view count for the blog post
    const updatedPost = await prisma.blog_posts.updateMany({
      where: {
        slug: validatedParams.slug,
        status: 'PUBLISHED'
      },
      data: {
        view_count: {
          increment: 1
        },
        updated_at: new Date()
      }
    })

    if (updatedPost.count === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'View tracked successfully'
    })

  } catch (error) {
    console.error('View tracking error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}