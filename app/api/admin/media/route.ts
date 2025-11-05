import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const mediaQuerySchema = z.object({
  type: z.enum(['image', 'video', 'document']).optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Verify admin access
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = mediaQuerySchema.parse(queryParams)

    // Mock media data (in a real implementation, this would come from a database or S3)
    const mockMediaData = [
      {
        id: '1',
        name: 'university-campus.jpg',
        type: 'image',
        size: '2.4 MB',
        url: '/uploads/images/university-campus.jpg',
        uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: '2',
        name: 'study-abroad-guide.pdf',
        type: 'document',
        size: '1.8 MB',
        url: '/uploads/documents/study-abroad-guide.pdf',
        uploadedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: '3',
        name: 'ielts-preparation-video.mp4',
        type: 'video',
        size: '156 MB',
        url: '/uploads/videos/ielts-preparation-video.mp4',
        uploadedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        id: '4',
        name: 'canada-flag.png',
        type: 'image',
        size: '45 KB',
        url: '/uploads/images/canada-flag.png',
        uploadedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString() // 4 days ago
      },
      {
        id: '5',
        name: 'student-testimonial.jpg',
        type: 'image',
        size: '1.2 MB',
        url: '/uploads/images/student-testimonial.jpg',
        uploadedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString() // 5 days ago
      },
      {
        id: '6',
        name: 'visa-requirements.pdf',
        type: 'document',
        size: '890 KB',
        url: '/uploads/documents/visa-requirements.pdf',
        uploadedAt: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString() // 6 days ago
      },
      {
        id: '7',
        name: 'university-tour.mp4',
        type: 'video',
        size: '245 MB',
        url: '/uploads/videos/university-tour.mp4',
        uploadedAt: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString() // 7 days ago
      },
      {
        id: '8',
        name: 'scholarship-info.jpg',
        type: 'image',
        size: '856 KB',
        url: '/uploads/images/scholarship-info.jpg',
        uploadedAt: new Date(Date.now() - 192 * 60 * 60 * 1000).toISOString() // 8 days ago
      },
      {
        id: '9',
        name: 'application-checklist.pdf',
        type: 'document',
        size: '654 KB',
        url: '/uploads/documents/application-checklist.pdf',
        uploadedAt: new Date(Date.now() - 216 * 60 * 60 * 1000).toISOString() // 9 days ago
      },
      {
        id: '10',
        name: 'campus-life.jpg',
        type: 'image',
        size: '1.7 MB',
        url: '/uploads/images/campus-life.jpg',
        uploadedAt: new Date(Date.now() - 240 * 60 * 60 * 1000).toISOString() // 10 days ago
      }
    ]

    // Filter by type if specified
    let filteredMedia = mockMediaData
    if (validatedQuery.type) {
      filteredMedia = filteredMedia.filter(item => item.type === validatedQuery.type)
    }

    // Filter by search term if specified
    if (validatedQuery.search) {
      const searchTerm = validatedQuery.search.toLowerCase()
      filteredMedia = filteredMedia.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
      )
    }

    // Pagination
    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMedia = filteredMedia.slice(startIndex, endIndex)

    return NextResponse.json(paginatedMedia)

  } catch (error) {
    console.error('Media fetch error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

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

    // Handle file upload
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'general'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf', 'application/msword']
    const maxSize = 50 * 1024 * 1024 // 50MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // In a real implementation, upload to S3 or local storage
    // For now, return a mock response
    const newMediaItem = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' :
            file.type.startsWith('video/') ? 'video' : 'document',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: `/uploads/${category}/${file.name}`,
      uploadedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      media: newMediaItem
    })

  } catch (error) {
    console.error('Media upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}