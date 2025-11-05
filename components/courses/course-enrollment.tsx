"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, Download, Combine as Mobile, Infinity, Award, Users, Clock, Calendar, Heart, Share2, Loader2, CheckCircle } from "lucide-react"
import { CoursePaymentModal } from "./course-payment-modal"

interface Course {
  id: string
  title: string
  price: number
  originalPrice?: number
  currency: string
  duration: number
  level: string
  category: {
    name: string
  }
  instructorName: string
  totalStudents: number
  isEnrolled: boolean
  enrollment?: {
    progress: number
    enrolledAt: string
    status: string
  }
  updatedAt: string
}

interface CourseEnrollmentProps {
  course: Course
}

export function CourseEnrollment({ course }: CourseEnrollmentProps) {
  const router = useRouter()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const currencySymbol = course.currency === 'INR' ? '₹' : '$'

  const handleEnroll = async () => {
    try {
      setEnrolling(true)
      setError(null)

      // Check if user is logged in first
      const authCheck = await fetch('/api/auth/session')
      if (!authCheck.ok || !(await authCheck.json()).user) {
        router.push(`/auth/login?returnTo=/courses/${course.id}`)
        return
      }

      // For free courses, enroll directly
      if (course.price === 0) {
        const response = await fetch(`/api/courses/${course.id}/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to enroll in course')
        }

        window.location.reload()
        return
      }

      // For paid courses, show payment modal
      setShowPaymentModal(true)
      setEnrolling(false)
    } catch (error) {
      console.error('Enrollment error:', error)
      setError(error instanceof Error ? error.message : 'Failed to enroll in course')
      setEnrolling(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    window.location.reload()
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // TODO: Implement wishlist API
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: course.title,
        text: `Check out this course: ${course.title}`,
        url: window.location.href,
      })
    } catch (error) {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Modal */}
      <CoursePaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        course={{
          id: course.id,
          title: course.title,
          price: course.price,
          currency: course.currency,
        }}
        onSuccess={handlePaymentSuccess}
      />

      {/* Pricing Card */}
      <Card className="sticky top-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            {course.isEnrolled ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-lg font-semibold">Enrolled</span>
                </div>
                {course.enrollment && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${course.enrollment.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium">{course.enrollment.progress}% Complete</div>
                  </div>
                )}
                <Button
                  onClick={() => router.push(`/learn/courses/${course.id}`)}
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 mt-4"
                >
                  Continue Learning
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{currencySymbol}{course.price.toLocaleString()}</div>
                {course.originalPrice && (
                  <>
                    <div className="text-lg text-gray-500 line-through">{currencySymbol}{course.originalPrice.toLocaleString()}</div>
                    <Badge variant="destructive" className="mt-2">
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
            )}

            {!course.isEnrolled && (
              <>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
                )}

                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-3"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </Button>
              </>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={handleWishlist}>
                <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? "fill-current text-red-500" : ""}`} />
                Wishlist
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {!course.isEnrolled && (
              <div className="text-center text-sm text-gray-600">30-day money-back guarantee</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Includes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">This course includes:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Play className="h-5 w-5 text-gray-600" />
            <span className="text-sm">21 hours on-demand video</span>
          </div>
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-gray-600" />
            <span className="text-sm">Downloadable resources</span>
          </div>
          <div className="flex items-center gap-3">
            <Mobile className="h-5 w-5 text-gray-600" />
            <span className="text-sm">Access on mobile and TV</span>
          </div>
          <div className="flex items-center gap-3">
            <Infinity className="h-5 w-5 text-gray-600" />
            <span className="text-sm">Full lifetime access</span>
          </div>
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-gray-600" />
            <span className="text-sm">Certificate of completion</span>
          </div>
        </CardContent>
      </Card>

      {/* Course Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Students Enrolled</span>
            </div>
            <span className="font-semibold">{course.totalStudents.toLocaleString()}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Duration</span>
            </div>
            <span className="font-semibold">{course.duration}h</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Last Updated</span>
            </div>
            <span className="font-semibold">{new Date(course.updatedAt).toLocaleDateString()}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Level</span>
            </div>
            <Badge variant="outline">{course.level}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Related Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Related</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => router.push(`/courses?category=${course.category.name}`)}
          >
            View all {course.category.name} courses
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => router.push(`/courses?instructor=${course.instructorName}`)}
          >
            More by {course.instructorName}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => router.push('/courses')}
          >
            Browse all courses
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
