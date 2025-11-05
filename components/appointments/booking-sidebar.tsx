"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, Calendar, Video, Shield, Headphones } from "lucide-react"

export function BookingSidebar() {
  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Type:</span>
              <Badge variant="outline">General (Free)</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">30 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Meeting Type:</span>
              <span className="font-medium">Video Call</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">Not selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">Not selected</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-primary">Free</span>
          </div>
        </CardContent>
      </Card>

      {/* What to Expect */}
      <Card>
        <CardHeader>
          <CardTitle>What to Expect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">Personalized Guidance</div>
              <div className="text-sm text-gray-600">Tailored advice based on your goals and background</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">Detailed Action Plan</div>
              <div className="text-sm text-gray-600">Step-by-step roadmap for your study abroad journey</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">Follow-up Resources</div>
              <div className="text-sm text-gray-600">Access to templates, checklists, and guides</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Headphones className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-gray-900">24/7 Support</div>
              <div className="text-sm text-gray-600">support@bnoverseas.com</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Video className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Technical Help</div>
              <div className="text-sm text-gray-600">Video call setup assistance</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Secure & Private</div>
              <div className="text-sm text-gray-600">Your information is protected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Cancellation Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Free cancellation up to 24 hours before your appointment</p>
            <p>• Rescheduling available up to 2 hours before the session</p>
            <p>• No-show appointments may incur a fee for paid consultations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
