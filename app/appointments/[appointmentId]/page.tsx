import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, Video, Phone, MapPin, User, Mail, MessageSquare, Download, Edit } from "lucide-react"

interface AppointmentPageProps {
  params: {
    appointmentId: string
  }
}

export default function AppointmentPage({ params }: AppointmentPageProps) {
  // In a real app, you would fetch appointment data based on appointmentId
  const appointmentData = {
    id: params.appointmentId,
    status: "confirmed",
    type: "University Selection",
    date: "December 28, 2024",
    time: "2:00 PM - 2:45 PM",
    duration: "45 minutes",
    meetingType: "video",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    price: "$49",
    consultant: {
      name: "Sarah Wilson",
      title: "Senior Education Consultant",
      avatar: "/placeholder-consultant1.png",
      initials: "SW",
      email: "sarah.wilson@bnoverseas.com",
      phone: "+1 (416) 555-0123",
    },
    client: {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      studyLevel: "Graduate/Masters",
      preferredCountries: ["Canada", "USA"],
    },
    notes:
      "Interested in computer science programs. Looking for universities with strong research opportunities and scholarship options.",
    documents: [
      { name: "University Selection Guide", type: "PDF", size: "2.3 MB" },
      { name: "Application Timeline", type: "PDF", size: "1.1 MB" },
      { name: "Scholarship Opportunities", type: "PDF", size: "3.2 MB" },
    ],
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video
      case "phone":
        return Phone
      case "in-person":
        return MapPin
      default:
        return Video
    }
  }

  const MeetingIcon = getMeetingIcon(appointmentData.meetingType)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
              <p className="text-gray-600 mt-2">Appointment ID: #{appointmentData.id}</p>
            </div>
            <Badge className={`${getStatusColor(appointmentData.status)} capitalize`}>{appointmentData.status}</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Consultation Type</div>
                    <div className="font-semibold text-gray-900">{appointmentData.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="font-semibold text-gray-900">{appointmentData.duration}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="font-semibold text-gray-900">{appointmentData.date}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Time</div>
                    <div className="font-semibold text-gray-900">{appointmentData.time}</div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <MeetingIcon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold text-gray-900 capitalize">{appointmentData.meetingType} Call</div>
                    {appointmentData.meetingType === "video" && (
                      <div className="text-sm text-gray-600">
                        Meeting link will be sent 30 minutes before the session
                      </div>
                    )}
                  </div>
                </div>

                {appointmentData.meetingType === "video" && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-900">Video Meeting Link</div>
                        <div className="text-sm text-blue-700">Join your consultation here</div>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Consultant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Consultant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={appointmentData.consultant.avatar || "/placeholder.svg"}
                      alt={appointmentData.consultant.name}
                    />
                    <AvatarFallback>{appointmentData.consultant.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{appointmentData.consultant.name}</h3>
                    <p className="text-primary">{appointmentData.consultant.title}</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {appointmentData.consultant.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {appointmentData.consultant.phone}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Session Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{appointmentData.notes}</p>
              </CardContent>
            </Card>

            {/* Documents & Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Documents & Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointmentData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-semibold text-xs">{doc.type}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-600">{doc.size}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Consultant
                </Button>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-semibold text-gray-900">{appointmentData.client.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-semibold text-gray-900">{appointmentData.client.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-semibold text-gray-900">{appointmentData.client.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Study Level</div>
                  <div className="font-semibold text-gray-900">{appointmentData.client.studyLevel}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Preferred Countries</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {appointmentData.client.preferredCountries.map((country) => (
                      <Badge key={country} variant="outline" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultation Fee:</span>
                  <span className="text-2xl font-bold text-primary">{appointmentData.price}</span>
                </div>
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
