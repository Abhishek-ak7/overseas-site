import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        user_profiles: user.user_profiles ? {
          first_name: user.user_profiles.first_name,
          last_name: user.user_profiles.last_name,
          phone: user.user_profiles.phone,
          avatar_url: user.user_profiles.avatar_url
        } : null
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      success: false,
      message: 'Authentication failed'
    }, { status: 401 })
  }
}