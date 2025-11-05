import { BookingForm } from "@/components/appointments/booking-form"
import { BookingSidebar } from "@/components/appointments/booking-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, Users } from "lucide-react"

interface BookConsultantPageProps {
  params: {
    consultantId: string
  }
}

export default function BookConsultantPage({ params }: BookConsultantPageProps) {
  // In a real app, you would fetch consultant data based on consultantId
  const consultantData = {
    id: params.consultantId,
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
    studentsHelped: 1200,
    bio: "Specialized in Canadian and US university admissions with expertise in engineering and business programs. Sarah has helped over 1,200 students achieve their study abroad dreams with personalized guidance and proven strategies.",
    expertise: [
      "University Selection & Applications",
      "Scholarship Applications",
      "Statement of Purpose Writing",
      "Interview Preparation",
      "Visa Guidance",
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Consultant Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={consultantData.avatar || "/placeholder.svg"} alt={consultantData.name} />
                  <AvatarFallback className="text-xl">{consultantData.initials}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{consultantData.name}</h1>
                  <p className="text-primary font-medium">{consultantData.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{consultantData.rating}</span>
                      <span>({consultantData.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {consultantData.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {consultantData.studentsHelped}+ students helped
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Specializations:</h3>
                  <div className="flex flex-wrap gap-2">
                    {consultantData.specialization.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Languages:</h3>
                  <p className="text-gray-600">{consultantData.languages.join(", ")}</p>
                </div>

                <p className="text-gray-600">{consultantData.bio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Book Consultation with {consultantData.name}</h2>
          <p className="text-gray-600 mt-2">Fill in your details and preferences to schedule your appointment.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BookingForm />
          </div>
          <div>
            <BookingSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
