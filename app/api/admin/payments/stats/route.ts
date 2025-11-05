import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/payments/stats - Get payment statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      refundedTransactions,
      revenueResult,
      refundResult,
    ] = await Promise.all([
      prisma.transactions.count(),
      prisma.transactions.count({ where: { status: 'COMPLETED' } }),
      prisma.transactions.count({ where: { status: 'PENDING' } }),
      prisma.transactions.count({ where: { status: 'FAILED' } }),
      prisma.transactions.count({ where: { status: 'REFUNDED' } }),
      prisma.transactions.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transactions.aggregate({
        where: { status: 'REFUNDED' },
        _sum: { refund_amount: true },
      }),
    ])

    const totalRevenue = revenueResult._sum.amount
      ? parseFloat(revenueResult._sum.amount.toString())
      : 0

    const refundedAmount = refundResult._sum.refund_amount
      ? parseFloat(refundResult._sum.refund_amount.toString())
      : 0

    const averageTransactionValue = completedTransactions > 0
      ? totalRevenue / completedTransactions
      : 0

    const conversionRate = totalTransactions > 0
      ? (completedTransactions / totalTransactions) * 100
      : 0

    return NextResponse.json({
      totalRevenue,
      totalTransactions,
      successfulTransactions: completedTransactions,
      failedTransactions,
      pendingTransactions,
      refundedAmount,
      averageTransactionValue,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return NextResponse.json({ error: 'Failed to fetch payment stats' }, { status: 500 })
  }
}
