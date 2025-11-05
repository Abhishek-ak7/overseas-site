import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import {
  generatePresignedUrl,
  generateFilePath,
  validateFile,
  validateFileWithSettings,
  UploadCategory,
  fileTypes,
} from '@/lib/upload'

const presignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().min(1, 'File size is required'),
  category: z.enum([
    'PROFILE_PICTURES',
    'COURSE_THUMBNAILS',
    'COURSE_CONTENT',
    'TEST_AUDIO',
    'TEST_IMAGES',
    'BLOG_IMAGES',
    'TESTIMONIAL_IMAGES',
    'DOCUMENTS',
    'CERTIFICATES',
  ]),
  allowedType: z.enum(['image', 'video', 'document', 'audio']),
})

// POST /api/upload/presigned-url - Generate presigned URL for direct upload
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = presignedUrlSchema.parse(body)

    // Validate file using admin settings
    const validation = await validateFileWithSettings(
      {
        name: validatedData.fileName,
        size: validatedData.fileSize,
        type: validatedData.fileType,
      },
      validatedData.allowedType as keyof typeof fileTypes
    )

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Generate file path
    const fileExtension = '.' + validatedData.fileName.split('.').pop()?.toLowerCase()
    const key = generateFilePath(
      validatedData.category as UploadCategory,
      user.id,
      validatedData.fileName,
      fileExtension
    )

    // Generate presigned URL
    const presignedResult = await generatePresignedUrl({
      key,
      contentType: validatedData.fileType,
      expiresIn: 3600, // 1 hour
    })

    if (!presignedResult.success) {
      return NextResponse.json(
        { error: presignedResult.error },
        { status: 500 }
      )
    }

    const response = {
      success: true,
      presignedUrl: presignedResult.url,
      key,
      expiresIn: 3600,
      uploadInstructions: {
        method: 'PUT',
        headers: {
          'Content-Type': validatedData.fileType,
        },
      },
      fileInfo: {
        name: validatedData.fileName,
        size: validatedData.fileSize,
        type: validatedData.fileType,
        category: validatedData.category,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Presigned URL error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

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