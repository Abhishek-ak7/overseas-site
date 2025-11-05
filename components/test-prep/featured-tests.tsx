"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star, Play, BookOpen } from "lucide-react"

export function FeaturedTests() {
  const featuredTests = [
    {
      id: 1,
      title: "IELTS Academic Full Mock Test",
      description: "Complete 4-section practice test with detailed scoring and feedback",
      type: "IELTS",
      difficulty: "Intermediate",
      duration: "2h 45m",
      questions: 40,
      attempts: "12.5K",
      rating: 4.9,
      price: "Free",
      image: "/placeholder-do7dc.png",
    },
    {
      id: 2,
      title: "TOEFL iBT Practice Test",
      description: "Adaptive practice test with real exam interface and timing",
      type: "TOEFL",
      difficulty: "Advanced",
      duration: "3h 30m",
      questions: 76,
      attempts: "8.2K",
      rating: 4.8,
      price: "$9.99",
      image: "/placeholder-eudpl.png",
    },
    {
      id: 3,
      title: "PTE Academic Mock Exam",
      description: "AI-scored practice test with instant results and improvement tips",
      type: "PTE",
      difficulty: "Intermediate",
      duration: "2h 15m",
      questions: 52,
      attempts: "6.8K",
      rating: 4.7,
      price: "$7.99",
      image: "/placeholder-eqnv0.png",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Practice Tests</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Take our most popular practice tests designed by experts to simulate real exam conditions and boost your
            confidence.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {featuredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-xl transition-shadow">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={test.image || "/placeholder.svg"}
                    alt={test.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-white">{test.type}</Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                    <span className="text-sm font-bold text-primary">{test.price}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-lg text-gray-900 mb-2 line-clamp-2">{test.title}</CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">{test.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {test.questions} Q
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{test.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      {test.attempts} attempts
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {test.difficulty}
                    </Badge>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90">
                    <Play className="h-4 w-4 mr-2" />
                    Start Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Practice Tests
          </Button>
        </div>
      </div>
    </section>
  )
}
