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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7))

    // Get comprehensive appointment statistics
    const [
      totalAppointments,
      todayAppointments,
      weekAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments,
      totalRevenue,
      averageRatingResult,
      appointmentsByStatus,
      appointmentsByType,
      recentAppointments
    ] = await Promise.all([
      // Total appointments
      prisma.appointments.count(),

      // Today's appointments
      prisma.appointments.count({
        where: {
          scheduled_date: {
            gte: startOfToday,
            lt: endOfToday
          }
        }
      }),

      // This week's appointments
      prisma.appointments.count({
        where: {
          scheduled_date: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      }),

      // Scheduled appointments
      prisma.appointments.count({
        where: {
          status: {
            in: ['SCHEDULED', 'CONFIRMED']
          }
        }
      }),

      // Completed appointments
      prisma.appointments.count({
        where: { status: 'COMPLETED' }
      }),

      // Cancelled appointments
      prisma.appointments.count({
        where: {
          status: {
            in: ['CANCELLED', 'NO_SHOW']
          }
        }
      }),

      // Total revenue from completed appointments
      prisma.transactions.aggregate({
        where: {
          type: 'APPOINTMENT_BOOKING',
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),

      // Average rating from completed appointments
      prisma.appointments.aggregate({
        where: {
          status: 'COMPLETED',
          rating: { not: null }
        },
        _avg: { rating: true }
      }),

      // Appointments by status
      prisma.appointments.groupBy({
        by: ['status'],
        _count: { status: true }
      }),

      // Appointments by type
      prisma.appointments.groupBy({
        by: ['type_id'],
        _count: { type_id: true },
        orderBy: { _count: { type_id: 'desc' } },
        take: 5
      }),

      // Recent appointments
      prisma.appointments.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true
            }
          },
          consultants: {
            select: {
              name: true
            }
          },
          appointment_types: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    // Get appointment type names for statistics
    const typeIds = appointmentsByType.map(stat => stat.type_id)
    const appointmentTypes = await prisma.appointment_types.findMany({
      where: { id: { in: typeIds } },
      select: { id: true, name: true }
    })

    const stats = {
      total: totalAppointments,
      today: todayAppointments,
      thisWeek: weekAppointments,
      scheduled: scheduledAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      revenue: totalRevenue._sum.amount?.toNumber() || 0,
      averageRating: Number(averageRatingResult._avg.rating?.toFixed(1)) || 0,
      byStatus: appointmentsByStatus.map(stat => ({
        status: stat.status,
        count: stat._count.status
      })),
      byType: appointmentsByType.map(stat => {
        const type = appointmentTypes.find(t => t.id === stat.type_id)
        return {
          typeName: type?.name || 'Unknown',
          count: stat._count.type_id
        }
      }),
      recent: recentAppointments.map(appointment => ({
        id: appointment.id,
        studentName: `${appointment.users.first_name} ${appointment.users.last_name}`,
        consultantName: appointment.consultants.name,
        typeName: appointment.appointment_types.name,
        scheduledDate: appointment.scheduled_date.toISOString(),
        status: appointment.status,
        createdAt: appointment.created_at.toISOString()
      }))
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Appointment stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment statistics' },
      { status: 500 }
    )
  }
}