'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { AppointmentMessages } from '@/components/appointments/appointment-messages'
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

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')

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

        setAppointment({
          id: apt.id,
          title: apt.title,
          scheduledDate: apt.scheduled_date ? new Date(apt.scheduled_date).toISOString().split('T')[0] : '',
          scheduledTime: apt.scheduled_time ? new Date(apt.scheduled_time).toTimeString().split(' ')[0].substring(0, 5) : '',
          duration: apt.duration,
          status: apt.status,
          meetingLink: apt.meeting_link,
          notes: apt.notes,
          description: apt.description,
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

  const handleCancelAppointment = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully"
        })
        fetchAppointment()
      } else {
        throw new Error('Failed to cancel appointment')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
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
            <Button onClick={() => router.push('/dashboard/appointments')}>
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
          onClick={() => router.push('/dashboard/appointments')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{appointment.appointmentType.name}</h1>
            <p className="text-gray-600 mt-2">Appointment Details</p>
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
              <CardTitle>Appointment Information</CardTitle>
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

              {/* Meeting Link */}
              {appointment.meetingLink && appointment.status === 'CONFIRMED' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-medium text-green-900 mb-2">Meeting Link</p>
                  <Button
                    variant="default"
                    onClick={() => window.open(appointment.meetingLink, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Meeting
                  </Button>
                </div>
              )}

              {/* Notes from Admin */}
              {appointment.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-900 mb-2">Notes from Admin</p>
                  <p className="text-blue-800 whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              )}

              {/* Description */}
              {appointment.description && (
                <div>
                  <p className="font-medium text-gray-900 mb-2">Description</p>
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
              isAdmin={false}
            />
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointment.meetingLink && appointment.status === 'CONFIRMED' && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => window.open(appointment.meetingLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              )}

              {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleCancelAppointment}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Appointment
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/dashboard/appointments')}
              >
                Back to All Appointments
              </Button>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions or need to reschedule, please use the messaging system or contact support.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
