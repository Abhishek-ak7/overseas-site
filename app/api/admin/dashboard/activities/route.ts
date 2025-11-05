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

    // Get recent activities from different sources
    const [
      recentEnrollments,
      recentAppointments,
      recentTransactions,
      recentUsers,
      recentCourses
    ] = await Promise.all([
      // Recent enrollments
      prisma.course_enrollments.findMany({
        take: 5,
        orderBy: { enrolled_at: 'desc' },
        include: {
          users: { select: { first_name: true, last_name: true, email: true } },
          courses: { select: { title: true } }
        }
      }),

      // Recent appointments
      prisma.appointments.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          users: { select: { first_name: true, last_name: true, email: true } },
          appointment_types: { select: { name: true } }
        }
      }),

      // Recent transactions
      prisma.transactions.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          users: { select: { first_name: true, last_name: true, email: true } },
          courses: { select: { title: true } }
        }
      }),

      // Recent users
      prisma.users.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
          is_verified: true
        }
      }),

      // Recently published courses
      prisma.courses.findMany({
        take: 3,
        where: { is_published: true },
        orderBy: { updated_at: 'desc' },
        select: {
          id: true,
          title: true,
          instructor_name: true,
          updated_at: true,
          total_students: true
        }
      })
    ])

    // Format activities
    const activities: any[] = []

    // Add enrollment activities
    recentEnrollments.forEach(enrollment => {
      activities.push({
        id: `enrollment-${enrollment.id}`,
        type: 'enrollment' as const,
        title: 'New Course Enrollment',
        description: `${enrollment.users.first_name} ${enrollment.users.last_name} enrolled in ${enrollment.courses.title}`,
        timestamp: enrollment.enrolled_at.toISOString(),
        status: 'success' as const
      })
    })

    // Add appointment activities
    recentAppointments.forEach(appointment => {
      activities.push({
        id: `appointment-${appointment.id}`,
        type: 'appointment' as const,
        title: 'New Appointment Booked',
        description: `${appointment.users.first_name} ${appointment.users.last_name} booked ${appointment.appointment_types.name}`,
        timestamp: appointment.created_at.toISOString(),
        status: appointment.status === 'SCHEDULED' ? 'pending' as const :
               appointment.status === 'COMPLETED' ? 'success' as const :
               appointment.status === 'CANCELLED' ? 'error' as const : 'warning' as const
      })
    })

    // Add payment activities
    recentTransactions.forEach(transaction => {
      const userName = transaction.users ? `${transaction.users.first_name} ${transaction.users.last_name}` : 'Unknown User'
      const courseName = transaction.courses?.title || 'Service'

      activities.push({
        id: `payment-${transaction.id}`,
        type: 'payment' as const,
        title: transaction.status === 'COMPLETED' ? 'Payment Received' : 'Payment Processing',
        description: `₹${transaction.amount} from ${userName} for ${courseName}`,
        timestamp: transaction.created_at.toISOString(),
        status: transaction.status === 'COMPLETED' ? 'success' as const :
               transaction.status === 'PENDING' ? 'pending' as const :
               transaction.status === 'FAILED' ? 'error' as const : 'warning' as const
      })
    })

    // Add user registration activities
    recentUsers.forEach(newUser => {
      activities.push({
        id: `user-${newUser.id}`,
        type: 'user' as const,
        title: 'New User Registration',
        description: `${newUser.first_name} ${newUser.last_name} (${newUser.email}) joined the platform`,
        timestamp: newUser.created_at.toISOString(),
        status: newUser.is_verified ? 'success' as const : 'pending' as const
      })
    })

    // Add course activities
    recentCourses.forEach(course => {
      activities.push({
        id: `course-${course.id}`,
        type: 'course' as const,
        title: 'Course Updated',
        description: `${course.title} by ${course.instructor_name} was updated (${course.total_students} students)`,
        timestamp: course.updated_at.toISOString(),
        status: 'success' as const
      })
    })

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return the latest 20 activities
    return NextResponse.json(activities.slice(0, 20))

  } catch (error) {
    console.error('Dashboard activities error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activities' },
      { status: 500 }
    )
  }
}