import Razorpay from 'razorpay'
import crypto from 'crypto'
import { getStorageSettings } from './settings'

export interface RazorpayOrderData {
  amount: number // in paise (INR)
  currency: string
  receipt: string
  notes?: Record<string, string>
}

export interface RazorpayVerifyData {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

let razorpayInstance: Razorpay | null = null

async function getRazorpayInstance() {
  if (razorpayInstance) {
    return razorpayInstance
  }

  try {
    const settings = await getStorageSettings()

    // Try to get Razorpay credentials from settings
    const keyId = process.env.RAZORPAY_KEY_ID || settings.razorpayKeyId
    const keySecret = process.env.RAZORPAY_KEY_SECRET || settings.razorpayKeySecret

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured')
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    return razorpayInstance
  } catch (error) {
    console.error('Failed to initialize Razorpay:', error)
    throw new Error('Razorpay not configured properly')
  }
}

export async function createRazorpayOrder(orderData: RazorpayOrderData) {
  try {
    const razorpay = await getRazorpayInstance()

    const order = await razorpay.orders.create({
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      notes: orderData.notes,
    })

    return {
      success: true,
      order,
    }
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment order',
    }
  }
}

export async function verifyRazorpaySignature(data: RazorpayVerifyData): Promise<boolean> {
  try {
    const settings = await getStorageSettings()
    const keySecret = process.env.RAZORPAY_KEY_SECRET || settings.razorpayKeySecret

    if (!keySecret) {
      throw new Error('Razorpay key secret not found')
    }

    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest('hex')

    return generated_signature === data.razorpay_signature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function fetchRazorpayPayment(paymentId: string) {
  try {
    const razorpay = await getRazorpayInstance()
    const payment = await razorpay.payments.fetch(paymentId)

    return {
      success: true,
      payment,
    }
  } catch (error) {
    console.error('Failed to fetch payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment',
    }
  }
}

export async function refundRazorpayPayment(paymentId: string, amount?: number) {
  try {
    const razorpay = await getRazorpayInstance()

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount, // If amount not provided, full refund
    })

    return {
      success: true,
      refund,
    }
  } catch (error) {
    console.error('Refund error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process refund',
    }
  }
}
