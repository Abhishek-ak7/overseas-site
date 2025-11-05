import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, generateRefreshToken, generateVerificationToken } from '@/lib/auth'
import { sendEmail, EmailType } from '@/lib/email'
import crypto from 'crypto'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  country: z.string().optional(),
  studyLevel: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Check if SMTP is configured BEFORE creating user
    let isSmtpConfigured = false
    try {
      const { getEmailSettings } = await import('@/lib/settings')
      const emailSettings = await getEmailSettings()

      isSmtpConfigured = !!(emailSettings.smtpHost &&
                           emailSettings.smtpUsername &&
                           emailSettings.smtpPassword &&
                           emailSettings.enableEmailNotifications)
    } catch (error) {
      console.error('Failed to check SMTP settings:', error)
    }

    // Generate verification token and OTP only if SMTP is configured
    const verificationToken = generateVerificationToken()
    const verificationOtp = isSmtpConfigured ? Math.floor(100000 + Math.random() * 900000).toString() : null
    const otpExpiry = isSmtpConfigured ? new Date(Date.now() + 10 * 60 * 1000) : null

    // Create user - auto-verify if SMTP not configured
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email.toLowerCase(),
        password_hash: hashedPassword,
        phone: validatedData.phone,
        country: validatedData.country,
        study_level: validatedData.studyLevel,
        verification_token: verificationToken,
        verification_otp: verificationOtp,
        otp_expiry: otpExpiry,
        is_verified: !isSmtpConfigured, // Auto-verify if SMTP not configured
        email_verified_at: !isSmtpConfigured ? new Date() : null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        user_profiles: true,
      },
    })

    // Create user profile
    await prisma.user_profiles.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        interested_countries: validatedData.country ? [validatedData.country] : [],
      },
    })

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

    // Check if SMTP is configured and send OTP email
    let emailSent = false
    try {
      const { getEmailSettings } = await import('@/lib/settings')
      const emailSettings = await getEmailSettings()

      const isSmtpConfigured = emailSettings.smtpHost &&
                              emailSettings.smtpUsername &&
                              emailSettings.smtpPassword &&
                              emailSettings.enableEmailNotifications

      if (isSmtpConfigured) {
        // Send OTP email
        await sendEmail({
          to: user.email,
          type: EmailType.EMAIL_VERIFICATION,
          data: {
            firstName: user.first_name,
            otp: verificationOtp,
            verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${user.email}`,
          },
        })
        emailSent = true
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email fails
    }

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
      requiresVerification: emailSent,
      message: emailSent
        ? 'Account created successfully. Please check your email for the OTP verification code.'
        : 'Account created successfully. You can start using the platform now.',
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)

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