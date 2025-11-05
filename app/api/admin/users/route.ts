import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

const usersQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  verified: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'role', 'created', 'lastLogin']).optional().default('created'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  studyLevel: z.string().optional(),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  isVerified: z.boolean().optional(),
})

// GET /api/admin/users - List all users with filtering
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = usersQuerySchema.parse(queryParams)

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (validatedQuery.search) {
      where.OR = [
        { first_name: { contains: validatedQuery.search, mode: 'insensitive' } },
        { last_name: { contains: validatedQuery.search, mode: 'insensitive' } },
        { email: { contains: validatedQuery.search, mode: 'insensitive' } },
        { phone: { contains: validatedQuery.search, mode: 'insensitive' } },
      ]
    }

    if (validatedQuery.role) {
      where.role = validatedQuery.role as UserRole
    }

    if (validatedQuery.verified !== undefined) {
      where.is_verified = validatedQuery.verified === 'true'
    }

    if (validatedQuery.dateFrom || validatedQuery.dateTo) {
      where.created_at = {}
      if (validatedQuery.dateFrom) {
        where.created_at.gte = new Date(validatedQuery.dateFrom)
      }
      if (validatedQuery.dateTo) {
        where.created_at.lte = new Date(validatedQuery.dateTo)
      }
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (validatedQuery.sortBy) {
      case 'name':
        orderBy = [{ first_name: validatedQuery.sortOrder }, { last_name: validatedQuery.sortOrder }]
        break
      case 'email':
        orderBy.email = validatedQuery.sortOrder
        break
      case 'role':
        orderBy.role = validatedQuery.sortOrder
        break
      case 'lastLogin':
        orderBy.last_login = validatedQuery.sortOrder
        break
      case 'created':
      default:
        orderBy.created_at = validatedQuery.sortOrder
        break
    }

    // Get users with related data
    const [users, totalCount] = await Promise.all([
      prisma.users.findMany({
        where,
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit,
        include: {
          user_profiles: true
        }
      }),
      prisma.users.count({ where }),
    ])

    // Get user statistics
    const userStats = await prisma.users.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    })

    const verificationStats = await prisma.users.groupBy({
      by: ['is_verified'],
      _count: {
        is_verified: true,
      },
    })

    const response = {
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerifiedAt: user.email_verified_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        user_profiles: user.user_profiles ? {
          first_name: user.user_profiles.first_name,
          last_name: user.user_profiles.last_name,
          phone: user.user_profiles.phone,
          country: user.user_profiles.country,
          city: user.user_profiles.city,
          avatar_url: user.user_profiles.avatar_url
        } : null
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      statistics: {
        byRole: userStats.map(stat => ({
          role: stat.role,
          count: stat._count.role,
        })),
        byVerification: verificationStats.map(stat => ({
          verified: stat.is_verified,
          count: stat._count.is_verified,
        })),
        total: totalCount,
      },
      filters: {
        roles: Object.values(UserRole),
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get admin users error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
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