import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { uploadToS3, validateFileWithSettings, UploadCategory } from '@/lib/upload'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Check if user has permission to upload files
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.INSTRUCTOR)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin or Instructor access required' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const context = formData.get('context') as string || 'general'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Map context to upload category
    let category: UploadCategory
    switch (context) {
      case 'course-thumbnail':
      case 'courses':
        category = UploadCategory.COURSE_THUMBNAILS
        break
      case 'course-content':
        category = UploadCategory.COURSE_CONTENT
        break
      case 'profile':
        category = UploadCategory.PROFILE_PICTURES
        break
      case 'blog':
      case 'posts':
        category = UploadCategory.BLOG_IMAGES
        break
      case 'testimonials':
        category = UploadCategory.TESTIMONIAL_IMAGES
        break
      case 'documents':
        category = UploadCategory.DOCUMENTS
        break
      case 'certificates':
        category = UploadCategory.CERTIFICATES
        break
      default:
        category = UploadCategory.COURSE_THUMBNAILS // Default for course creation
    }

    // Validate file
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
    }

    const validation = await validateFileWithSettings(fileData, 'image')
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to S3
    const uploadResult = await uploadToS3({
      file: {
        buffer,
        name: file.name,
        type: file.type,
      },
      category,
      userId: user.id,
      metadata: {
        context,
        uploadedBy: user.email || user.id,
      },
    })

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
      message: 'File uploaded successfully',
    })

  } catch (error) {
    console.error('Upload API error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}