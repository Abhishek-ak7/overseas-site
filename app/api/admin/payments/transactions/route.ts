import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/payments/transactions - Get all transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transactions = await prisma.transactions.findMany({
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        courses: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Format transactions for frontend
    const formattedTransactions = transactions.map((txn) => ({
      id: txn.id,
      user: {
        name: `${txn.users.first_name} ${txn.users.last_name}`,
        email: txn.users.email,
      },
      amount: parseFloat(txn.amount.toString()),
      currency: txn.currency,
      status: txn.status.toLowerCase(),
      paymentMethod: txn.payment_method || 'Unknown',
      gateway: txn.payment_gateway || 'Unknown',
      description: txn.description || (txn.courses ? txn.courses.title : 'Unknown'),
      createdAt: txn.created_at.toISOString(),
      completedAt: txn.status === 'COMPLETED' ? txn.updated_at.toISOString() : undefined,
      refundedAt: txn.status === 'REFUNDED' ? txn.updated_at.toISOString() : undefined,
      gatewayTransactionId: txn.reference_id,
    }))

    return NextResponse.json({ transactions: formattedTransactions }, { status: 200 })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
