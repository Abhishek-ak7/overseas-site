'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/hooks/use-toast'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ArrowLeft,
  Save,
  Users,
  MessageSquare
} from 'lucide-react'

interface AppointmentType {
  id: string
  name: string
  description: string
  price: number
  duration: number
  meetingType: string
}

interface Consultant {
  id: string
  name: string
  email: string
  specialties: string[]
  rating: number
  totalReviews: number
}

interface User {
  id: string
  email: string
  user_profiles?: {
    first_name: string
    last_name: string
    phone?: string
  }
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [timeSlots, setTimeSlots] = useState<Array<{ time: string; available: boolean }>>([])

  const [formData, setFormData] = useState({
    userId: '',
    consultantId: '',
    typeId: '',
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    meetingLink: '',
    notes: '',
    status: 'SCHEDULED'
  })

  useEffect(() => {
    fetchAppointmentTypes()
    fetchConsultants()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedDate && formData.consultantId) {
      fetchTimeSlots()
    }
  }, [selectedDate, formData.consultantId])

  const fetchAppointmentTypes = async () => {
    try {
      const response = await fetch('/api/appointment-types')
      const data = await response.json()
      if (data.success) {
        setAppointmentTypes(data.appointmentTypes)
      }
    } catch (error) {
      console.error('Error fetching appointment types:', error)
      toast({
        title: "Error",
        description: "Failed to load appointment types",
        variant: "destructive"
      })
    }
  }

  const fetchConsultants = async () => {
    try {
      const response = await fetch('/api/consultants')
      const data = await response.json()
      if (data.success) {
        setConsultants(data.consultants)
      }
    } catch (error) {
      console.error('Error fetching consultants:', error)
      toast({
        title: "Error",
        description: "Failed to load consultants",
        variant: "destructive"
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=100')
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchTimeSlots = async () => {
    if (!selectedDate || !formData.consultantId) return

    try {
      const dateString = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/consultants/${formData.consultantId}/availability?date=${dateString}`)
      const data = await response.json()

      if (data.success && data.availability && data.availability.length > 0) {
        setTimeSlots(data.availability[0].slots || [])
      } else {
        // Default time slots
        const defaultSlots = [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
          '17:00', '17:30', '18:00', '18:30'
        ].map(time => ({ time, available: true }))
        setTimeSlots(defaultSlots)
      }
    } catch (error) {
      console.error('Error fetching time slots:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (field === 'scheduledDate' && value) {
      setSelectedDate(new Date(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.userId || !formData.consultantId || !formData.typeId || !selectedDate || !formData.scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const selectedType = appointmentTypes.find(t => t.id === formData.typeId)

      const appointmentData = {
        userId: formData.userId,
        consultantId: formData.consultantId,
        typeId: formData.typeId,
        title: formData.title || selectedType?.name || 'Consultation',
        description: formData.description,
        scheduledDate: selectedDate.toISOString().split('T')[0],
        scheduledTime: formData.scheduledTime,
        meetingLink: formData.meetingLink,
        notes: formData.notes,
        status: formData.status
      }

      const response = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Appointment created successfully"
        })
        router.push('/admin/appointments')
      } else {
        throw new Error(result.message || 'Failed to create appointment')
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create appointment",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedType = appointmentTypes.find(t => t.id === formData.typeId)
  const selectedConsultant = consultants.find(c => c.id === formData.consultantId)
  const selectedUser = users.find(u => u.id === formData.userId)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Appointment</h1>
          <p className="text-gray-600">Schedule a consultation for a student</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Appointment Details
            </CardTitle>
            <CardDescription>Basic information about the appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Student *</Label>
                <Select value={formData.userId} onValueChange={(value) => handleInputChange('userId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div>
                          <div className="font-medium">
                            {user.user_profiles?.first_name} {user.user_profiles?.last_name}
                          </div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeId">Appointment Type *</Label>
                <Select value={formData.typeId} onValueChange={(value) => handleInputChange('typeId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-gray-600">
                            {type.price === 0 ? 'Free' : `$${type.price}`} • {type.duration} min
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultantId">Consultant *</Label>
              <Select value={formData.consultantId} onValueChange={(value) => handleInputChange('consultantId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      <div>
                        <div className="font-medium">{consultant.name}</div>
                        <div className="text-sm text-gray-600">
                          ⭐ {consultant.rating} ({consultant.totalReviews} reviews) •
                          {consultant.specialties.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={selectedType?.name || "Consultation"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what will be covered in this consultation..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Schedule
            </CardTitle>
            <CardDescription>Choose date and time for the appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Date *</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    if (date) {
                      handleInputChange('scheduledDate', date.toISOString().split('T')[0])
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-3 block">Time *</Label>
                {selectedDate && formData.consultantId ? (
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
                    <p>Please select a date and consultant first</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Optional meeting details and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                type="url"
                value={formData.meetingLink}
                onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-def-ghi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Internal notes about this appointment..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {formData.userId && formData.consultantId && formData.typeId && selectedDate && formData.scheduledTime && (
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Student:</strong> {selectedUser?.user_profiles?.first_name} {selectedUser?.user_profiles?.last_name}</p>
                  <p><strong>Email:</strong> {selectedUser?.email}</p>
                  <p><strong>Consultant:</strong> {selectedConsultant?.name}</p>
                </div>
                <div>
                  <p><strong>Type:</strong> {selectedType?.name}</p>
                  <p><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {formData.scheduledTime}</p>
                  <p><strong>Duration:</strong> {selectedType?.duration} minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Appointment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}