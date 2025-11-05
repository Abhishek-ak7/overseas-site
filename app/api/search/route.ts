import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        message: 'Search query must be at least 2 characters',
      }, { status: 400 });
    }

    const searchTerm = query.trim();

    // Search in blog posts
    const blogPosts = await prisma.blog_posts.findMany({
      where: {
        AND: [
          { status: 'PUBLISHED' },
          {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { content: { contains: searchTerm, mode: 'insensitive' } },
              { excerpt: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        published_at: true,
        author_name: true,
        read_time: true,
      },
      orderBy: { published_at: 'desc' },
      take: limit,
    });

    // Search in pages
    const pages = await prisma.pages.findMany({
      where: {
        AND: [
          { is_published: true },
          {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { content: { contains: searchTerm, mode: 'insensitive' } },
              { excerpt: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        published_at: true,
      },
      orderBy: { updated_at: 'desc' },
      take: limit,
    });

    // Transform results
    const blogResults = blogPosts.map((post) => ({
      id: post.id,
      type: 'blog',
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      image: post.featured_image,
      date: post.published_at,
      author: post.author_name,
      readTime: post.read_time,
      url: `/blog/${post.slug}`,
    }));

    const pageResults = pages.map((page) => ({
      id: page.id,
      type: 'page',
      title: page.title,
      slug: page.slug,
      excerpt: page.excerpt || '',
      image: page.featured_image,
      date: page.published_at,
      url: `/${page.slug}`,
    }));

    // Combine and sort by date
    const allResults = [...blogResults, ...pageResults].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      query: searchTerm,
      results: allResults.slice(0, limit),
      total: allResults.length,
      counts: {
        blogs: blogResults.length,
        pages: pageResults.length,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to perform search' },
      { status: 500 }
    );
  }
}