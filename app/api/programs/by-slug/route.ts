import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const universitySlug = searchParams.get('university')
    const programSlug = searchParams.get('program')

    if (!universitySlug || !programSlug) {
      return NextResponse.json(
        { error: 'University and program slugs are required' },
        { status: 400 }
      )
    }

    // Find the university first
    const university = await prisma.universities.findUnique({
      where: { slug: universitySlug },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        city: true,
        logo_url: true,
        banner_url: true,
        website: true,
        email: true,
        phone: true
      }
    })

    if (!university) {
      return NextResponse.json(
        { error: 'University not found' },
        { status: 404 }
      )
    }

    // Find the program
    const program = await prisma.programs.findFirst({
      where: {
        slug: programSlug,
        university_id: university.id,
        is_published: true
      }
    })

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    // Get related programs from the same university or discipline
    const relatedPrograms = await prisma.programs.findMany({
      where: {
        OR: [
          {
            university_id: university.id,
            id: { not: program.id },
            is_published: true
          },
          {
            discipline: program.discipline,
            id: { not: program.id },
            is_published: true
          }
        ]
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            city: true
          }
        }
      },
      take: 6,
      orderBy: {
        is_featured: 'desc'
      }
    })

    return NextResponse.json({
      program: {
        ...program,
        university
      },
      relatedPrograms
    })
  } catch (error) {
    console.error('Error fetching program by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    )
  }
}
