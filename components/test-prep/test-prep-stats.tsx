"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Award, Clock, Target } from "lucide-react"

export function TestPrepStats() {
  const stats = [
    {
      icon: TrendingUp,
      value: "8.5",
      label: "Average IELTS Score",
      description: "Our students achieve",
    },
    {
      icon: Award,
      value: "95%",
      label: "Success Rate",
      description: "Students pass on first attempt",
    },
    {
      icon: Clock,
      value: "30 Days",
      label: "Average Prep Time",
      description: "To achieve target scores",
    },
    {
      icon: Target,
      value: "100+",
      label: "Mock Tests",
      description: "Available for each exam",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Proven Results That Speak for Themselves</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of successful students who achieved their dream scores with our comprehensive test
            preparation platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
