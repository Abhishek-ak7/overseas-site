import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        email: session.user.email,
        phone: session.user.phone,
        role: session.user.role,
        isVerified: session.user.isVerified,
        profilePicture: session.user.image || null,
        country: session.user.country,
        studyLevel: session.user.studyLevel,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
