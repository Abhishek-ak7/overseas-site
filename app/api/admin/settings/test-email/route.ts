import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { sendEmail, EmailType } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Verify admin access
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Send test email
    const result = await sendEmail({
      to: email,
      type: EmailType.WELCOME,
      data: {
        firstName: 'Test',
        verificationRequired: false,
      },
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test email error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
