import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST AUTH ENDPOINT ===')
    console.log('All cookies:', request.cookies.getAll())
    console.log('All headers:', Object.fromEntries(request.headers.entries()))
    
    const user = await getUserFromToken(request)
    
    if (user) {
      return NextResponse.json({
        success: true,
        message: 'Authenticated',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated',
        cookies: request.cookies.getAll().map(c => c.name)
      }, { status: 401 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      cookies: request.cookies.getAll().map(c => c.name)
    }, { status: 500 })
  }
}
