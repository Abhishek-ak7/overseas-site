import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const universityId = searchParams.get('universityId')

    const where = universityId ? { university_id: universityId } : {}

    const [programs, totalCount, publishedCount] = await Promise.all([
      prisma.programs.findMany({
        where,
        include: {
          university: {
            select: {
              id: true,
              name: true,
              country: true,
              city: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.programs.count({ where }),
      prisma.programs.count({
        where: { ...where, is_published: true }
      })
    ])

    const stats = {
      total: totalCount,
      published: publishedCount,
      disciplines: new Set(programs.map(p => p.discipline)).size,
      degrees: new Set(programs.map(p => p.degree_type)).size
    }

    return NextResponse.json({
      programs,
      stats
    })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Generate slug from name if not provided
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const program = await prisma.programs.create({
      data: {
        university_id: body.university_id,
        name: body.name,
        slug,
        degree_type: body.degree_type,
        discipline: body.discipline,
        specialization: body.specialization,
        duration_years: body.duration_years ? parseFloat(body.duration_years) : null,
        duration_months: body.duration_months ? parseInt(body.duration_months) : null,
        intake_months: body.intake_months || [],
        featured_image: body.featured_image,
        images: body.images || [],
        description: body.description,
        overview: body.overview,
        curriculum: body.curriculum,
        career_opportunities: body.career_opportunities,
        tuition_fee: body.tuition_fee,
        application_fee: body.application_fee,
        currency: body.currency || 'USD',
        scholarship_available: body.scholarship_available || false,
        scholarship_details: body.scholarship_details,
        hostel_available: body.hostel_available || false,
        hostel_fee: body.hostel_fee,
        living_cost_min: body.living_cost_min,
        living_cost_max: body.living_cost_max,
        total_seats: body.total_seats ? parseInt(body.total_seats) : null,
        international_seats: body.international_seats ? parseInt(body.international_seats) : null,
        language_requirement: body.language_requirement,
        min_gpa: body.min_gpa ? parseFloat(body.min_gpa) : null,
        entrance_exam: body.entrance_exam,
        work_permit: body.work_permit || false,
        pr_pathway: body.pr_pathway || false,
        internship_included: body.internship_included || false,
        online_available: body.online_available || false,
        requirements: body.requirements,
        documents_needed: body.documents_needed || [],
        job_prospects: body.job_prospects || [],
        average_salary: body.average_salary,
        tags: body.tags || [],
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        is_featured: body.is_featured || false,
        is_published: body.is_published || false,
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

    return NextResponse.json({ program }, { status: 201 })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 })
  }
}
