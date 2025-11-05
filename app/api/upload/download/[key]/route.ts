import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { generateDownloadUrl, parseS3Key } from '@/lib/upload'
import { UserRole } from '@prisma/client'

interface RouteParams {
  params: {
    key: string
  }
}

// GET /api/upload/download/[key] - Generate download URL for file
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)

    // Decode the key (it might be URL encoded)
    const key = decodeURIComponent(params.key)

    // Parse S3 key to get file info
    const fileInfo = parseS3Key(key)

    // Check permissions based on file category and ownership
    const isOwner = key.includes(`/${user.id}/`)
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN

    // Define access rules for different file categories
    const publicCategories = ['blog-images', 'testimonial-images']
    const isPublicFile = publicCategories.some(category => key.startsWith(category))

    // Check if user has access to this file
    if (!isPublicFile && !isOwner && !isAdmin) {
      // For course content, check if user is enrolled
      if (fileInfo.category === 'course-content') {
        // TODO: Check if user is enrolled in the course
        // This would require extracting course ID from the file path or metadata
        // For now, we'll deny access
        return NextResponse.json(
          { error: 'Access denied. You must be enrolled in the course to access this content.' },
          { status: 403 }
        )
      }

      // For test content, check if user has access to the test
      if (fileInfo.category === 'test-audio' || fileInfo.category === 'test-images') {
        // TODO: Check if user has purchased/has access to the test
        // For now, we'll deny access
        return NextResponse.json(
          { error: 'Access denied. You must have access to the test to view this content.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: 'Access denied. You can only download your own files.' },
        { status: 403 }
      )
    }

    // Get query parameters for download options
    const { searchParams } = new URL(request.url)
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600') // Default 1 hour
    const download = searchParams.get('download') === 'true' // Force download vs view

    // Generate download URL
    const downloadResult = await generateDownloadUrl({
      key,
      expiresIn,
    })

    if (!downloadResult.success) {
      return NextResponse.json(
        { error: downloadResult.error },
        { status: 500 }
      )
    }

    // Log download activity (optional)
    console.log(`File download requested: ${key} by user ${user.email}`)

    const response = {
      success: true,
      downloadUrl: downloadResult.url,
      fileInfo: {
        key,
        category: fileInfo.category,
        fileName: fileInfo.fileName,
      },
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      download: download,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Download file error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}