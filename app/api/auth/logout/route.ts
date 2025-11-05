import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (token) {
      // Delete the current session
      await prisma.userSession.deleteMany({
        where: {
          userId: user.id,
          token: token,
        },
      })
    }

    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    )

    // Clear auth cookie
    response.cookies.set('auth-token', '', {
      expires: new Date(0),
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}