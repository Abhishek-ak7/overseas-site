import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const countries = searchParams.get('countries')?.split(',').filter(Boolean)
    const universityId = searchParams.get('universityId')
    const discipline = searchParams.get('discipline')
    const degreeType = searchParams.get('degreeType')
    const intake = searchParams.get('intake')
    const minTuition = searchParams.get('minTuition')
    const maxTuition = searchParams.get('maxTuition')
    const search = searchParams.get('search')
    const workPermit = searchParams.get('workPermit')
    const prPathway = searchParams.get('prPathway')
    const internship = searchParams.get('internship')
    const scholarship = searchParams.get('scholarship')
    const online = searchParams.get('online')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const where: any = {
      is_published: true
    }

    // Multiple countries filter
    if (countries && countries.length > 0) {
      where.university = { country: { in: countries } }
    }

    if (universityId) {
      where.university_id = universityId
    }

    if (discipline && discipline !== 'all') {
      where.discipline = { contains: discipline, mode: 'insensitive' }
    }

    if (degreeType && degreeType !== 'all') {
      where.degree_type = degreeType
    }

    // Intake filter
    if (intake && intake !== 'all') {
      where.intake_months = { has: intake }
    }

    // Tuition fee range
    if (minTuition || maxTuition) {
      where.tuition_fee = {}
      if (minTuition) where.tuition_fee.gte = parseFloat(minTuition)
      if (maxTuition) where.tuition_fee.lte = parseFloat(maxTuition)
    }

    // Boolean filters
    if (workPermit === 'true') {
      where.work_permit = true
    }

    if (prPathway === 'true') {
      where.pr_pathway = true
    }

    if (internship === 'true') {
      where.internship_included = true
    }

    if (scholarship === 'true') {
      where.scholarship_available = true
    }

    if (online === 'true') {
      where.online_available = true
    }

    if (featured === 'true') {
      where.is_featured = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { discipline: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [programs, totalCount, filterOptions] = await Promise.all([
      prisma.programs.findMany({
        where,
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
        orderBy: [
          { is_featured: 'desc' },
          { created_at: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.programs.count({ where }),
      // Get filter options
      Promise.all([
        // Countries from universities
        prisma.universities.groupBy({
          by: ['country'],
          where: { is_published: true },
          _count: true,
          orderBy: { country: 'asc' }
        }),
        // Disciplines
        prisma.programs.groupBy({
          by: ['discipline'],
          where: { is_published: true },
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
        // Stats
        prisma.programs.count({ where: { is_published: true, work_permit: true } }),
        prisma.programs.count({ where: { is_published: true, pr_pathway: true } }),
        prisma.programs.count({ where: { is_published: true, scholarship_available: true } }),
        prisma.programs.count({ where: { is_published: true, is_featured: true } })
      ])
    ])

    const [countriesData, disciplinesData, degreeTypesData, intakesData, workPermitCount, prPathwayCount, scholarshipCount, featuredCount] = filterOptions

    // Flatten intake months
    const allIntakes = new Set<string>()
    intakesData.forEach(p => {
      if (p.intake_months) {
        p.intake_months.forEach(month => allIntakes.add(month))
      }
    })

    const filters = {
      countries: countriesData.map(c => c.country).filter(Boolean),
      disciplines: disciplinesData.map(d => d.discipline).filter(Boolean),
      degreeTypes: degreeTypesData.map(d => d.degree_type).filter(Boolean),
      intakes: Array.from(allIntakes).sort()
    }

    const stats = {
      total: totalCount,
      workPermit: workPermitCount,
      prPathway: prPathwayCount,
      scholarship: scholarshipCount,
      featured: featuredCount
    }

    return NextResponse.json({
      programs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats,
      filters
    })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}
