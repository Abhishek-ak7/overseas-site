import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  studyLevel: z.string().optional(),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  isVerified: z.boolean().optional(),
  profile: z.object({
    bio: z.string().optional(),
    interestedCountries: z.array(z.string()).optional(),
    fieldOfInterest: z.string().optional(),
    budgetRange: z.string().optional(),
    intakePreference: z.string().optional(),
  }).optional(),
})

// GET /api/admin/users/[id] - Get user details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                price: true,
              }
            }
          },
          orderBy: { enrolledAt: 'desc' },
        },
        testAttempts: {
          include: {
            test: {
              select: {
                id: true,
                title: true,
                type: true,
              }
            }
          },
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
        appointments: {
          include: {
            consultant: {
              select: {
                id: true,
                name: true,
              }
            },
            type: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            deviceInfo: true,
            ipAddress: true,
            createdAt: true,
            expiresAt: true,
          }
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data
    const { passwordHash, verificationToken, resetToken, resetTokenExpiry, ...userWithoutSensitive } = user

    // Calculate user statistics
    const stats = {
      totalEnrollments: user.enrollments.length,
      activeEnrollments: user.enrollments.filter(e => e.status === 'ACTIVE').length,
      completedCourses: user.enrollments.filter(e => e.status === 'COMPLETED').length,
      totalTestAttempts: user.testAttempts.length,
      completedTests: user.testAttempts.filter(a => a.status === 'COMPLETED').length,
      averageTestScore: user.testAttempts.length > 0
        ? user.testAttempts
            .filter(a => a.score !== null)
            .reduce((sum, a) => sum + (a.score || 0), 0) / user.testAttempts.filter(a => a.score !== null).length
        : 0,
      totalAppointments: user.appointments.length,
      totalSpent: user.transactions
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
    }

    const response = {
      user: {
        ...userWithoutSensitive,
        statistics: stats,
      }
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get user details error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
    const userId = params.id

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent non-super-admin from promoting users to admin roles
    if (admin.role !== UserRole.SUPER_ADMIN && validatedData.role) {
      if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(validatedData.role as UserRole)) {
        return NextResponse.json(
          { error: 'Only super admin can assign admin roles' },
          { status: 403 }
        )
      }
    }

    // Check email uniqueness if email is being changed
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Update user basic info
    const updateUserData: any = {}
    if (validatedData.firstName) updateUserData.firstName = validatedData.firstName
    if (validatedData.lastName) updateUserData.lastName = validatedData.lastName
    if (validatedData.email) updateUserData.email = validatedData.email
    if (validatedData.phone !== undefined) updateUserData.phone = validatedData.phone
    if (validatedData.country !== undefined) updateUserData.country = validatedData.country
    if (validatedData.studyLevel !== undefined) updateUserData.studyLevel = validatedData.studyLevel
    if (validatedData.role) updateUserData.role = validatedData.role as UserRole
    if (validatedData.isVerified !== undefined) updateUserData.isVerified = validatedData.isVerified

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateUserData,
      include: {
        profile: true,
      },
    })

    // Update profile if provided
    if (validatedData.profile) {
      await prisma.userProfile.upsert({
        where: { userId: userId },
        update: validatedData.profile,
        create: {
          userId: userId,
          ...validatedData.profile,
        },
      })
    }

    // Get updated user with profile
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    })

    if (!finalUser) {
      return NextResponse.json(
        { error: 'User not found after update' },
        { status: 404 }
      )
    }

    // Remove sensitive data
    const { passwordHash, verificationToken, resetToken, resetTokenExpiry, ...userWithoutSensitive } = finalUser

    return NextResponse.json({
      user: userWithoutSensitive,
      message: 'User updated successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Update user error:', error)

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

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Deactivate user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAuth(request, [UserRole.SUPER_ADMIN]) // Only super admin can delete users
    const userId = params.id

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of super admin accounts
    if (existingUser.role === UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Cannot delete super admin account' },
        { status: 403 }
      )
    }

    // Instead of hard delete, we could soft delete by updating a status field
    // For now, we'll actually delete the user (cascading will handle related data)
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete user error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}