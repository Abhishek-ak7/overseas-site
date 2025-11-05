"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Users, Star } from "lucide-react"

export function TestCategories() {
  const categories = [
    {
      id: "ielts",
      name: "IELTS",
      description: "International English Language Testing System",
      tests: 150,
      students: "25K+",
      rating: 4.8,
      duration: "2h 45m",
      sections: ["Listening", "Reading", "Writing", "Speaking"],
      image: "/placeholder-qazek.png",
      popular: true,
    },
    {
      id: "toefl",
      name: "TOEFL",
      description: "Test of English as a Foreign Language",
      tests: 120,
      students: "18K+",
      rating: 4.7,
      duration: "3h 30m",
      sections: ["Reading", "Listening", "Speaking", "Writing"],
      image: "/placeholder-8m88b.png",
      popular: false,
    },
    {
      id: "pte",
      name: "PTE Academic",
      description: "Pearson Test of English Academic",
      tests: 100,
      students: "12K+",
      rating: 4.6,
      duration: "2h 15m",
      sections: ["Speaking", "Writing", "Reading", "Listening"],
      image: "/placeholder-eqnv0.png",
      popular: false,
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Test Preparation</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive preparation materials for all major English proficiency tests with AI-powered practice and
            detailed analytics.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card key={category.id} className="relative hover:shadow-xl transition-shadow">
              {category.popular && <Badge className="absolute -top-3 left-6 bg-primary text-white">Most Popular</Badge>}

              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold">{category.rating}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 mb-2">{category.name}</CardTitle>
                    <p className="text-gray-600">{category.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{category.tests} Tests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{category.students} Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{category.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{category.rating} Rating</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">Test Sections:</div>
                    <div className="flex flex-wrap gap-2">
                      {category.sections.map((section) => (
                        <Badge key={section} variant="outline" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1 bg-primary hover:bg-primary/90">Start Practice</Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
