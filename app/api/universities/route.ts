import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Multiple filters
    const countries = searchParams.get('countries')?.split(',').filter(Boolean)
    const state = searchParams.get('state')
    const type = searchParams.get('type')
    const discipline = searchParams.get('discipline')
    const degree = searchParams.get('degree')
    const intake = searchParams.get('intake')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const minTuition = searchParams.get('minTuition')
    const maxTuition = searchParams.get('maxTuition')
    const sortBy = searchParams.get('sortBy') || 'ranking'

    const where: any = {
      is_published: true
    }

    // Country filter (multiple)
    if (countries && countries.length > 0) {
      where.country = { in: countries }
    }

    // State/Province filter
    if (state && state !== 'all') {
      where.state = state
    }

    // University type
    if (type && type !== 'all') {
      where.type = type
    }

    // Featured
    if (featured === 'true') {
      where.is_featured = true
    }

    // Search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Tuition fee range
    if (minTuition || maxTuition) {
      where.avg_tuition_fee = {}
      if (minTuition) where.avg_tuition_fee.gte = parseFloat(minTuition)
      if (maxTuition) where.avg_tuition_fee.lte = parseFloat(maxTuition)
    }

    // Programs filters (discipline, degree, intake)
    let programsWhere: any = { is_published: true }

    if (discipline && discipline !== 'all') {
      programsWhere.discipline = { contains: discipline, mode: 'insensitive' }
    }

    if (degree && degree !== 'all') {
      programsWhere.degree_type = degree
    }

    if (intake && intake !== 'all') {
      programsWhere.intake_months = { has: intake }
    }

    // If program filters are applied, only show universities with matching programs
    if (discipline || degree || intake) {
      where.programs = {
        some: programsWhere
      }
    }

    const includePrograms = {
      programs: {
        where: programsWhere,
        select: {
          id: true,
          name: true,
          discipline: true,
          degree_type: true,
          tuition_fee: true,
          duration_years: true,
          duration_months: true,
          intake_months: true,
          slug: true
        },
        take: 3,
        orderBy: { is_featured: 'desc' as const }
      }
    }

    // Dynamic sorting
    let orderBy: any[] = [{ is_featured: 'desc' }]

    switch (sortBy) {
      case 'name':
        orderBy.push({ name: 'asc' })
        break
      case 'students':
        orderBy.push({ student_count: 'desc' })
        break
      case 'programs':
        // This will need a subquery, for now use name
        orderBy.push({ name: 'asc' })
        break
      case 'tuition':
        orderBy.push({ avg_tuition_fee: 'asc' })
        break
      case 'ranking':
      default:
        orderBy.push({ ranking_world: 'asc' })
        orderBy.push({ ranking_national: 'asc' })
        orderBy.push({ name: 'asc' })
        break
    }

    const [universities, total, filterOptions] = await Promise.all([
      prisma.universities.findMany({
        where,
        include: {
          ...includePrograms,
          _count: {
            select: {
              programs: {
                where: { is_published: true }
              }
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.universities.count({ where }),
      // Get filter options
      Promise.all([
        // Countries
        prisma.universities.groupBy({
          by: ['country'],
          where: { is_published: true },
          _count: true,
          orderBy: { country: 'asc' }
        }),
        // States (for selected countries)
        countries && countries.length > 0
          ? prisma.universities.groupBy({
              by: ['state'],
              where: {
                is_published: true,
                country: { in: countries },
                state: { not: null }
              },
              _count: true,
              orderBy: { state: 'asc' }
            })
          : Promise.resolve([]),
        // Disciplines from programs
        prisma.programs.groupBy({
          by: ['discipline'],
          where: {
            is_published: true
          },
          _count: true,
          orderBy: { discipline: 'asc' }
        }),
        // Degree types
        prisma.programs.groupBy({
          by: ['degree_type'],
          where: { is_published: true },
          _count: true,
          orderBy: { degree_type: 'asc' }
        }),
        // Intake months
        prisma.programs.findMany({
          where: { is_published: true },
          select: { intake_months: true },
          distinct: ['intake_months']
        }),
        // Featured count
        prisma.universities.count({ where: { is_published: true, is_featured: true } })
      ])
    ])

    const [countriesData, statesData, disciplinesData, degreesData, intakesData, featuredCount] = filterOptions

    // Flatten intake months
    const allIntakes = new Set<string>()
    intakesData.forEach(p => {
      if (p.intake_months) {
        p.intake_months.forEach(month => allIntakes.add(month))
      }
    })

    return NextResponse.json({
      universities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total,
        countries: countriesData.length,
        featured: featuredCount
      },
      filters: {
        countries: countriesData.map(c => c.country).filter(Boolean),
        states: statesData.map(s => s.state).filter(Boolean),
        disciplines: disciplinesData.map(d => d.discipline).filter(Boolean),
        degrees: degreesData.map(d => d.degree_type).filter(Boolean),
        intakes: Array.from(allIntakes).sort()
      }
    })
  } catch (error) {
    console.error('Universities API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch universities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const university = await prisma.universities.create({
      data: {
        name: body.name,
        country: body.country,
        city: body.city,
        ranking: body.ranking,
        world_ranking: body.worldRanking,
        type: body.type,
        established_year: body.establishedYear,
        logo_url: body.logoUrl,
        image_url: body.imageUrl,
        website: body.website,
        description: body.description,
        programs: body.programs,
        tuition_range: body.tuitionRange,
        living_cost_range: body.livingCostRange,
        admission_requirements: body.admissionRequirements,
        intakes: body.intakes,
        scholarships: body.scholarships,
        features: body.features,
        application_deadlines: body.applicationDeadlines,
        contact_info: body.contactInfo,
        is_active: body.isActive ?? true,
        is_featured: body.isFeatured ?? false
      }
    })

    return NextResponse.json({ university })
  } catch (error) {
    console.error('University creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create university' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const university = await prisma.universities.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ university })
  } catch (error) {
    console.error('University update error:', error)
    return NextResponse.json(
      { error: 'Failed to update university' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'University ID is required' },
        { status: 400 }
      )
    }
    
    await prisma.universities.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('University deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete university' },
      { status: 500 }
    )
  }
}