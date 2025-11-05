import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { deleteFromS3, parseS3Key } from '@/lib/upload'
import { UserRole } from '@prisma/client'

const deleteFileSchema = z.object({
  key: z.string().min(1, 'File key is required'),
  force: z.boolean().optional().default(false), // Allow admins to force delete
})

// DELETE /api/upload/delete - Delete file from S3
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = deleteFileSchema.parse(body)

    // Parse S3 key to get file info
    const fileInfo = parseS3Key(validatedData.key)

    // Check permissions
    const isOwner = validatedData.key.includes(`/${user.id}/`)
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN

    if (!isOwner && !isAdmin && !validatedData.force) {
      return NextResponse.json(
        { error: 'You can only delete your own files' },
        { status: 403 }
      )
    }

    // Check if file is still being used in database
    const fileUsage = await checkFileUsage(validatedData.key)

    if (fileUsage.isUsed && !validatedData.force && !isAdmin) {
      return NextResponse.json(
        {
          error: 'File is still being used',
          usage: fileUsage.usage,
          message: 'This file is currently referenced in the system. Contact an admin to force delete.'
        },
        { status: 409 }
      )
    }

    // Delete from S3
    const deleteResult = await deleteFromS3(validatedData.key)

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: deleteResult.error },
        { status: 500 }
      )
    }

    // Update database records that reference this file (set to null)
    if (validatedData.force || isAdmin) {
      await updateFileReferences(validatedData.key)
    }

    // Log file deletion for audit trail
    await prisma.auditLog.create({
      data: {
        action: 'FILE_DELETE',
        resourceType: 'FILE',
        resourceId: validatedData.key,
        userId: user.id,
        details: {
          fileName: fileInfo.fileName,
          category: fileInfo.category,
          forced: validatedData.force || false,
          usage: fileUsage.usage,
        },
      },
    }).catch(error => {
      console.error('Failed to create audit log:', error)
      // Don't fail the deletion if audit log fails
    })

    const response = {
      success: true,
      message: 'File deleted successfully',
      deletedFile: {
        key: validatedData.key,
        category: fileInfo.category,
        fileName: fileInfo.fileName,
        deletedAt: new Date().toISOString(),
        deletedBy: user.email,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Delete file error:', error)

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

// Helper function to check if file is being used in database
async function checkFileUsage(fileKey: string) {
  const usage: string[] = []

  try {
    // Check user profile avatars
    const userWithAvatar = await prisma.users.findFirst({
      where: {
        OR: [
          { profile: { avatarUrl: { contains: fileKey } } },
        ]
      },
      select: { id: true, firstName: true, lastName: true }
    })

    if (userWithAvatar) {
      usage.push(`User profile: ${userWithAvatar.firstName} ${userWithAvatar.lastName}`)
    }

    // Check course thumbnails
    const courseWithThumbnail = await prisma.courses.findFirst({
      where: { thumbnailUrl: { contains: fileKey } },
      select: { id: true, title: true }
    })

    if (courseWithThumbnail) {
      usage.push(`Course thumbnail: ${courseWithThumbnail.title}`)
    }

    // Check test questions for audio/images
    const questionWithFile = await prisma.question.findFirst({
      where: {
        OR: [
          { audioUrl: { contains: fileKey } },
          { imageUrl: { contains: fileKey } },
        ]
      },
      include: {
        section: {
          include: {
            test: { select: { title: true } }
          }
        }
      }
    })

    if (questionWithFile) {
      usage.push(`Test question in: ${questionWithFile.section.test.title}`)
    }

    // Check certificates
    const enrollmentWithCertificate = await prisma.courseEnrollment.findFirst({
      where: { certificateUrl: { contains: fileKey } },
      include: {
        course: { select: { title: true } },
        user: { select: { firstName: true, lastName: true } }
      }
    })

    if (enrollmentWithCertificate) {
      usage.push(`Certificate for ${enrollmentWithCertificate.user.firstName} ${enrollmentWithCertificate.user.lastName} - ${enrollmentWithCertificate.course.title}`)
    }

    return {
      isUsed: usage.length > 0,
      usage
    }
  } catch (error) {
    console.error('Error checking file usage:', error)
    return {
      isUsed: false,
      usage: []
    }
  }
}

// Helper function to update database references
async function updateFileReferences(fileKey: string) {
  try {
    // Update user profile avatars
    await prisma.userProfile.updateMany({
      where: { avatarUrl: { contains: fileKey } },
      data: { avatarUrl: null }
    })

    // Update course thumbnails
    await prisma.courses.updateMany({
      where: { thumbnailUrl: { contains: fileKey } },
      data: { thumbnailUrl: null }
    })

    // Update test question files
    await prisma.question.updateMany({
      where: { audioUrl: { contains: fileKey } },
      data: { audioUrl: null }
    })

    await prisma.question.updateMany({
      where: { imageUrl: { contains: fileKey } },
      data: { imageUrl: null }
    })

    // Update certificates
    await prisma.courseEnrollment.updateMany({
      where: { certificateUrl: { contains: fileKey } },
      data: { certificateUrl: null }
    })

    console.log(`Updated database references for file: ${fileKey}`)
  } catch (error) {
    console.error('Error updating file references:', error)
    throw error
  }
}