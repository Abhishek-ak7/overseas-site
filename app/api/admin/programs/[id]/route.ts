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

    const program = await prisma.programs.findUnique({
      where: { id: params.id },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            country: true,
            city: true
          }
        }
      }
    })

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    return NextResponse.json({ program })
  } catch (error) {
    console.error('Error fetching program:', error)
    return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 })
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

    const program = await prisma.programs.update({
      where: { id: params.id },
      data: {
        university_id: body.university_id,
        name: body.name,
        slug,
        degree_type: body.degree_type,
        discipline: body.discipline,
        specialization: body.specialization,
        duration_years: body.duration_years ? parseFloat(body.duration_years) : null,
        duration_months: body.duration_months ? parseInt(body.duration_months) : null,
        intake_months: body.intake_months,
        featured_image: body.featured_image,
        images: body.images,
        description: body.description,
        overview: body.overview,
        curriculum: body.curriculum,
        career_opportunities: body.career_opportunities,
        tuition_fee: body.tuition_fee,
        application_fee: body.application_fee,
        currency: body.currency,
        scholarship_available: body.scholarship_available,
        scholarship_details: body.scholarship_details,
        hostel_available: body.hostel_available,
        hostel_fee: body.hostel_fee,
        living_cost_min: body.living_cost_min,
        living_cost_max: body.living_cost_max,
        total_seats: body.total_seats ? parseInt(body.total_seats) : null,
        international_seats: body.international_seats ? parseInt(body.international_seats) : null,
        language_requirement: body.language_requirement,
        min_gpa: body.min_gpa ? parseFloat(body.min_gpa) : null,
        entrance_exam: body.entrance_exam,
        work_permit: body.work_permit,
        pr_pathway: body.pr_pathway,
        internship_included: body.internship_included,
        online_available: body.online_available,
        requirements: body.requirements,
        documents_needed: body.documents_needed,
        job_prospects: body.job_prospects,
        average_salary: body.average_salary,
        tags: body.tags,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        is_featured: body.is_featured,
        is_published: body.is_published,
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            country: true,
            city: true
          }
        }
      }
    })

    return NextResponse.json({ program })
  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json({ error: 'Failed to update program' }, { status: 500 })
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

    await prisma.programs.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Program deleted successfully' })
  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 })
  }
}
