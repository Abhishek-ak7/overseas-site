import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/courses/my-courses - Get user's enrolled courses
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const enrollments = await prisma.course_enrollments.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail_url: true,
            instructor_name: true,
            duration: true,
            total_lessons: true,
            is_published: true,
          }
        }
      },
      orderBy: {
        last_accessed_at: 'desc',
      }
    })

    // Calculate completed lessons for each enrollment
    const enrollmentsWithStats = await Promise.all(
      enrollments.map(async (enrollment) => {
        try {
          // Get completed lessons count
          const completedLessons = await prisma.lesson_progress.count({
            where: {
              user_id: user.id,
              lessons: {
                courses: {
                  id: enrollment.course_id
                }
              },
              is_completed: true,
            }
          })

          return {
            ...enrollment,
            completed_lessons: completedLessons,
          }
        } catch (error) {
          // If there's an error fetching lesson progress, return enrollment without stats
          return {
            ...enrollment,
            completed_lessons: 0,
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      enrollments: enrollmentsWithStats,
    })
  } catch (error) {
    console.error('Get my courses error:', error)

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
