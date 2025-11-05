"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Clock, CheckCircle, Users, Video, Phone, MessageSquare } from "lucide-react"
import { format } from "date-fns"

interface TimeSlot {
  time: string
  available: boolean
  type: 'office' | 'video' | 'phone'
}

const timeSlots: TimeSlot[] = [
  { time: "09:00", available: true, type: 'office' },
  { time: "10:00", available: true, type: 'video' },
  { time: "11:00", available: false, type: 'office' },
  { time: "12:00", available: true, type: 'phone' },
  { time: "14:00", available: true, type: 'video' },
  { time: "15:00", available: true, type: 'office' },
  { time: "16:00", available: true, type: 'phone' },
  { time: "17:00", available: false, type: 'video' },
]

export default function ConsultationPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [consultationType, setConsultationType] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    studyLevel: "",
    fieldOfInterest: "",
    budget: "",
    message: "",
    preferredLanguage: "english"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const consultationData = {
      ...formData,
      date: selectedDate,
      time: selectedTime,
      type: consultationType,
      status: 'pending',
      createdAt: new Date()
    }

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultationData)
      })

      if (response.ok) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Failed to book consultation:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Consultation Booked!</h2>
            <p className="text-gray-600 mb-6">
              Thank you! We've received your consultation request. Our team will contact you within 24 hours to confirm your appointment.
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p><strong>Date:</strong> {selectedDate ? format(selectedDate, 'PPP') : 'Not selected'}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Type:</strong> {consultationType}</p>
            </div>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Book Your Free Consultation
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Get personalized guidance from our expert counselors and take the first step towards your international education journey.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 rounded-lg p-6">
                <Users className="w-10 h-10 mb-4 mx-auto" />
                <h3 className="font-semibold mb-2">Expert Counselors</h3>
                <p className="text-sm text-primary-100">15+ years of experience</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <Clock className="w-10 h-10 mb-4 mx-auto" />
                <h3 className="font-semibold mb-2">60-Minute Session</h3>
                <p className="text-sm text-primary-100">Comprehensive discussion</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <CheckCircle className="w-10 h-10 mb-4 mx-auto" />
                <h3 className="font-semibold mb-2">100% Free</h3>
                <p className="text-sm text-primary-100">No hidden charges</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Book Your Consultation</CardTitle>
                  <CardDescription>
                    Fill in your details and select a convenient time slot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Personal Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Full Name *</label>
                          <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone Number *</label>
                          <Input
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                        <Input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    {/* Study Preferences */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Study Preferences</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Preferred Country</label>
                          <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="canada">Canada</SelectItem>
                              <SelectItem value="usa">United States</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="australia">Australia</SelectItem>
                              <SelectItem value="germany">Germany</SelectItem>
                              <SelectItem value="new-zealand">New Zealand</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Study Level</label>
                          <Select value={formData.studyLevel} onValueChange={(value) => setFormData({...formData, studyLevel: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="undergraduate">Undergraduate</SelectItem>
                              <SelectItem value="postgraduate">Postgraduate</SelectItem>
                              <SelectItem value="diploma">Diploma</SelectItem>
                              <SelectItem value="phd">PhD</SelectItem>
                              <SelectItem value="certificate">Certificate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Field of Interest</label>
                          <Select value={formData.fieldOfInterest} onValueChange={(value) => setFormData({...formData, fieldOfInterest: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="engineering">Engineering</SelectItem>
                              <SelectItem value="business">Business & Management</SelectItem>
                              <SelectItem value="computer-science">Computer Science</SelectItem>
                              <SelectItem value="medicine">Medicine & Health</SelectItem>
                              <SelectItem value="arts">Arts & Humanities</SelectItem>
                              <SelectItem value="science">Science & Technology</SelectItem>
                              <SelectItem value="law">Law</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Budget Range</label>
                          <Select value={formData.budget} onValueChange={(value) => setFormData({...formData, budget: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select budget" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10-20k">$10,000 - $20,000</SelectItem>
                              <SelectItem value="20-30k">$20,000 - $30,000</SelectItem>
                              <SelectItem value="30-50k">$30,000 - $50,000</SelectItem>
                              <SelectItem value="50k+">$50,000+</SelectItem>
                              <SelectItem value="not-sure">Not sure yet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Consultation Type */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Consultation Type</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            consultationType === 'office' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setConsultationType('office')}
                        >
                          <Users className="w-8 h-8 mb-2 text-primary" />
                          <h4 className="font-semibold">In-Person</h4>
                          <p className="text-sm text-gray-600">Visit our office</p>
                        </div>
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            consultationType === 'video' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setConsultationType('video')}
                        >
                          <Video className="w-8 h-8 mb-2 text-primary" />
                          <h4 className="font-semibold">Video Call</h4>
                          <p className="text-sm text-gray-600">Online meeting</p>
                        </div>
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            consultationType === 'phone' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setConsultationType('phone')}
                        >
                          <Phone className="w-8 h-8 mb-2 text-primary" />
                          <h4 className="font-semibold">Phone Call</h4>
                          <p className="text-sm text-gray-600">Voice consultation</p>
                        </div>
                      </div>
                    </div>

                    {/* Date & Time Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Select Date & Time</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Select Date</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) =>
                                  date < new Date() || date.getDay() === 0
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Available Times</label>
                          <div className="grid grid-cols-2 gap-2">
                            {timeSlots.map((slot) => (
                              <Button
                                key={slot.time}
                                type="button"
                                variant={selectedTime === slot.time ? "default" : "outline"}
                                size="sm"
                                disabled={!slot.available}
                                onClick={() => setSelectedTime(slot.time)}
                                className="text-xs"
                              >
                                {slot.time}
                                {!slot.available && (
                                  <Badge variant="secondary" className="ml-1 text-xs">
                                    Booked
                                  </Badge>
                                )}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Message */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Message</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Tell us about any specific questions or concerns you have..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !selectedDate || !selectedTime || !consultationType}
                      className="w-full"
                    >
                      {isSubmitting ? 'Booking...' : 'Book Free Consultation'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Personalized Assessment</h4>
                      <p className="text-sm text-gray-600">Complete evaluation of your profile and goals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">University Recommendations</h4>
                      <p className="text-sm text-gray-600">Tailored list of suitable universities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Roadmap Creation</h4>
                      <p className="text-sm text-gray-600">Step-by-step plan for your journey</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Q&A Session</h4>
                      <p className="text-sm text-gray-600">Get all your questions answered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">+91-9216-340-340</p>
                      <p className="text-sm text-gray-600">Mon-Sat: 9AM-6PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">info@bnoverseass.com</p>
                      <p className="text-sm text-gray-600">24/7 email support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}