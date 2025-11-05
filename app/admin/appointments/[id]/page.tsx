'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { AppointmentMessages } from '@/components/appointments/appointment-messages'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Video,
  Phone,
  MessageSquare,
  ExternalLink,
  XCircle,
  CheckCircle,
  AlertCircle,
  Mail,
  Edit,
  Save,
} from 'lucide-react'

interface Appointment {
  id: string
  title?: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  status: string
  meetingLink?: string
  notes?: string
  description?: string
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    phone?: string
  }
  consultant: {
    id: string
    name: string
    email: string
  }
  appointmentType: {
    id: string
    name: string
    duration: number
    meetingType: string
  }
}

export default function AdminAppointmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    meetingLink: ''
  })

  useEffect(() => {
    fetchAppointment()
    getCurrentUser()
  }, [params.id])

  const getCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/profile')
      const data = await response.json()
      if (data.user) {
        setCurrentUserId(data.user.id)
      }
    } catch (error) {
      console.error('Failed to get current user:', error)
    }
  }

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        const apt = data.appointment

        const appointmentData = {
          id: apt.id,
          title: apt.title,
          scheduledDate: apt.scheduled_date ? new Date(apt.scheduled_date).toISOString().split('T')[0] : '',
          scheduledTime: apt.scheduled_time ? new Date(apt.scheduled_time).toTimeString().split(' ')[0].substring(0, 5) : '',
          duration: apt.duration,
          status: apt.status,
          meetingLink: apt.meeting_link,
          notes: apt.notes,
          description: apt.description,
          user: {
            id: apt.users?.id || apt.user_id,
            email: apt.users?.email || '',
            first_name: apt.users?.first_name || '',
            last_name: apt.users?.last_name || '',
            phone: apt.users?.phone || '',
          },
          consultant: {
            id: apt.consultants?.id || apt.consultant_id,
            name: apt.consultants?.name || 'Unknown',
            email: apt.consultants?.email || '',
          },
          appointmentType: {
            id: apt.appointment_types?.id || apt.type_id,
            name: apt.appointment_types?.name || 'Consultation',
            duration: apt.appointment_types?.duration || apt.duration,
            meetingType: apt.appointment_types?.meeting_type || 'VIDEO'
          }
        }

        setAppointment(appointmentData)
        setFormData({
          status: apt.status,
          notes: apt.notes || '',
          meetingLink: apt.meeting_link || ''
        })
      } else {
        throw new Error('Failed to fetch appointment')
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error)
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.status,
          notes: formData.notes,
          meetingLink: formData.meetingLink
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment updated successfully"
        })
        setEditMode(false)
        fetchAppointment()
      } else {
        throw new Error('Failed to update appointment')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return <Clock className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'IN_PROGRESS': return <Video className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getMeetingIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'VIDEO': return <Video className="h-4 w-4" />
      case 'PHONE': return <Phone className="h-4 w-4" />
      case 'IN_PERSON': return <User className="h-4 w-4" />
      case 'CHAT': return <MessageSquare className="h-4 w-4" />
      default: return <Video className="h-4 w-4" />
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const appointmentDate = new Date(`${date}T${time}`)
    return appointmentDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Appointment not found</h3>
            <Button onClick={() => router.push('/admin/appointments')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/appointments')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{appointment.appointmentType.name}</h1>
            <p className="text-gray-600 mt-2">Appointment Details - Admin View</p>
          </div>
          <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-2 px-4 py-2`}>
            {getStatusIcon(appointment.status)}
            <span>{appointment.status}</span>
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Appointment Information</CardTitle>
                <Button
                  variant={editMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (editMode) {
                      handleUpdateAppointment()
                    } else {
                      setEditMode(true)
                    }
                  }}
                >
                  {editMode ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Date & Time</p>
                  <p className="text-gray-600">
                    {formatDateTime(appointment.scheduledDate, appointment.scheduledTime)}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Duration</p>
                  <p className="text-gray-600">{appointment.duration} minutes</p>
                </div>
              </div>

              {/* Meeting Type */}
              <div className="flex items-start gap-3">
                {getMeetingIcon(appointment.appointmentType.meetingType)}
                <div>
                  <p className="font-medium text-gray-900">Meeting Type</p>
                  <p className="text-gray-600">{appointment.appointmentType.meetingType}</p>
                </div>
              </div>

              {/* Student Info */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Student</p>
                  <p className="text-gray-600">
                    {appointment.user.first_name} {appointment.user.last_name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Mail className="h-3 w-3" />
                    {appointment.user.email}
                  </div>
                  {appointment.user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Phone className="h-3 w-3" />
                      {appointment.user.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Consultant */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Consultant</p>
                  <p className="text-gray-600">{appointment.consultant.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Mail className="h-3 w-3" />
                    {appointment.consultant.email}
                  </div>
                </div>
              </div>

              {/* Status (Editable) */}
              {editMode ? (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
                      <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {/* Meeting Link (Editable) */}
              {editMode ? (
                <div className="space-y-2">
                  <Label>Meeting Link</Label>
                  <Input
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              ) : appointment.meetingLink ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-medium text-green-900 mb-2">Meeting Link</p>
                  <Button
                    variant="default"
                    onClick={() => window.open(appointment.meetingLink, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Meeting
                  </Button>
                </div>
              ) : null}

              {/* Notes (Editable) */}
              {editMode ? (
                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add notes for the student..."
                    rows={4}
                  />
                </div>
              ) : appointment.notes ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-900 mb-2">Admin Notes</p>
                  <p className="text-blue-800 whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              ) : null}

              {/* Description */}
              {appointment.description && (
                <div>
                  <p className="font-medium text-gray-900 mb-2">Student's Description</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{appointment.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          {currentUserId && (
            <AppointmentMessages
              appointmentId={appointment.id}
              currentUserId={currentUserId}
              isAdmin={true}
            />
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointment.meetingLink && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => window.open(appointment.meetingLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Meeting
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const mailto = `mailto:${appointment.user.email}?subject=Regarding Your Appointment - ${appointment.appointmentType.name}`
                  window.location.href = mailto
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Student
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/admin/appointments')}
              >
                Back to All Appointments
              </Button>
            </CardContent>
          </Card>

          {/* Appointment Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded">{appointment.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{appointment.appointmentType.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{appointment.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Meeting Method</p>
                <p className="font-medium">{appointment.appointmentType.meetingType}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
