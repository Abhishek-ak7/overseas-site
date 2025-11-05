import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with verification token
    const user = await prisma.users.findFirst({
      where: {
        verification_token: token,
        is_verified: false,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token or email already verified' },
        { status: 400 }
      )
    }

    // Update user as verified
    await prisma.users.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verification_token: null,
        updated_at: new Date(),
      },
    })

    // Redirect to success page or login
    return NextResponse.redirect(new URL('/auth/verify-email/success', request.url))
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/auth/verify-email/error', request.url))
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = verifyEmailSchema.parse(body)

    // Find user with verification token
    const user = await prisma.users.findFirst({
      where: {
        verification_token: validatedData.token,
        is_verified: false,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token or email already verified' },
        { status: 400 }
      )
    }

    // Update user as verified
    await prisma.users.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verification_token: null,
        updated_at: new Date(),
      },
    })

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)

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