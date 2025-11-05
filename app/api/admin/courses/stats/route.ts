import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    // Get comprehensive course statistics
    const [
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      completedEnrollments,
      totalRevenue,
      averageRating,
      ratingCount,
      topCategories,
      recentCourses
    ] = await Promise.all([
      // Total courses
      prisma.courses.count(),

      // Published courses
      prisma.courses.count({
        where: { is_published: true }
      }),

      // Draft courses
      prisma.courses.count({
        where: { is_published: false }
      }),

      // Total enrollments
      prisma.course_enrollments.count(),

      // Completed enrollments
      prisma.course_enrollments.count({
        where: { status: 'COMPLETED' }
      }),

      // Total revenue from course sales
      prisma.transactions.aggregate({
        where: {
          type: 'COURSE_PURCHASE',
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),

      // Average rating across all courses
      prisma.courses.aggregate({
        _avg: { rating: true }
      }),

      // Total number of ratings
      prisma.course_reviews.count({
        where: { is_published: true }
      }),

      // Top course categories
      prisma.courses.groupBy({
        by: ['category_id'],
        _count: { category_id: true },
        orderBy: { _count: { category_id: 'desc' } },
        take: 5
      }),

      // Recent courses (last 5 created)
      prisma.courses.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          instructor_name: true,
          created_at: true,
          is_published: true,
          _count: {
            select: { course_enrollments: true }
          }
        }
      })
    ])

    // Calculate additional metrics
    const completionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0

    const stats = {
      total: totalCourses,
      published: publishedCourses,
      draft: draftCourses,
      totalEnrollments,
      completedEnrollments,
      completionRate,
      totalRevenue: totalRevenue._sum.amount?.toNumber() || 0,
      averageRating: Number(averageRating._avg.rating?.toFixed(1)) || 0,
      totalRatings: ratingCount,
      topCategories: topCategories.map(cat => ({
        categoryId: cat.category_id,
        count: cat._count.category_id || 0
      })),
      recentCourses: recentCourses.map(course => ({
        id: course.id,
        title: course.title,
        instructor: course.instructor_name,
        createdAt: course.created_at.toISOString(),
        isPublished: course.is_published,
        enrollments: course._count.course_enrollments
      }))
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Course stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course statistics' },
      { status: 500 }
    )
  }
}