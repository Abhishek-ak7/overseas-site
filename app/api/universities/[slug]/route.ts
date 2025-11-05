import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const university = await prisma.universities.findUnique({
      where: { slug: params.slug },
      include: {
        programs: {
          where: { is_published: true },
          orderBy: [
            { is_featured: 'desc' },
            { name: 'asc' }
          ]
        }
      }
    })

    if (!university || !university.is_published) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.universities.update({
      where: { id: university.id },
      data: { view_count: { increment: 1 } }
    })

    return NextResponse.json({ university })
  } catch (error) {
    console.error('Error fetching university:', error)
    return NextResponse.json({ error: 'Failed to fetch university' }, { status: 500 })
  }
}
