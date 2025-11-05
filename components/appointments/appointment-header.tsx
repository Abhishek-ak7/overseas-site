"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Video } from "lucide-react"

export function AppointmentHeader() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          <Badge variant="outline" className="text-primary border-primary">
            Expert Consultation
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Book Your <span className="text-primary">Study Abroad</span> Consultation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get personalized guidance from our certified education consultants. Choose from various consultation types
            and book at your convenience.
          </p>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Consultants</h3>
              <p className="text-sm text-gray-600">Certified professionals with 10+ years experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
              <p className="text-sm text-gray-600">Book appointments that fit your schedule</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Online & Offline</h3>
              <p className="text-sm text-gray-600">Choose video calls or in-person meetings</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-sm text-gray-600">Get confirmation within 2 hours</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Book Free Consultation
            </Button>
            <Button size="lg" variant="outline">
              View Available Slots
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
