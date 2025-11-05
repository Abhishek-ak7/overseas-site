import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const partnerUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url('Invalid URL format').optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  contactEmail: z.string().email('Invalid email format').optional(),
  contactPhone: z.string().optional(),
  establishedYear: z.number().optional(),
  studentCapacity: z.number().optional(),
  internationalStudents: z.number().optional(),
  worldRanking: z.number().optional(),
  nationalRanking: z.number().optional(),
  categoryRanking: z.number().optional(),
  accreditation: z.string().optional(),
  coursesOffered: z.array(z.string()).optional(),
  programTypes: z.array(z.string()).optional(),
  scholarshipsAvailable: z.boolean().optional(),
  accommodationProvided: z.boolean().optional(),
  partnershipStartDate: z.string().optional(),
  partnershipType: z.string().optional(),
  commissionRate: z.number().optional(),
  specialRequirements: z.string().optional(),
  applicationDeadlines: z.string().optional(),
  orderIndex: z.number().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPreferred: z.boolean().optional(),
  category: z.string().optional(),
})

// GET /api/partners/[id] - Get single partner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partner = await prisma.partners.findUnique({
      where: { id: params.id },
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ partner })
  } catch (error) {
    console.error('Partner fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    )
  }
}

// PUT /api/partners/[id] - Update partner (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = partnerUpdateSchema.parse(body)

    // Check if partner exists
    const existingPartner = await prisma.partners.findUnique({
      where: { id: params.id },
    })

    if (!existingPartner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date(),
    }

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.logo !== undefined) updateData.logo = validatedData.logo
    if (validatedData.website !== undefined) updateData.website = validatedData.website
    if (validatedData.country !== undefined) updateData.country = validatedData.country
    if (validatedData.state !== undefined) updateData.state = validatedData.state
    if (validatedData.city !== undefined) updateData.city = validatedData.city
    if (validatedData.address !== undefined) updateData.address = validatedData.address
    if (validatedData.contactEmail !== undefined) updateData.contact_email = validatedData.contactEmail
    if (validatedData.contactPhone !== undefined) updateData.contact_phone = validatedData.contactPhone
    if (validatedData.establishedYear !== undefined) updateData.established_year = validatedData.establishedYear
    if (validatedData.studentCapacity !== undefined) updateData.student_capacity = validatedData.studentCapacity
    if (validatedData.internationalStudents !== undefined) updateData.international_students = validatedData.internationalStudents
    if (validatedData.worldRanking !== undefined) updateData.world_ranking = validatedData.worldRanking
    if (validatedData.nationalRanking !== undefined) updateData.national_ranking = validatedData.nationalRanking
    if (validatedData.categoryRanking !== undefined) updateData.category_ranking = validatedData.categoryRanking
    if (validatedData.accreditation !== undefined) updateData.accreditation = validatedData.accreditation
    if (validatedData.coursesOffered !== undefined) updateData.courses_offered = validatedData.coursesOffered
    if (validatedData.programTypes !== undefined) updateData.program_types = validatedData.programTypes
    if (validatedData.scholarshipsAvailable !== undefined) updateData.scholarships_available = validatedData.scholarshipsAvailable
    if (validatedData.accommodationProvided !== undefined) updateData.accommodation_provided = validatedData.accommodationProvided
    if (validatedData.partnershipStartDate !== undefined) updateData.partnership_start_date = validatedData.partnershipStartDate
    if (validatedData.partnershipType !== undefined) updateData.partnership_type = validatedData.partnershipType
    if (validatedData.commissionRate !== undefined) updateData.commission_rate = validatedData.commissionRate
    if (validatedData.specialRequirements !== undefined) updateData.special_requirements = validatedData.specialRequirements
    if (validatedData.applicationDeadlines !== undefined) updateData.application_deadlines = validatedData.applicationDeadlines
    if (validatedData.orderIndex !== undefined) updateData.order_index = validatedData.orderIndex
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive
    if (validatedData.isFeatured !== undefined) updateData.is_featured = validatedData.isFeatured
    if (validatedData.isPreferred !== undefined) updateData.is_preferred = validatedData.isPreferred
    if (validatedData.category !== undefined) updateData.category = validatedData.category

    const partner = await prisma.partners.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      partner,
      message: 'Partner updated successfully'
    })

  } catch (error) {
    console.error('Partner update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    )
  }
}

// DELETE /api/partners/[id] - Delete partner (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if partner exists
    const existingPartner = await prisma.partners.findUnique({
      where: { id: params.id },
    })

    if (!existingPartner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    await prisma.partners.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Partner deleted successfully'
    })

  } catch (error) {
    console.error('Partner delete error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    )
  }
}