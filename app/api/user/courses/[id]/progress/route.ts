import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { EnrollmentStatus } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

const updateProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
  timeSpent: z.number().optional(), // in minutes
})

// PUT /api/user/courses/[id]/progress - Update course progress
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const courseId = params.id

    const body = await request.json()
    const validatedData = updateProgressSchema.parse(body)

    // Find enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
      include: {
        course: {
          select: {
            title: true,
            duration: true,
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 404 }
      )
    }

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Cannot update progress for inactive enrollment' },
        { status: 400 }
      )
    }

    // Calculate completion status
    let status = enrollment.status
    let completedAt = enrollment.completedAt

    if (validatedData.progress >= 100 && enrollment.status === EnrollmentStatus.ACTIVE) {
      status = EnrollmentStatus.COMPLETED
      completedAt = new Date()
    }

    // Update enrollment
    const updatedEnrollment = await prisma.courseEnrollment.update({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
      data: {
        progress: validatedData.progress,
        status,
        completedAt,
        lastAccessedAt: new Date(),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            duration: true,
          },
        },
      },
    })

    // If course is completed, you might want to:
    // 1. Generate completion certificate
    // 2. Send completion email
    // 3. Award points/badges
    // 4. Update user's learning statistics

    if (status === EnrollmentStatus.COMPLETED && enrollment.status !== EnrollmentStatus.COMPLETED) {
      // TODO: Generate certificate
      // TODO: Send completion notification

      console.log(`User ${user.id} completed course ${courseId}`)
    }

    return NextResponse.json({
      enrollment: {
        id: updatedEnrollment.id,
        progress: updatedEnrollment.progress,
        status: updatedEnrollment.status,
        completedAt: updatedEnrollment.completedAt,
        lastAccessedAt: updatedEnrollment.lastAccessedAt,
        course: updatedEnrollment.course,
      },
      message: status === EnrollmentStatus.COMPLETED ? 'Congratulations! Course completed!' : 'Progress updated successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Update progress error:', error)

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

// GET /api/user/courses/[id]/progress - Get detailed course progress
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    const courseId = params.id

    // Find enrollment with detailed course structure
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 404 }
      )
    }

    // Calculate detailed progress metrics
    const totalLessons = enrollment.course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    )

    const totalDuration = enrollment.course.modules.reduce(
      (total, module) => total + module.lessons.reduce(
        (moduleTotal, lesson) => moduleTotal + (lesson.duration || 0),
        0
      ),
      0
    )

    // In a real implementation, you would track individual lesson completion
    // For now, we'll estimate based on overall progress
    const estimatedCompletedLessons = Math.floor((enrollment.progress / 100) * totalLessons)
    const estimatedTimeSpent = Math.floor((enrollment.progress / 100) * totalDuration)

    const response = {
      enrollment: {
        id: enrollment.id,
        progress: enrollment.progress,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        certificateUrl: enrollment.certificateUrl,
      },
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        slug: enrollment.course.slug,
        instructorName: enrollment.course.instructorName,
        thumbnailUrl: enrollment.course.thumbnailUrl,
        totalModules: enrollment.course.modules.length,
        totalLessons,
        totalDuration,
      },
      statistics: {
        completedLessons: estimatedCompletedLessons,
        remainingLessons: totalLessons - estimatedCompletedLessons,
        estimatedTimeSpent, // in minutes
        estimatedTimeRemaining: totalDuration - estimatedTimeSpent,
        progressPercentage: enrollment.progress,
      },
      modules: enrollment.course.modules.map(module => ({
        id: module.id,
        title: module.title,
        totalLessons: module.lessons.length,
        totalDuration: module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0),
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration,
          contentType: lesson.contentType,
          isFree: lesson.isFree,
          // In real implementation, track individual lesson completion
          isCompleted: false, // Would be calculated based on user progress
        })),
      })),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get progress error:', error)

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