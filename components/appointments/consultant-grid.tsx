"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Calendar, Users } from "lucide-react"

export function ConsultantGrid() {
  const consultants = [
    {
      id: 1,
      name: "Sarah Wilson",
      title: "Senior Education Consultant",
      specialization: ["Canada", "USA", "UK"],
      experience: "12 years",
      rating: 4.9,
      reviews: 245,
      location: "Toronto, Canada",
      languages: ["English", "French"],
      avatar: "/placeholder-consultant1.png",
      initials: "SW",
      nextAvailable: "Today, 2:00 PM",
      studentsHelped: 1200,
      bio: "Specialized in Canadian and US university admissions with expertise in engineering and business programs.",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      title: "PhD Admissions Specialist",
      specialization: ["USA", "Germany", "Australia"],
      experience: "15 years",
      rating: 4.8,
      reviews: 189,
      location: "Vancouver, Canada",
      languages: ["English", "Mandarin"],
      avatar: "/placeholder-consultant2.png",
      initials: "MC",
      nextAvailable: "Tomorrow, 10:00 AM",
      studentsHelped: 890,
      bio: "Former university admissions officer with deep knowledge of PhD and research programs.",
    },
    {
      id: 3,
      name: "Emma Thompson",
      title: "UK & Europe Specialist",
      specialization: ["UK", "Germany", "Netherlands"],
      experience: "10 years",
      rating: 4.9,
      reviews: 156,
      location: "London, UK",
      languages: ["English", "German"],
      avatar: "/placeholder-consultant3.png",
      initials: "ET",
      nextAvailable: "Today, 4:30 PM",
      studentsHelped: 650,
      bio: "Expert in UK university system and European study programs, especially in arts and humanities.",
    },
    {
      id: 4,
      name: "Raj Patel",
      title: "STEM Programs Consultant",
      specialization: ["USA", "Canada", "Australia"],
      experience: "8 years",
      rating: 4.7,
      reviews: 203,
      location: "Mumbai, India",
      languages: ["English", "Hindi", "Gujarati"],
      avatar: "/placeholder-consultant4.png",
      initials: "RP",
      nextAvailable: "Today, 6:00 PM",
      studentsHelped: 780,
      bio: "Specialized in STEM programs with strong connections to top engineering and computer science schools.",
    },
    {
      id: 5,
      name: "Lisa Rodriguez",
      title: "Business & MBA Specialist",
      specialization: ["USA", "UK", "Singapore"],
      experience: "11 years",
      rating: 4.8,
      reviews: 167,
      location: "New York, USA",
      languages: ["English", "Spanish"],
      avatar: "/placeholder-consultant5.png",
      initials: "LR",
      nextAvailable: "Tomorrow, 1:00 PM",
      studentsHelped: 920,
      bio: "Former MBA admissions consultant with expertise in top business schools and scholarship applications.",
    },
    {
      id: 6,
      name: "David Kim",
      title: "Visa & Immigration Expert",
      specialization: ["Canada", "Australia", "New Zealand"],
      experience: "14 years",
      rating: 4.9,
      reviews: 298,
      location: "Sydney, Australia",
      languages: ["English", "Korean"],
      avatar: "/placeholder-consultant6.png",
      initials: "DK",
      nextAvailable: "Today, 8:00 PM",
      studentsHelped: 1500,
      bio: "Immigration lawyer turned education consultant with deep expertise in visa processes and requirements.",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Expert Consultants</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our certified education consultants have helped thousands of students achieve their study abroad dreams.
            Choose the expert that best matches your needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {consultants.map((consultant) => (
            <Card key={consultant.id} className="hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={consultant.avatar || "/placeholder.svg"} alt={consultant.name} />
                  <AvatarFallback className="text-lg">{consultant.initials}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl text-gray-900">{consultant.name}</CardTitle>
                <p className="text-primary font-medium">{consultant.title}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{consultant.rating}</span>
                  </div>
                  <span className="text-gray-600">({consultant.reviews} reviews)</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {consultant.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {consultant.studentsHelped}+ students helped
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Next available: {consultant.nextAvailable}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Specializations:</h4>
                  <div className="flex flex-wrap gap-2">
                    {consultant.specialization.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Languages:</h4>
                  <p className="text-sm text-gray-600">{consultant.languages.join(", ")}</p>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{consultant.bio}</p>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-primary hover:bg-primary/90">Book Consultation</Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
