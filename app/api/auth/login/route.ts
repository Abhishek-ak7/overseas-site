import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken, generateRefreshToken } from '@/lib/auth'
import crypto from 'crypto'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find user
    const user = await prisma.users.findUnique({
      where: { email: validatedData.email.toLowerCase() },
      include: {
        user_profiles: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create session
    await prisma.user_sessions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        token: token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        device_info: request.headers.get('user-agent') || '',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        created_at: new Date(),
      },
    })

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    })

    const responseData = {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        studyLevel: user.study_level,
        role: user.role,
        isVerified: user.is_verified,
        profile: user.user_profiles,
      },
      token,
      refreshToken,
      message: 'Login successful',
    }

    // Create response with proper cookie setting
    const response = NextResponse.json(responseData, { status: 200 })

    // Use the cookies API properly
    response.cookies.set('auth-token', token, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
      httpOnly: false,
      secure: false
    })

    console.log('🍪 LOGIN API: Setting auth-token cookie')
    console.log('🍪 Response headers:', Object.fromEntries(response.headers.entries()))
    console.log('🍪 Response cookies:', response.cookies.getAll())

    return response
  } catch (error) {
    console.error('Login error:', error)

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