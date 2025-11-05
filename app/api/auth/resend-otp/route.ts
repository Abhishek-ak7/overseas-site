import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendEmail, EmailType } from '@/lib/email'
import { getEmailSettings } from '@/lib/settings'

const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resendOtpSchema.parse(body)

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

    // Check if SMTP is configured
    const emailSettings = await getEmailSettings()
    const isSmtpConfigured = emailSettings.smtpHost &&
                            emailSettings.smtpUsername &&
                            emailSettings.smtpPassword &&
                            emailSettings.enableEmailNotifications

    if (!isSmtpConfigured) {
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    // Generate new OTP
    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with new OTP
    await prisma.users.update({
      where: { id: user.id },
      data: {
        verification_otp: verificationOtp,
        otp_expiry: otpExpiry,
        updated_at: new Date(),
      },
    })

    // Send OTP email
    const result = await sendEmail({
      to: user.email,
      type: EmailType.EMAIL_VERIFICATION,
      data: {
        firstName: user.first_name,
        otp: verificationOtp,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${user.email}`,
      },
    })

    if (!result.success) {
      throw new Error('Failed to send email')
    }

    return NextResponse.json({
      success: true,
      message: 'New OTP sent to your email address.',
    })
  } catch (error) {
    console.error('Resend OTP error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to resend OTP. Please try again later.' },
      { status: 500 }
    )
  }
}
