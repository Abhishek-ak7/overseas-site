import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { testPaymentConfiguration } from '@/lib/settings'
import { createStripeClient, createRazorpayClient } from '@/lib/payments'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Verify admin access
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { gateway } = body

    if (!gateway || !['razorpay', 'stripe', 'paypal'].includes(gateway)) {
      return NextResponse.json(
        { error: 'Invalid payment gateway. Must be razorpay, stripe, or paypal' },
        { status: 400 }
      )
    }

    // Test payment configuration first
    const configResult = await testPaymentConfiguration(gateway)
    if (!configResult.success) {
      return NextResponse.json(
        { error: configResult.error },
        { status: 400 }
      )
    }

    // Test actual connection based on gateway
    try {
      switch (gateway) {
        case 'stripe':
          const stripeClient = await createStripeClient()
          if (!stripeClient) {
            return NextResponse.json(
              { error: 'Stripe client could not be created' },
              { status: 400 }
            )
          }

          // Test Stripe connection by listing payment methods (this will fail if credentials are invalid)
          await stripeClient.paymentMethods.list({ limit: 1 })

          return NextResponse.json({
            success: true,
            message: 'Stripe connection tested successfully'
          })

        case 'razorpay':
          const razorpayClient = await createRazorpayClient()
          if (!razorpayClient) {
            return NextResponse.json(
              { error: 'Razorpay client could not be created' },
              { status: 400 }
            )
          }

          // Test Razorpay connection by listing orders (this will fail if credentials are invalid)
          await razorpayClient.orders.all({ count: 1 })

          return NextResponse.json({
            success: true,
            message: 'Razorpay connection tested successfully'
          })

        case 'paypal':
          // PayPal implementation would go here
          return NextResponse.json({
            success: true,
            message: 'PayPal configuration appears valid (full test not implemented)'
          })

        default:
          return NextResponse.json(
            { error: 'Unsupported payment gateway' },
            { status: 400 }
          )
      }
    } catch (connectionError) {
      console.error(`${gateway} connection test failed:`, connectionError)
      return NextResponse.json(
        { error: `${gateway} connection test failed: ${connectionError instanceof Error ? connectionError.message : 'Unknown error'}` },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Payment test error:', error)
    return NextResponse.json(
      { error: 'Failed to test payment configuration' },
      { status: 500 }
    )
  }
}