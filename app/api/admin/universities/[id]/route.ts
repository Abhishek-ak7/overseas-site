import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const university = await prisma.universities.findUnique({
      where: { id: params.id },
      include: {
        programs: {
          orderBy: { created_at: 'desc' }
        },
        _count: {
          select: { programs: true }
        }
      }
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    return NextResponse.json({ university })
  } catch (error) {
    console.error('Error fetching university:', error)
    return NextResponse.json({ error: 'Failed to fetch university' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Generate slug if name changed and no slug provided
    let slug = body.slug
    if (!slug && body.name) {
      slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    const university = await prisma.universities.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug,
        country: body.country,
        city: body.city,
        state: body.state,
        address: body.address,
        postal_code: body.postal_code,
        logo_url: body.logo_url,
        banner_url: body.banner_url,
        images: body.images,
        website: body.website,
        email: body.email,
        phone: body.phone,
        description: body.description,
        about: body.about,
        facilities: body.facilities,
        type: body.type,
        established_year: body.established_year ? parseInt(body.established_year) : null,
        accreditation: body.accreditation,
        ranking_national: body.ranking_national ? parseInt(body.ranking_national) : null,
        ranking_world: body.ranking_world ? parseInt(body.ranking_world) : null,
        student_count: body.student_count ? parseInt(body.student_count) : null,
        international_students: body.international_students ? parseInt(body.international_students) : null,
        acceptance_rate: body.acceptance_rate ? parseFloat(body.acceptance_rate) : null,
        avg_tuition_fee: body.avg_tuition_fee,
        currency: body.currency,
        campus_size: body.campus_size,
        departments: body.departments,
        notable_alumni: body.notable_alumni,
        partnerships: body.partnerships,
        admission_requirements: body.admission_requirements,
        application_deadline: body.application_deadline,
        language_requirement: body.language_requirement,
        tags: body.tags,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        is_featured: body.is_featured,
        is_published: body.is_published,
      },
      include: {
        _count: {
          select: { programs: true }
        }
      }
    })

    return NextResponse.json({ university })
  } catch (error) {
    console.error('Error updating university:', error)
    return NextResponse.json({ error: 'Failed to update university' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First delete all associated programs
    await prisma.programs.deleteMany({
      where: { university_id: params.id }
    })

    // Then delete the university
    await prisma.universities.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'University deleted successfully' })
  } catch (error) {
    console.error('Error deleting university:', error)
    return NextResponse.json({ error: 'Failed to delete university' }, { status: 500 })
  }
}
