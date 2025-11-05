"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, GraduationCap, FileText, Globe, CreditCard } from "lucide-react"

export function AppointmentTypes() {
  const appointmentTypes = [
    {
      id: "general",
      title: "General Consultation",
      description: "Overview of study abroad options and initial guidance",
      duration: "30 minutes",
      price: "Free",
      icon: Users,
      features: [
        "Country selection guidance",
        "University recommendations",
        "Application timeline",
        "Initial document checklist",
      ],
      popular: true,
    },
    {
      id: "university",
      title: "University Selection",
      description: "Detailed guidance on choosing the right universities",
      duration: "45 minutes",
      price: "$49",
      icon: GraduationCap,
      features: [
        "Personalized university list",
        "Program comparison",
        "Admission requirements",
        "Scholarship opportunities",
      ],
      popular: false,
    },
    {
      id: "application",
      title: "Application Review",
      description: "Complete review of your application documents",
      duration: "60 minutes",
      price: "$79",
      icon: FileText,
      features: ["SOP review and feedback", "Resume optimization", "Document verification", "Application strategy"],
      popular: false,
    },
    {
      id: "visa",
      title: "Visa Consultation",
      description: "Comprehensive visa application guidance",
      duration: "45 minutes",
      price: "$59",
      icon: Globe,
      features: ["Visa requirements overview", "Document preparation", "Interview preparation", "Timeline planning"],
      popular: false,
    },
    {
      id: "financial",
      title: "Financial Planning",
      description: "Budget planning and funding options",
      duration: "30 minutes",
      price: "$39",
      icon: CreditCard,
      features: ["Cost estimation", "Scholarship guidance", "Loan options", "Financial documentation"],
      popular: false,
    },
    {
      id: "comprehensive",
      title: "Comprehensive Package",
      description: "End-to-end guidance for your study abroad journey",
      duration: "90 minutes",
      price: "$149",
      icon: Users,
      features: ["All consultation types included", "Follow-up sessions", "Priority support", "Document templates"],
      popular: false,
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Consultation Type</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the consultation that best fits your needs. All sessions include personalized guidance and follow-up
            resources.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {appointmentTypes.map((type) => (
            <Card
              key={type.id}
              className={`relative hover:shadow-xl transition-shadow ${type.popular ? "ring-2 ring-primary" : ""}`}
            >
              {type.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <type.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-gray-900">{type.title}</CardTitle>
                <p className="text-gray-600 text-sm">{type.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{type.price}</div>
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {type.duration}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">What's included:</h4>
                  <ul className="space-y-2">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90">Book Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
