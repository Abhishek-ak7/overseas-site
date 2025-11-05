import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    // Fetch user statistics
    const [totalUsers, newUsersThisMonth, newUsersLastMonth, activeUsers] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({
        where: {
          created_at: {
            gte: startOfMonth
          }
        }
      }),
      prisma.users.count({
        where: {
          created_at: {
            gte: startOfLastMonth,
            lt: startOfMonth
          }
        }
      }),
      prisma.users.count({
        where: {
          last_login: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ])

    // Calculate user growth
    const userGrowth = newUsersLastMonth > 0
      ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
      : 100

    // Fetch course statistics
    const [totalCourses, publishedCourses, totalEnrollments, courseRevenue] = await Promise.all([
      prisma.courses.count(),
      prisma.courses.count({
        where: { is_published: true }
      }),
      prisma.course_enrollments.count(),
      prisma.transactions.aggregate({
        where: {
          type: 'COURSE_PURCHASE',
          status: 'COMPLETED',
          created_at: {
            gte: startOfMonth
          }
        },
        _sum: {
          amount: true
        }
      })
    ])

    // Fetch appointment statistics
    const [appointmentsToday, pendingAppointments, completedAppointments, cancelledAppointments] = await Promise.all([
      prisma.appointments.count({
        where: {
          scheduled_date: {
            gte: startOfToday,
            lt: endOfToday
          }
        }
      }),
      prisma.appointments.count({
        where: {
          status: 'SCHEDULED'
        }
      }),
      prisma.appointments.count({
        where: {
          status: 'COMPLETED',
          scheduled_date: {
            gte: startOfMonth
          }
        }
      }),
      prisma.appointments.count({
        where: {
          status: 'CANCELLED',
          scheduled_date: {
            gte: startOfMonth
          }
        }
      })
    ])

    // Fetch revenue statistics
    const [totalRevenue, monthlyRevenue, lastMonthRevenue, transactionCount] = await Promise.all([
      prisma.transactions.aggregate({
        where: {
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),
      prisma.transactions.aggregate({
        where: {
          status: 'COMPLETED',
          created_at: {
            gte: startOfMonth
          }
        },
        _sum: {
          amount: true
        }
      }),
      prisma.transactions.aggregate({
        where: {
          status: 'COMPLETED',
          created_at: {
            gte: startOfLastMonth,
            lt: startOfMonth
          }
        },
        _sum: {
          amount: true
        }
      }),
      prisma.transactions.count({
        where: {
          created_at: {
            gte: startOfMonth
          }
        }
      })
    ])

    // Calculate revenue growth
    const currentMonthRevenue = monthlyRevenue._sum?.amount?.toNumber() || 0
    const lastMonthRevenueAmount = lastMonthRevenue._sum?.amount?.toNumber() || 0
    const revenueGrowth = lastMonthRevenueAmount > 0
      ? Math.round(((currentMonthRevenue - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100)
      : 100

    // Fetch test prep statistics
    const [totalTests, testAttempts, avgScoreResult, completionRate] = await Promise.all([
      prisma.tests.count(),
      prisma.test_attempts.count({
        where: {
          started_at: {
            gte: startOfMonth
          }
        }
      }),
      prisma.test_attempts.aggregate({
        where: {
          status: 'COMPLETED',
          started_at: {
            gte: startOfMonth
          }
        },
        _avg: {
          score: true
        }
      }),
      prisma.test_attempts.count({
        where: {
          status: 'COMPLETED',
          started_at: {
            gte: startOfMonth
          }
        }
      })
    ])

    const avgScore = avgScoreResult._avg?.score || 0
    const totalAttempts = await prisma.test_attempts.count({
      where: {
        started_at: {
          gte: startOfMonth
        }
      }
    })
    const completionPercentage = totalAttempts > 0 ? Math.round((completionRate / totalAttempts) * 100) : 0

    const stats = {
      users: {
        total: totalUsers,
        new: newUsersThisMonth,
        active: activeUsers,
        growth: userGrowth
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        enrollments: totalEnrollments,
        revenue: courseRevenue._sum?.amount?.toNumber() || 0
      },
      appointments: {
        today: appointmentsToday,
        pending: pendingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments
      },
      revenue: {
        total: totalRevenue._sum?.amount?.toNumber() || 0,
        monthly: currentMonthRevenue,
        growth: revenueGrowth,
        transactions: transactionCount
      },
      testPrep: {
        tests: totalTests,
        attempts: testAttempts,
        avgScore: Math.round(avgScore),
        completionRate: completionPercentage
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}