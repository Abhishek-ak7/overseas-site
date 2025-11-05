"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, Phone, User, MessageSquare, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Consultant {
  id: string
  name: string
  title: string
  specializations: string[]
  rating: number
  avatar: string
  nextAvailable: string
  studentsHelped: number
}

interface AppointmentType {
  id: string
  name: string
  description: string
  duration: number
  price: number
  meetingType: string
  popular: boolean
}

export function AppointmentSection() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointmentData()
  }, [])

  const fetchAppointmentData = async () => {
    try {
      // In a real app, these would come from API endpoints
      // For now, using mock data
      setConsultants([
        {
          id: "1",
          name: "Sarah Wilson",
          title: "Senior Education Consultant",
          specializations: ["Canada", "USA", "UK"],
          rating: 4.9,
          avatar: "/consultant-1.jpg",
          nextAvailable: "Today, 2:00 PM",
          studentsHelped: 1200
        },
        {
          id: "2",
          name: "Dr. Michael Chen",
          title: "PhD Admissions Specialist",
          specializations: ["USA", "Germany", "Australia"],
          rating: 4.8,
          avatar: "/consultant-2.jpg",
          nextAvailable: "Tomorrow, 10:00 AM",
          studentsHelped: 890
        },
        {
          id: "3",
          name: "Emma Thompson",
          title: "UK & Europe Specialist",
          specializations: ["UK", "Germany", "Netherlands"],
          rating: 4.9,
          avatar: "/consultant-3.jpg",
          nextAvailable: "Today, 4:00 PM",
          studentsHelped: 756
        }
      ])

      setAppointmentTypes([
        {
          id: "1",
          name: "University Selection",
          description: "Get personalized university recommendations based on your profile",
          duration: 60,
          price: 5000,
          meetingType: "VIDEO",
          popular: true
        },
        {
          id: "2",
          name: "Visa Consultation",
          description: "Complete guidance on visa application and documentation",
          duration: 45,
          price: 3500,
          meetingType: "VIDEO",
          popular: false
        },
        {
          id: "3",
          name: "Application Review",
          description: "Review your university applications before submission",
          duration: 90,
          price: 7500,
          meetingType: "VIDEO",
          popular: true
        },
        {
          id: "4",
          name: "SOP & Essay Review",
          description: "Get your SOP and essays reviewed by experts",
          duration: 30,
          price: 2500,
          meetingType: "VIDEO",
          popular: false
        }
      ])
    } catch (error) {
      console.error('Failed to fetch appointment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />
      case 'PHONE':
        return <Phone className="h-4 w-4" />
      case 'IN_PERSON':
        return <User className="h-4 w-4" />
      case 'CHAT':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            Expert Consultation
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Book a Session with Our
            <span className="text-primary block">Education Experts</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized guidance from experienced counselors who have helped thousands
            of students achieve their international education dreams.
          </p>
        </div>

        {/* Consultation Types */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Choose Your Consultation Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {appointmentTypes.map((type) => (
              <Card key={type.id} className="relative hover:shadow-lg transition-shadow duration-300">
                {type.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-primary">
                    Popular
                  </Badge>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getMeetingIcon(type.meetingType)}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">₹{type.price.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{type.duration} mins</div>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{type.duration} minutes</span>
                    <span>•</span>
                    {getMeetingIcon(type.meetingType)}
                    <span>{type.meetingType.toLowerCase()}</span>
                  </div>
                  <Button className="w-full" size="sm" asChild>
                    <Link href={`/appointments?type=${type.id}`}>
                      Book Now
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Consultants */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Meet Our Expert Consultants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {consultants.map((consultant) => (
              <Card key={consultant.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                      <Image
                        src={consultant.avatar}
                        alt={consultant.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant.name)}&size=64&background=ef4444&color=ffffff`
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{consultant.name}</h4>
                      <p className="text-sm text-gray-600">{consultant.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{consultant.rating}</span>
                        <span className="text-sm text-gray-500">
                          • {consultant.studentsHelped.toLocaleString()} students helped
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Specializations:</p>
                    <div className="flex flex-wrap gap-1">
                      {consultant.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {consultant.nextAvailable}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/appointments?consultant=${consultant.id}`}>
                        Book Session
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-xl text-white/90 mb-6">
                Join thousands of students who have successfully secured admission
                to top universities worldwide with our expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/appointments">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Free Consultation
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                  <Link href="/contact">
                    Get In Touch
                  </Link>
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">50,000+</div>
                    <div className="text-sm text-white/80">Students Guided</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">1000+</div>
                    <div className="text-sm text-white/80">Universities</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">29+</div>
                    <div className="text-sm text-white/80">Years Experience</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}