import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  studyLevel: z.string().optional(),
  profile: z.object({
    bio: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    emergencyContact: z.string().optional(),
    interestedCountries: z.array(z.string()).optional(),
    fieldOfInterest: z.string().optional(),
    budgetRange: z.string().optional(),
    intakePreference: z.string().optional(),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const fullUser = await prisma.users.findUnique({
      where: { id: user.id },
      include: {
        user_profiles: true,
        course_enrollments: {
          include: {
            courses: true,
          },
        },
        test_attempts: {
          include: {
            tests: true,
          },
          orderBy: { started_at: 'desc' },
          take: 10,
        },
        appointments: {
          include: {
            consultants: true,
            appointment_types: true,
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    })

    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data
    const { password_hash, verification_token, reset_token, reset_token_expiry, ...userWithoutSensitiveData } = fullUser

    return NextResponse.json({ user: userWithoutSensitiveData }, { status: 200 })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Update user basic info
    const updateUserData: any = {}
    if (validatedData.firstName) updateUserData.first_name = validatedData.firstName
    if (validatedData.lastName) updateUserData.last_name = validatedData.lastName
    if (validatedData.phone) updateUserData.phone = validatedData.phone
    if (validatedData.country) updateUserData.country = validatedData.country
    if (validatedData.studyLevel) updateUserData.study_level = validatedData.studyLevel

    // Update user
    if (Object.keys(updateUserData).length > 0) {
      await prisma.users.update({
        where: { id: user.id },
        data: updateUserData,
      })
    }

    // Update profile
    if (validatedData.profile) {
      const profileData: any = {}

      if (validatedData.profile.bio !== undefined) profileData.bio = validatedData.profile.bio
      if (validatedData.profile.dateOfBirth) profileData.dateOfBirth = new Date(validatedData.profile.dateOfBirth)
      if (validatedData.profile.address !== undefined) profileData.address = validatedData.profile.address
      if (validatedData.profile.city !== undefined) profileData.city = validatedData.profile.city
      if (validatedData.profile.state !== undefined) profileData.state = validatedData.profile.state
      if (validatedData.profile.zipCode !== undefined) profileData.zipCode = validatedData.profile.zipCode
      if (validatedData.profile.emergencyContact !== undefined) profileData.emergencyContact = validatedData.profile.emergencyContact
      if (validatedData.profile.interestedCountries) profileData.interestedCountries = validatedData.profile.interestedCountries
      if (validatedData.profile.fieldOfInterest !== undefined) profileData.fieldOfInterest = validatedData.profile.fieldOfInterest
      if (validatedData.profile.budgetRange !== undefined) profileData.budgetRange = validatedData.profile.budgetRange
      if (validatedData.profile.intakePreference !== undefined) profileData.intakePreference = validatedData.profile.intakePreference

      if (Object.keys(profileData).length > 0) {
        await prisma.user_profiles.upsert({
          where: { user_id: user.id },
          update: profileData,
          create: {
            user_id: user.id,
            ...profileData,
          },
        })
      }
    }

    // Get updated user
    const updatedUser = await prisma.users.findUnique({
      where: { id: user.id },
      include: {
        user_profiles: true,
      },
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data
    const { password_hash, verification_token, reset_token, reset_token_expiry, ...userWithoutSensitiveData } = updatedUser

    return NextResponse.json(
      {
        user: userWithoutSensitiveData,
        message: 'Profile updated successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update profile error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}