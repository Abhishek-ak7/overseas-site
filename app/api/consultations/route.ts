import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const consultations = await prisma.consultation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.consultation.count({ where })

    return NextResponse.json({
      consultations,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })
  } catch (error) {
    console.error('Consultation fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consultations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'type']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    const consultation = await prisma.consultation.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country || null,
        studyLevel: data.studyLevel || null,
        fieldOfInterest: data.fieldOfInterest || null,
        budget: data.budget || null,
        consultationType: data.type,
        consultationDate: new Date(`${data.date.split('T')[0]}T${data.time}:00`),
        message: data.message || null,
        status: 'pending',
        preferredLanguage: data.preferredLanguage || 'english',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Send confirmation email (you can implement this later)
    // await sendConsultationConfirmationEmail(consultation)

    return NextResponse.json({
      success: true,
      consultation,
      message: 'Consultation booked successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Consultation creation error:', error)
    return NextResponse.json(
      { error: 'Failed to book consultation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      )
    }

    const data = await request.json()
    
    const consultation = await prisma.consultation.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      consultation,
      message: 'Consultation updated successfully'
    })

  } catch (error) {
    console.error('Consultation update error:', error)
    return NextResponse.json(
      { error: 'Failed to update consultation' },
      { status: 500 }
    )
  }
}