"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { CalendarDays, Clock, User, Mail, Phone, Globe } from "lucide-react"
import { useBookAppointment, useConsultants, useAppointmentTypes } from "@/hooks/use-appointments"

export function BookingForm() {
  const router = useRouter()
  const { bookAppointment, loading, error } = useBookAppointment()
  const { consultants, loading: consultantsLoading } = useConsultants()
  const { appointmentTypes, loading: typesLoading } = useAppointmentTypes()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    consultationType: "",
    consultant: "",
    preferredCountries: [],
    studyLevel: "",
    timeSlot: "",
    meetingType: "",
    specialRequests: "",
    agreeToTerms: false,
  })

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!selectedDate) {
      setFormError("Please select a date")
      return
    }

    if (!formData.consultationType || !formData.consultant || !formData.timeSlot) {
      setFormError("Please fill in all required fields")
      return
    }

    try {
      // Parse the time slot to extract hours and minutes
      const timeString = formData.timeSlot // e.g., "9:00 AM" or "2:30 PM"
      const [time, period] = timeString.split(' ')
      const [hours, minutes] = time.split(':').map(Number)
      
      // Convert to 24-hour format
      let hours24 = hours
      if (period === 'PM' && hours !== 12) {
        hours24 = hours + 12
      } else if (period === 'AM' && hours === 12) {
        hours24 = 0
      }
      
      // Format time as HH:mm for the API
      const scheduledTime = `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      
      // Format date as ISO string (just the date part)
      const scheduledDate = selectedDate.toISOString().split('T')[0]

      await bookAppointment({
        consultantId: formData.consultant,
        typeId: formData.consultationType,
        scheduledDate: scheduledDate,
        scheduledTime: scheduledTime,
        notes: formData.specialRequests,
        meetingType: formData.meetingType || 'VIDEO',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      })

      router.push('/appointments?success=true')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to book appointment')
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Consultation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consultationType">Consultation Type *</Label>
              <Select
                value={formData.consultationType}
                onValueChange={(value) => handleInputChange("consultationType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select consultation type" />
                </SelectTrigger>
                <SelectContent>
                  {typesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : appointmentTypes.length > 0 ? (
                    appointmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} ({type.duration} min) - {type.currency} {type.price}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="general">General Consultation (Free)</SelectItem>
                      <SelectItem value="university">University Selection ($49)</SelectItem>
                      <SelectItem value="application">Application Review ($79)</SelectItem>
                      <SelectItem value="visa">Visa Consultation ($59)</SelectItem>
                      <SelectItem value="financial">Financial Planning ($39)</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive Package ($149)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultant">Preferred Consultant</Label>
              <Select value={formData.consultant} onValueChange={(value) => handleInputChange("consultant", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any available consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultantsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : consultants.length > 0 ? (
                    consultants.map((consultant) => (
                      <SelectItem key={consultant.id} value={consultant.id}>
                        {consultant.name} - {consultant.specializations?.join('/')}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="sarah">Sarah Wilson - Canada/USA/UK</SelectItem>
                      <SelectItem value="michael">Dr. Michael Chen - PhD Specialist</SelectItem>
                      <SelectItem value="emma">Emma Thompson - UK/Europe</SelectItem>
                      <SelectItem value="raj">Raj Patel - STEM Programs</SelectItem>
                      <SelectItem value="lisa">Lisa Rodriguez - Business/MBA</SelectItem>
                      <SelectItem value="david">David Kim - Visa Expert</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studyLevel">Study Level *</Label>
              <Select value={formData.studyLevel} onValueChange={(value) => handleInputChange("studyLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select study level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate/Masters</SelectItem>
                  <SelectItem value="phd">PhD/Doctorate</SelectItem>
                  <SelectItem value="diploma">Diploma/Certificate</SelectItem>
                  <SelectItem value="language">Language Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingType">Meeting Type *</Label>
              <Select value={formData.meetingType} onValueChange={(value) => handleInputChange("meetingType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Video Call</SelectItem>
                  <SelectItem value="PHONE">Phone Call</SelectItem>
                  <SelectItem value="IN_PERSON">In-Person (Toronto Office)</SelectItem>
                  <SelectItem value="CHAT">Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date and Time Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Select Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Choose Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Available Time Slots</Label>
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={formData.timeSlot === time ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => handleInputChange("timeSlot", time)}
                  >
                    <Clock className="h-3 w-3 mr-2" />
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests or Questions</Label>
            <Textarea
              id="specialRequests"
              placeholder="Please share any specific questions or requirements you have for the consultation..."
              value={formData.specialRequests}
              onChange={(e) => handleInputChange("specialRequests", e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
              required
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              I agree to the terms and conditions and privacy policy. I understand that this consultation is for
              educational guidance purposes and booking confirmation will be sent via email.
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {(formError || error) && (
        <div className="text-red-600 text-sm text-center">
          {formError || error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          className="bg-primary hover:bg-primary/90 px-8"
          disabled={loading}
        >
          {loading ? "Booking..." : "Book Consultation"}
        </Button>
      </div>
    </form>
  )
}
