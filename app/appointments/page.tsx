"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  Video,
  MessageSquare,
  CheckCircle,
  Globe,
  Info
} from 'lucide-react'

interface AppointmentType {
  id: string
  name: string
  description: string
  duration: number
  meetingType: 'VIDEO' | 'PHONE' | 'IN_PERSON' | 'CHAT'
  features: string[]
  price: number
  currency: string
  isActive: boolean
}

interface Consultant {
  id: string
  name: string
  specialties: string[]
  bio: string
  avatarUrl?: string
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function AppointmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Appointment Type
    typeId: '',

    // Step 2: Consultant Selection
    consultantId: '',

    // Step 3: Date & Time
    scheduledDate: '',
    scheduledTime: '',

    // Step 4: User Details (if not authenticated)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',

    // Step 5: Additional Details
    description: '',
    specialRequests: '',
    agreeToTerms: false
  })

  useEffect(() => {
    checkAuth()
    fetchAppointmentTypes()
    fetchConsultants()
    
    // Check for success parameter and show success message
    const success = searchParams.get('success')
    if (success === 'true') {
      toast({
        title: "Appointment booked successfully!",
        description: "You will receive a confirmation email shortly. Redirecting to your appointments...",
      })
      
      // Redirect to appointments list after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/appointments')
      }, 2000)
    }
  }, [searchParams])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        const user = data.user
        if (user) {
          setIsAuthenticated(true)
          setFormData(prev => ({
            ...prev,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            email: user.email || '',
            phone: user.phone || ''
          }))
        }
      }
    } catch (error) {
      console.log('User not authenticated')
    }
  }

  const fetchAppointmentTypes = async () => {
    try {
      const response = await fetch('/api/appointment-types')
      const data = await response.json()

      if (data.success && data.appointmentTypes) {
        setAppointmentTypes(data.appointmentTypes)
      } else {
        // Fallback to empty array if no data
        setAppointmentTypes([])
        console.warn('No appointment types found')
      }
    } catch (error) {
      console.error('Error fetching appointment types:', error)
      setAppointmentTypes([])
      toast({
        title: "Error",
        description: "Failed to load appointment types. Please refresh the page.",
        variant: "destructive"
      })
    }
  }

  const fetchConsultants = async () => {
    try {
      const response = await fetch('/api/consultants')
      const data = await response.json()

      if (data.success && data.consultants) {
        setConsultants(data.consultants)
      } else {
        // Fallback to empty array if no data
        setConsultants([])
        console.warn('No consultants found')
      }
    } catch (error) {
      console.error('Error fetching consultants:', error)
      setConsultants([])
      toast({
        title: "Error",
        description: "Failed to load consultants. Please refresh the page.",
        variant: "destructive"
      })
    }
  }

  const fetchTimeSlots = async (date: Date, consultantId: string) => {
    try {
      const dateString = date.toISOString().split('T')[0]
      const response = await fetch(`/api/consultants/${consultantId}/availability?date=${dateString}`)
      const data = await response.json()

      if (data.success && data.availability && data.availability.length > 0) {
        // Get the first day's slots (since we're requesting a specific date)
        const dayAvailability = data.availability[0]
        setTimeSlots(dayAvailability.slots || [])
      } else {
        // Fallback to default time slots if API fails
        const defaultSlots = [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
          '17:00', '17:30', '18:00', '18:30'
        ].map(time => ({
          time,
          available: true
        }))
        setTimeSlots(defaultSlots)
      }
    } catch (error) {
      console.error('Error fetching time slots:', error)
      // Fallback to default time slots on error
      const defaultSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', '18:30'
      ].map(time => ({
        time,
        available: true
      }))
      setTimeSlots(defaultSlots)
    }
  }

  useEffect(() => {
    if (selectedDate && formData.consultantId) {
      fetchTimeSlots(selectedDate, formData.consultantId)
    }
  }, [selectedDate, formData.consultantId])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    // Validation for each step
    switch (currentStep) {
      case 1:
        if (!formData.typeId) {
          toast({
            title: "Please select an appointment type",
            variant: "destructive"
          })
          return
        }
        break
      case 2:
        if (!formData.consultantId) {
          toast({
            title: "Please select a consultant",
            variant: "destructive"
          })
          return
        }
        break
      case 3:
        if (!selectedDate || !formData.scheduledTime) {
          toast({
            title: "Please select date and time",
            variant: "destructive"
          })
          return
        }
        break
      case 4:
        if (!isAuthenticated) {
          if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
            toast({
              title: "Please fill in all required fields",
              variant: "destructive"
            })
            return
          }
        }
        break
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!formData.agreeToTerms) {
      toast({
        title: "Please agree to terms and conditions",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Format date as YYYY-MM-DD
      const scheduledDate = selectedDate?.toISOString().split('T')[0]
      
      const appointmentData = {
        typeId: formData.typeId,
        consultantId: formData.consultantId,
        scheduledDate: scheduledDate,
        scheduledTime: formData.scheduledTime,
        meetingType: appointmentTypes.find(t => t.id === formData.typeId)?.meetingType || 'VIDEO',
        description: formData.description,
        specialRequests: formData.specialRequests,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      })

      const result = await response.json()

      if (result.success || response.ok) {
        toast({
          title: "Appointment booked successfully!",
          description: "Redirecting to your appointments..."
        })
        
        // Redirect to dashboard appointments page with success indicator
        setTimeout(() => {
          router.push('/dashboard/appointments?from=booking')
        }, 1500)
      } else {
        throw new Error(result.message || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast({
        title: "Failed to book appointment",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedType = appointmentTypes.find(t => t.id === formData.typeId)
  const selectedConsultant = consultants.find(c => c.id === formData.consultantId)

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Choose Appointment Type
              </CardTitle>
              <CardDescription>
                Select the type of consultation that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {appointmentTypes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Info className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="mb-2">No appointment types available at the moment.</p>
                    <p className="text-sm">Please contact support or try again later.</p>
                  </div>
                ) : (
                  appointmentTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.typeId === type.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('typeId', type.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{type.name}</h3>
                            <Badge variant="secondary">
                              {type.price > 0 ? `${type.currency} ${type.price}` : 'Free'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {type.duration} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              {type.meetingType.toLowerCase()}
                            </div>
                          </div>
                          {type.features && type.features.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-700 mb-1">What's included:</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {type.features.map((feature, index) => (
                                  <li key={index} className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Choose Your Consultant
              </CardTitle>
              <CardDescription>
                Select a consultant based on their expertise and your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {consultants.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="mb-2">No consultants available at the moment.</p>
                    <p className="text-sm">Please contact support or try again later.</p>
                  </div>
                ) : (
                  consultants.map((consultant) => (
                    <div
                      key={consultant.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.consultantId === consultant.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('consultantId', consultant.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-600">
                            {consultant.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{consultant.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{consultant.bio}</p>
                          <div className="flex flex-wrap gap-1">
                            {consultant.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
              <CardDescription>
                Choose your preferred date and time for the consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  {selectedDate ? (
                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          type="button"
                          variant={formData.scheduledTime === slot.time ? "default" : "outline"}
                          size="sm"
                          className="justify-start"
                          onClick={() => handleInputChange('scheduledTime', slot.time)}
                          disabled={!slot.available}
                        >
                          <Clock className="h-3 w-3 mr-2" />
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Please select a date first</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return !isAuthenticated ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Contact Information
              </CardTitle>
              <CardDescription>
                Please provide your contact details for the appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                        onChange={(e) => handleInputChange('email', e.target.value)}
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
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Create an account for easier booking
                      </p>
                      <p className="text-sm text-blue-700 mb-3">
                        Sign up to manage your appointments, track consultation history, and get personalized recommendations.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/auth/login?redirect=/appointments')}
                      >
                        Sign In / Create Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Skip to next step if authenticated
          (() => {
            setTimeout(() => setCurrentStep(5), 0)
            return null
          })()
        )

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Additional Details
              </CardTitle>
              <CardDescription>
                Add any specific questions or requirements for your consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Booking Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Appointment Type:</span>
                      <span className="font-medium">{selectedType?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consultant:</span>
                      <span className="font-medium">{selectedConsultant?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Time:</span>
                      <span className="font-medium">
                        {selectedDate?.toLocaleDateString()} at {formData.scheduledTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{selectedType?.duration} minutes</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total:</span>
                      <span>
                        {selectedType?.price && selectedType.price > 0 
                          ? `${selectedType.currency} ${selectedType.price}`
                          : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">What would you like to discuss?</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe your study abroad goals and what you'd like to focus on during the consultation..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Any special requirements or accommodations needed for the consultation..."
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the terms and conditions and privacy policy. I understand that this consultation is for
                    educational guidance purposes and booking confirmation will be sent via email.
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Consultation</h1>
          <p className="text-gray-600">
            Get expert guidance for your study abroad journey with our experienced consultants
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>

          <div className="flex gap-2">
            {currentStep < 5 ? (
              <Button onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.agreeToTerms}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? 'Booking...' : 'Book Free Consultation'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}