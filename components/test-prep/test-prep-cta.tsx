"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"

export function TestPrepCTA() {
  const features = [
    "AI-powered practice tests with instant feedback",
    "Detailed performance analytics and progress tracking",
    "Personalized study plans based on your weaknesses",
    "Expert-designed questions following latest exam patterns",
    "24/7 access to all practice materials and resources",
    "Certificate of completion for each test category",
  ]

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Achieve Your Target Score?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of successful students who achieved their dream scores with our comprehensive test
                preparation platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                {features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {features.slice(3).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline">
                  View Pricing Plans
                </Button>
              </div>
              <p className="text-sm text-gray-600">No credit card required • 7-day free trial • Cancel anytime</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
