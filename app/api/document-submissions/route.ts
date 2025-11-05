import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const [submissions, total] = await Promise.all([
      prisma.document_submissions.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.document_submissions.count({ where })
    ])

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Document submissions API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document submissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const submission = await prisma.document_submissions.create({
      data: {
        student_name: body.studentName,
        email: body.email,
        phone: body.phone,
        country: body.country,
        study_level: body.studyLevel,
        field_of_interest: body.fieldOfInterest,
        target_countries: body.targetCountries,
        status: body.status || 'draft',
        completion_percentage: body.completionPercentage || 0,
        categories: body.categories,
        assigned_reviewer: body.assignedReviewer,
        review_notes: body.reviewNotes
      }
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Document submission creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create document submission' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const submission = await prisma.document_submissions.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Document submission update error:', error)
    return NextResponse.json(
      { error: 'Failed to update document submission' },
      { status: 500 }
    )
  }
}