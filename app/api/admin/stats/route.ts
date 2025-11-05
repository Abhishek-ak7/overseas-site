import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { UserRole, EnrollmentStatus, AppointmentStatus, AttemptStatus, TransactionStatus } from '@prisma/client'

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

    // Get date ranges for statistics
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30))

    // Get all statistics in parallel
    const [
      // User Statistics
      totalUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      verifiedUsers,

      // Course Statistics
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      revenueFromCourses,

      // Test Statistics
      totalTests,
      publishedTests,
      totalTestAttempts,
      completedTestAttempts,

      // Appointment Statistics
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      revenueFromAppointments,

      // Revenue Statistics
      totalRevenue,
      revenueThisMonth,
      revenueThisWeek,

      // Content Statistics
      totalBlogPosts,
      publishedBlogPosts,
      totalTestimonials,

      // Recent Activities
      recentUsers,
      recentEnrollments,
      recentAppointments,
      recentTestAttempts,
    ] = await Promise.all([
      // User Statistics
      prisma.users.count(),
      prisma.users.count({
        where: { created_at: { gte: startOfMonth } }
      }),
      prisma.users.count({
        where: { created_at: { gte: startOfWeek } }
      }),
      prisma.users.count({
        where: { is_verified: true }
      }),

      // Course Statistics
      prisma.courses.count(),
      prisma.courses.count({
        where: { is_published: true }
      }),
      prisma.course_enrollments.count(),
      prisma.course_enrollments.count({
        where: { status: EnrollmentStatus.ACTIVE }
      }),
      prisma.course_enrollments.count({
        where: { status: EnrollmentStatus.COMPLETED }
      }),
      prisma.transactions.aggregate({
        where: {
          type: 'COURSE_PURCHASE',
          status: TransactionStatus.COMPLETED,
        },
        _sum: { amount: true }
      }),

      // Test Statistics
      prisma.tests.count(),
      prisma.tests.count({
        where: { is_published: true }
      }),
      prisma.test_attempts.count(),
      prisma.test_attempts.count({
        where: { status: AttemptStatus.COMPLETED }
      }),

      // Appointment Statistics
      prisma.appointments.count(),
      prisma.appointments.count({
        where: {
          scheduled_date: { gte: new Date() },
          status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
        }
      }),
      prisma.appointments.count({
        where: { status: AppointmentStatus.COMPLETED }
      }),
      prisma.transactions.aggregate({
        where: {
          type: 'APPOINTMENT_BOOKING',
          status: TransactionStatus.COMPLETED,
        },
        _sum: { amount: true }
      }),

      // Revenue Statistics
      prisma.transactions.aggregate({
        where: { status: TransactionStatus.COMPLETED },
        _sum: { amount: true }
      }),
      prisma.transactions.aggregate({
        where: {
          status: TransactionStatus.COMPLETED,
          created_at: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      prisma.transactions.aggregate({
        where: {
          status: TransactionStatus.COMPLETED,
          created_at: { gte: startOfWeek }
        },
        _sum: { amount: true }
      }),

      // Content Statistics
      prisma.blog_posts.count(),
      prisma.blog_posts.count({
        where: { status: 'PUBLISHED' }
      }),
      prisma.testimonials.count(),

      // Recent Activities
      prisma.users.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
          role: true,
        }
      }),
      prisma.course_enrollments.findMany({
        take: 5,
        orderBy: { enrolled_at: 'desc' },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
            }
          },
          courses: {
            select: {
              title: true,
            }
          }
        }
      }),
      prisma.appointments.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
            }
          },
          consultants: {
            select: {
              name: true,
            }
          },
          appointment_types: {
            select: {
              name: true,
            }
          }
        }
      }),
      prisma.test_attempts.findMany({
        take: 5,
        orderBy: { started_at: 'desc' },
        where: { status: AttemptStatus.COMPLETED },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
            }
          },
          tests: {
            select: {
              title: true,
              type: true,
            }
          }
        }
      }),
    ])

    // Calculate growth rates
    const usersGrowthRate = newUsersThisMonth > 0 ?
      ((newUsersThisMonth / Math.max(totalUsers - newUsersThisMonth, 1)) * 100) : 0

    // Get monthly revenue trend (last 6 months)
    const revenueByMonth = await prisma.transactions.groupBy({
      by: ['created_at'],
      where: {
        status: TransactionStatus.COMPLETED,
        created_at: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      },
      _sum: { amount: true },
    })

    // Get enrollment trend (last 30 days)
    const enrollmentsByDay = await prisma.course_enrollments.groupBy({
      by: ['enrolled_at'],
      where: {
        enrolled_at: { gte: thirtyDaysAgo }
      },
      _count: { id: true },
    })

    // Top performing courses
    const topCourses = await prisma.courses.findMany({
      take: 5,
      orderBy: [
        { total_students: 'desc' },
        { rating: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        total_students: true,
        rating: true,
        price: true,
      }
    })

    // Top consultants
    const topConsultants = await prisma.consultants.findMany({
      take: 5,
      orderBy: [
        { rating: 'desc' },
        { total_reviews: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        rating: true,
        total_reviews: true,
        specialties: true,
      }
    })

    const response = {
      overview: {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
          newThisWeek: newUsersThisWeek,
          verified: verifiedUsers,
          growthRate: usersGrowthRate,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          enrollments: totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          revenue: revenueFromCourses._sum.amount || 0,
        },
        tests: {
          total: totalTests,
          published: publishedTests,
          attempts: totalTestAttempts,
          completed: completedTestAttempts,
          completionRate: totalTestAttempts > 0 ? (completedTestAttempts / totalTestAttempts) * 100 : 0,
        },
        appointments: {
          total: totalAppointments,
          upcoming: upcomingAppointments,
          completed: completedAppointments,
          revenue: revenueFromAppointments._sum.amount || 0,
        },
        revenue: {
          total: totalRevenue._sum?.amount || 0,
          thisMonth: revenueThisMonth._sum?.amount || 0,
          thisWeek: revenueThisWeek._sum?.amount || 0,
        },
        content: {
          blogPosts: totalBlogPosts,
          publishedPosts: publishedBlogPosts,
          testimonials: totalTestimonials,
        },
      },
      charts: {
        revenueByMonth: revenueByMonth.map(item => ({
          month: item.created_at,
          revenue: item._sum.amount || 0,
        })),
        enrollmentsByDay: enrollmentsByDay.map(item => ({
          date: item.enrolled_at,
          enrollments: item._count.id,
        })),
      },
      topPerformers: {
        courses: topCourses,
        consultants: topConsultants,
      },
      recentActivities: {
        users: recentUsers,
        enrollments: recentEnrollments.map(enrollment => ({
          id: enrollment.id,
          user: `${enrollment.users.first_name} ${enrollment.users.last_name}`,
          course: enrollment.courses.title,
          enrolledAt: enrollment.enrolled_at,
        })),
        appointments: recentAppointments.map(appointment => ({
          id: appointment.id,
          user: `${appointment.users.first_name} ${appointment.users.last_name}`,
          consultant: appointment.consultants.name,
          type: appointment.appointment_types.name,
          scheduledDate: appointment.scheduled_date,
          status: appointment.status,
        })),
        testAttempts: recentTestAttempts.map(attempt => ({
          id: attempt.id,
          user: `${attempt.users.first_name} ${attempt.users.last_name}`,
          test: `${attempt.tests.title} (${attempt.tests.type})`,
          score: attempt.score,
          completedAt: attempt.completed_at,
        })),
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get admin stats error:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}