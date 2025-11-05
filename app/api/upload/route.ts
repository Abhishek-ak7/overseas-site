import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import {
  uploadFile,
  uploadToS3,
  validateFile,
  validateFileWithSettings,
  UploadCategory,
  fileTypes,
  getFileInfo,
  scanFileForVirus,
} from '@/lib/upload'

const uploadSchema = z.object({
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
    'HERO_SLIDES',
  ]),
  allowedType: z.enum(['image', 'video', 'document', 'audio']),
})

// Context to category mapping
const contextToCategoryMap: Record<string, string> = {
  'courses': 'COURSE_THUMBNAILS',
  'course-thumbnail': 'COURSE_THUMBNAILS',
  'course-thumbnails': 'COURSE_THUMBNAILS',
  'course-content': 'COURSE_CONTENT',
  'course-video': 'COURSE_CONTENT',
  'course-material': 'COURSE_CONTENT',
  'hero-slides': 'HERO_SLIDES',
  'blog': 'BLOG_IMAGES',
  'testimonials': 'TESTIMONIAL_IMAGES',
  'profile': 'PROFILE_PICTURES',
  'documents': 'DOCUMENTS',
  'certificates': 'CERTIFICATES',
  'universities': 'BLOG_IMAGES',
  'programs': 'BLOG_IMAGES',
}

// POST /api/upload - Upload file
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const allowedType = formData.get('allowedType') as string
    const context = formData.get('context') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Handle context-based uploads (from ImageUpload component)
    let finalCategory = category
    let finalAllowedType = allowedType

    if (context && !category) {
      // Map context to category
      finalCategory = contextToCategoryMap[context] || 'COURSE_THUMBNAILS'

      // For images, default to image type
      if (file.type.startsWith('image/')) {
        finalAllowedType = 'image'
      } else if (file.type.startsWith('video/')) {
        finalAllowedType = 'video'
      } else if (file.type.startsWith('audio/')) {
        finalAllowedType = 'audio'
      } else {
        finalAllowedType = 'document'
      }
    }

    // Validate input
    const validatedData = uploadSchema.parse({
      category: finalCategory,
      allowedType: finalAllowedType,
    })

    // Get file info
    const fileInfo = getFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Validate file type and size using admin settings
    const validation = await validateFileWithSettings(fileInfo, validatedData.allowedType as keyof typeof fileTypes)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Scan for virus (basic implementation)
    const virusScan = await scanFileForVirus(buffer)
    if (!virusScan.safe) {
      return NextResponse.json(
        { error: `File rejected: ${virusScan.threat}` },
        { status: 400 }
      )
    }

    // Upload with fallback (S3 -> Local)
    const uploadResult = await uploadFile({
      file: {
        buffer,
        name: file.name,
        type: file.type,
      },
      category: validatedData.category as UploadCategory,
      userId: user.id,
      metadata: {
        originalSize: file.size.toString(),
        uploadedBy: user.email,
      },
    })

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 500 }
      )
    }

    // TODO: Store file record in database for tracking
    // TODO: Generate thumbnails for images
    // TODO: Process videos for streaming
    // TODO: Extract metadata for documents

    const response = {
      success: true,
      file: {
        url: uploadResult.url,
        key: uploadResult.key,
        name: file.name,
        size: file.size,
        type: file.type,
        category: validatedData.category,
        uploadedAt: new Date().toISOString(),
        storage: uploadResult.storage,
      },
      message: `File uploaded successfully to ${uploadResult.storage} storage`,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Upload error:', error)

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

// GET /api/upload - Get upload configuration
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Import storage settings function
    const { getStorageSettings } = await import('@/lib/settings')

    // Get dynamic storage settings
    const storageSettings = await getStorageSettings()

    // Use admin settings for file configuration
    const maxFileSize = (storageSettings.maxFileSize || 10) * 1024 * 1024 // Convert MB to bytes
    const allowedFileTypes = storageSettings.allowedFileTypes?.split(',') || ['image', 'video', 'document', 'audio']

    const config = {
      categories: Object.values(UploadCategory),
      fileTypes: Object.keys(fileTypes)
        .filter(type => allowedFileTypes.includes(type))
        .map(type => ({
          type,
          ...fileTypes[type as keyof typeof fileTypes],
          maxSize: maxFileSize, // Use admin-configured max size
          maxSizeFormatted: `${maxFileSize / (1024 * 1024)}MB`,
        })),
      maxFileSize: maxFileSize,
      supportedFormats: Object.fromEntries(
        allowedFileTypes.map(type => [
          type,
          fileTypes[type as keyof typeof fileTypes]?.extensions || []
        ])
      ),
      adminSettings: {
        provider: storageSettings.provider,
        maxFileSize: storageSettings.maxFileSize,
        allowedFileTypes: storageSettings.allowedFileTypes,
      },
    }

    return NextResponse.json({ config }, { status: 200 })
  } catch (error) {
    console.error('Get upload config error:', error)

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