import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = verifyOtpSchema.parse(body)

    // Find user
    const user = await prisma.users.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.is_verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Check if OTP has expired
    if (user.otp_expiry && new Date() > user.otp_expiry) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify OTP
    if (user.verification_otp !== validatedData.otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      )
    }

    // Update user as verified
    await prisma.users.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        email_verified_at: new Date(),
        verification_otp: null,
        otp_expiry: null,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now access all features.',
    })
  } catch (error) {
    console.error('OTP verification error:', error)

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
