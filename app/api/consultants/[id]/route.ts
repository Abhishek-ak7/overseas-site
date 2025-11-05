import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

const updateConsultantSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').optional(),
  timeZone: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/consultants/[id] - Get single consultant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const consultant = await prisma.consultants.findUnique({
      where: { id: params.id }
    })

    if (!consultant) {
      return NextResponse.json(
        { success: false, error: 'Consultant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      consultant: {
        id: consultant.id,
        name: consultant.name,
        email: consultant.email,
        phone: consultant.phone,
        bio: consultant.bio,
        specialties: consultant.specialties,
        experience: consultant.experience,
        education: consultant.education,
        certifications: consultant.certifications,
        languages: consultant.languages,
        hourlyRate: Number(consultant.hourly_rate),
        currency: consultant.currency,
        avatarUrl: consultant.avatar_url,
        isActive: consultant.is_active,
        rating: consultant.rating,
        totalReviews: consultant.total_reviews,
        availability: consultant.availability,
        timeZone: consultant.time_zone,
        createdAt: consultant.created_at,
        updatedAt: consultant.updated_at
      }
    })
  } catch (error) {
    console.error('Get consultant error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/consultants/[id] - Update consultant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const validatedData = updateConsultantSchema.parse(body)

    // Check if consultant exists
    const existingConsultant = await prisma.consultants.findUnique({
      where: { id: params.id }
    })

    if (!existingConsultant) {
      return NextResponse.json(
        { success: false, error: 'Consultant not found' },
        { status: 404 }
      )
    }

    // Check if email already exists for another consultant
    if (validatedData.email && validatedData.email !== existingConsultant.email) {
      const emailExists = await prisma.consultants.findFirst({
        where: {
          email: validatedData.email,
          id: { not: params.id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Consultant with this email already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {
      updated_at: new Date()
    }

    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.email) updateData.email = validatedData.email
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio
    if (validatedData.specialties) updateData.specialties = validatedData.specialties
    if (validatedData.experience !== undefined) updateData.experience = validatedData.experience
    if (validatedData.education !== undefined) updateData.education = validatedData.education
    if (validatedData.certifications) updateData.certifications = validatedData.certifications
    if (validatedData.languages) updateData.languages = validatedData.languages
    if (validatedData.hourlyRate !== undefined) updateData.hourly_rate = validatedData.hourlyRate
    if (validatedData.timeZone) updateData.time_zone = validatedData.timeZone
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive

    const consultant = await prisma.consultants.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      consultant: {
        id: consultant.id,
        name: consultant.name,
        email: consultant.email,
        phone: consultant.phone,
        bio: consultant.bio,
        specialties: consultant.specialties,
        experience: consultant.experience,
        education: consultant.education,
        certifications: consultant.certifications,
        languages: consultant.languages,
        hourlyRate: Number(consultant.hourly_rate),
        currency: consultant.currency,
        avatarUrl: consultant.avatar_url,
        isActive: consultant.is_active,
        rating: consultant.rating,
        totalReviews: consultant.total_reviews,
        availability: consultant.availability,
        timeZone: consultant.time_zone
      },
      message: 'Consultant updated successfully'
    })
  } catch (error) {
    console.error('Update consultant error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/consultants/[id] - Delete consultant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    // Check if consultant exists
    const existingConsultant = await prisma.consultants.findUnique({
      where: { id: params.id }
    })

    if (!existingConsultant) {
      return NextResponse.json(
        { success: false, error: 'Consultant not found' },
        { status: 404 }
      )
    }

    // Check if there are any appointments with this consultant
    const appointmentsCount = await prisma.appointments.count({
      where: { consultant_id: params.id }
    })

    if (appointmentsCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete consultant that has associated appointments. Consider deactivating them instead.' },
        { status: 400 }
      )
    }

    await prisma.consultants.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Consultant deleted successfully'
    })
  } catch (error) {
    console.error('Delete consultant error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}