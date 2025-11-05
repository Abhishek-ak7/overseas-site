import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/auth'
import { sendEmail, EmailType } from '@/lib/email'

const resendSchema = z.object({
  email: z.string().email('Valid email is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resendSchema.parse(body)

    // Find user
    const user = await prisma.users.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with this email exists and is not verified, a verification email has been sent.' },
        { status: 200 }
      )
    }

    if (user.is_verified) {
      return NextResponse.json(
        { error: 'This email is already verified' },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()

    // Update user with new token
    await prisma.users.update({
      where: { id: user.id },
      data: {
        verification_token: verificationToken,
        updated_at: new Date(),
      },
    })

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        type: EmailType.WELCOME,
        data: {
          firstName: user.first_name,
          verificationRequired: true,
          verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}`,
        },
      })
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Verification email sent successfully. Please check your inbox.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)

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