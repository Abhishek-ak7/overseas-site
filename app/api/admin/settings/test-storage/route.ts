import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { testStorageConfiguration } from '@/lib/settings'

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

    const result = await testStorageConfiguration()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Storage test error:', error)
    return NextResponse.json(
      { error: 'Failed to test storage configuration' },
      { status: 500 }
    )
  }
}