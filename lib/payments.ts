import Stripe from 'stripe'
import Razorpay from 'razorpay'
import { getPaymentSettings } from './settings'

// Create Stripe client with dynamic settings
export async function createStripeClient(): Promise<Stripe | null> {
  try {
    const paymentSettings = await getPaymentSettings()

    if (!paymentSettings.enableStripe || !paymentSettings.stripeSecretKey) {
      return null
    }

    return new Stripe(paymentSettings.stripeSecretKey, {
      apiVersion: '2024-06-20',
    })
  } catch (error) {
    console.error('Failed to create Stripe client with database settings, falling back to env vars:', error)

    // Fallback to environment variables
    return process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    }) : null
  }
}

// Create Razorpay client with dynamic settings
export async function createRazorpayClient(): Promise<Razorpay | null> {
  try {
    const paymentSettings = await getPaymentSettings()

    if (!paymentSettings.enableRazorpay || !paymentSettings.razorpayKeyId || !paymentSettings.razorpayKeySecret) {
      return null
    }

    return new Razorpay({
      key_id: paymentSettings.razorpayKeyId,
      key_secret: paymentSettings.razorpayKeySecret,
    })
  } catch (error) {
    console.error('Failed to create Razorpay client with database settings, falling back to env vars:', error)

    // Fallback to environment variables
    return (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    }) : null
  }
}

// Legacy configurations for backward compatibility (deprecated)
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
}) : null

export const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null

// Payment method types
export enum PaymentMethod {
  STRIPE = 'stripe',
  RAZORPAY = 'razorpay',
  PAYPAL = 'paypal',
}

// Payment status types
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Payment intent creation for Stripe
export async function createStripePaymentIntent({
  amount,
  currency = 'usd',
  metadata = {},
}: {
  amount: number
  currency?: string
  metadata?: Record<string, string>
}) {
  try {
    // Get dynamic Stripe client
    const stripeClient = await createStripeClient()

    if (!stripeClient) {
      return {
        success: false,
        error: 'Stripe not configured or disabled',
      }
    }

    // Get payment settings for default currency
    const paymentSettings = await getPaymentSettings()
    const defaultCurrency = currency || paymentSettings.defaultCurrency?.toLowerCase() || 'usd'

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: defaultCurrency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error)
    return {
      success: false,
      error: 'Failed to create payment intent',
    }
  }
}

// Payment order creation for Razorpay
export async function createRazorpayOrder({
  amount,
  currency = 'INR',
  receipt,
  notes = {},
}: {
  amount: number
  currency?: string
  receipt: string
  notes?: Record<string, string>
}) {
  try {
    // Get dynamic Razorpay client
    const razorpayClient = await createRazorpayClient()

    if (!razorpayClient) {
      return {
        success: false,
        error: 'Razorpay not configured or disabled',
      }
    }

    // Get payment settings for default currency
    const paymentSettings = await getPaymentSettings()
    const defaultCurrency = currency || paymentSettings.defaultCurrency || 'INR'

    const order = await razorpayClient.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: defaultCurrency,
      receipt,
      notes,
    })

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    }
  } catch (error) {
    console.error('Razorpay order creation failed:', error)
    return {
      success: false,
      error: 'Failed to create payment order',
    }
  }
}

// Verify Stripe webhook signature
export async function verifyStripeWebhook(payload: string, signature: string): Promise<boolean> {
  try {
    const stripeClient = await createStripeClient()
    if (!stripeClient || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook verification failed: Not configured')
      return false
    }
    stripeClient.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)
    return true
  } catch (error) {
    console.error('Stripe webhook verification failed:', error)
    return false
  }
}

// Verify Razorpay payment signature
export async function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}): Promise<boolean> {
  try {
    const paymentSettings = await getPaymentSettings()
    const keySecret = paymentSettings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      console.error('Razorpay key secret not configured')
      return false
    }

    const crypto = require('crypto')
    const text = orderId + '|' + paymentId
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex')

    return generated_signature === signature
  } catch (error) {
    console.error('Razorpay signature verification failed:', error)
    return false
  }
}

// Process refund for Stripe
export async function processStripeRefund({
  paymentIntentId,
  amount,
  reason,
}: {
  paymentIntentId: string
  amount?: number
  reason?: string
}) {
  try {
    const stripeClient = await createStripeClient()

    if (!stripeClient) {
      return {
        success: false,
        error: 'Stripe not configured or disabled',
      }
    }

    const refund = await stripeClient.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as any,
    })

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    }
  } catch (error) {
    console.error('Stripe refund failed:', error)
    return {
      success: false,
      error: 'Failed to process refund',
    }
  }
}

// Process refund for Razorpay
export async function processRazorpayRefund({
  paymentId,
  amount,
  notes,
}: {
  paymentId: string
  amount?: number
  notes?: Record<string, string>
}) {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: 'Razorpay not configured',
      }
    }

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined,
      notes,
    })

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    }
  } catch (error) {
    console.error('Razorpay refund failed:', error)
    return {
      success: false,
      error: 'Failed to process refund',
    }
  }
}

// Get payment method based on currency or user preference
export function getRecommendedPaymentMethod(currency: string, country?: string): PaymentMethod {
  // Recommend Razorpay for Indian users and INR currency
  if (currency === 'INR' || country === 'IN') {
    return PaymentMethod.RAZORPAY
  }

  // Default to Stripe for international payments
  return PaymentMethod.STRIPE
}

// Format amount for display
export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Validate payment amount
export function validatePaymentAmount(amount: number, currency: string): boolean {
  // Minimum amounts based on payment provider requirements
  const minimumAmounts: Record<string, number> = {
    USD: 0.50,
    EUR: 0.50,
    GBP: 0.30,
    INR: 1.00,
  }

  const minimum = minimumAmounts[currency] || 0.50
  return amount >= minimum
}