'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'

interface CoursePaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: {
    id: string
    title: string
    price: number
    currency: string
  }
  onSuccess?: () => void
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}

export function CoursePaymentModal({ open, onOpenChange, course, onSuccess }: CoursePaymentModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    try {
      setLoading(true)
      setPaymentStatus('processing')

      // Create payment order
      const orderResponse = await fetch(`/api/courses/${course.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || 'Failed to create payment order')
      }

      const orderData = await orderResponse.json()

      if (orderData.payment.gateway === 'razorpay') {
        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript()

        if (!scriptLoaded) {
          throw new Error('Failed to load Razorpay SDK')
        }

        // Get user details for prefill
        const userResponse = await fetch('/api/auth/session')
        const userData = await userResponse.json()

        const options = {
          key: orderData.payment.keyId,
          amount: orderData.payment.amount,
          currency: orderData.payment.currency,
          name: 'BnOverseas',
          description: `Payment for ${course.title}`,
          order_id: orderData.payment.orderId,
          prefill: {
            name: userData.user ? `${userData.user.first_name} ${userData.user.last_name}` : '',
            email: userData.user?.email || '',
            contact: userData.user?.phone || '',
          },
          theme: {
            color: '#E31E24'
          },
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch(`/api/courses/${course.id}/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  paymentId: orderData.payment.paymentId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              })

              const verifyData = await verifyResponse.json()

              if (verifyData.success) {
                setPaymentStatus('success')
                toast({
                  title: 'Success!',
                  description: 'Payment successful. You are now enrolled in the course!',
                })

                setTimeout(() => {
                  onSuccess?.()
                  router.push(verifyData.courseUrl || `/courses/${course.id}/learn`)
                }, 1500)
              } else {
                throw new Error(verifyData.error || 'Payment verification failed')
              }
            } catch (error) {
              console.error('Payment verification error:', error)
              setPaymentStatus('failed')
              toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Payment verification failed',
                variant: 'destructive',
              })
            }
          },
          modal: {
            ondismiss: function() {
              setLoading(false)
              setPaymentStatus('idle')
            }
          }
        }

        const paymentObject = new window.Razorpay(options)
        paymentObject.open()

      } else if (orderData.payment.gateway === 'stripe') {
        // Handle Stripe payment
        toast({
          title: 'Info',
          description: 'Stripe payment integration coming soon',
        })
      }

    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('failed')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process payment',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            You're purchasing access to {course.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Course Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Course</span>
              <span className="font-medium">{course.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Price</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(course.price, course.currency)}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus === 'processing' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Processing your payment... Please don't close this window.
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Payment successful! Redirecting to course...
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'failed' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Payment failed. Please try again or contact support.
              </AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              🔒 Secure payment powered by Razorpay. Your payment information is encrypted and secure.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading || paymentStatus === 'success'}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handlePayment}
              disabled={loading || paymentStatus === 'success'}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {formatPrice(course.price, course.currency)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
