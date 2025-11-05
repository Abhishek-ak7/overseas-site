import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const program = await prisma.programs.findUnique({
      where: { slug: params.slug },
      include: {
        university: true
      }
    })

    if (!program || !program.is_published) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.programs.update({
      where: { id: program.id },
      data: { view_count: { increment: 1 } }
    })

    // Get related programs (same discipline or same university)
    const relatedPrograms = await prisma.programs.findMany({
      where: {
        OR: [
          { discipline: program.discipline },
          { university_id: program.university_id }
        ],
        id: { not: program.id },
        is_published: true
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            city: true,
            logo_url: true
          }
        }
      },
      take: 6,
      orderBy: { view_count: 'desc' }
    })

    return NextResponse.json({
      program,
      relatedPrograms
    })
  } catch (error) {
    console.error('Error fetching program:', error)
    return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 })
  }
}
