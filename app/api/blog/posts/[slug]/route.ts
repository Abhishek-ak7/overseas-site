import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const blogSlugSchema = z.object({
  slug: z.string().min(1)
})

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const validatedParams = blogSlugSchema.parse(params)

    // Get the blog post by slug - only published posts for public access
    const post = await prisma.blog_posts.findFirst({
      where: {
        slug: validatedParams.slug,
        status: 'PUBLISHED'
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            user_profiles: {
              select: {
                bio: true,
                avatar_url: true
              }
            }
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Get related posts from the same category
    const relatedPosts = await prisma.blog_posts.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: post.id },
        ...(post.category_id && {
          category_id: post.category_id
        })
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        published_at: true,
        read_time: true
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 3
    })

    // Transform the post data
    const transformedPost = {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      slug: post.slug,
      featuredImage: post.featured_image,
      author: {
        id: post.users.id,
        name: `${post.users.first_name} ${post.users.last_name}`,
        email: post.users.email,
        avatar: post.users.user_profiles?.avatar_url,
        bio: post.users.user_profiles?.bio
      },
      category: post.categories ? {
        id: post.categories.id,
        name: post.categories.name,
        slug: post.categories.slug
      } : { id: '', name: 'Uncategorized', slug: 'uncategorized' },
      tags: post.tags?.map(tag => tag.name) || [],
      publishedAt: post.published_at?.toISOString() || post.created_at.toISOString(),
      updatedAt: post.updated_at.toISOString(),
      readTime: post.read_time || Math.ceil((post.content?.length || 0) / 1000) + 1,
      views: post.view_count || 0,
      likes: 0, // No likes system in current schema
      comments: 0, // No comments system in current schema
      metaTitle: post.seo_title,
      metaDescription: post.seo_description
    }

    // Transform related posts
    const transformedRelatedPosts = relatedPosts.map(relatedPost => ({
      id: relatedPost.id,
      title: relatedPost.title,
      slug: relatedPost.slug,
      excerpt: relatedPost.excerpt || '',
      featuredImage: relatedPost.featured_image,
      publishedAt: relatedPost.published_at?.toISOString() || '',
      readTime: relatedPost.read_time || 1
    }))

    return NextResponse.json({
      post: transformedPost,
      relatedPosts: transformedRelatedPosts
    })

  } catch (error) {
    console.error('Blog post fetch error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid slug parameter', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}