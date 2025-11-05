"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, CreditCard, Video } from "lucide-react"

export function BookingProcess() {
  const steps = [
    {
      step: 1,
      title: "Choose Consultation Type",
      description: "Select the type of consultation that best fits your needs and goals.",
      icon: CheckCircle,
      details: [
        "Browse available consultation types",
        "Compare features and pricing",
        "Read consultant specializations",
      ],
    },
    {
      step: 2,
      title: "Select Consultant & Time",
      description: "Pick your preferred consultant and choose a convenient time slot.",
      icon: Calendar,
      details: [
        "View consultant profiles and ratings",
        "Check available time slots",
        "Choose online or in-person meeting",
      ],
    },
    {
      step: 3,
      title: "Complete Payment",
      description: "Secure your booking with our safe and encrypted payment system.",
      icon: CreditCard,
      details: ["Multiple payment options available", "Secure SSL encryption", "Instant booking confirmation"],
    },
    {
      step: 4,
      title: "Attend Your Session",
      description: "Join your consultation and get expert guidance for your study abroad journey.",
      icon: Video,
      details: ["Receive meeting link via email", "Get personalized action plan", "Access to follow-up resources"],
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Book your consultation in just 4 simple steps. Our streamlined process ensures you get the guidance you need
            quickly and efficiently.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={step.step} className="relative hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center p-0">
                    {step.step}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-gray-900">{step.title}</CardTitle>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300 transform -translate-y-1/2" />
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg p-8 max-w-2xl mx-auto shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of students who have successfully achieved their study abroad dreams with our expert
              guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-gray-600">Students Helped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-gray-600">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
