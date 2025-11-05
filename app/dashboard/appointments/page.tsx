'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  Calendar,
  Clock,
  Video,
  Phone,
  User,
  MessageSquare,
  Plus,
  ExternalLink,
  XCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface Appointment {
  id: string
  title?: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED'
  meetingLink?: string
  notes?: string
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

export default function UserAppointmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)

  useEffect(() => {
    fetchAppointments()
    
    // Check for success parameter from booking
    const fromBooking = searchParams.get('from')
    if (fromBooking === 'booking') {
      setShowSuccessBanner(true)
      toast({
        title: "Appointment booked successfully! ✅",
        description: "Check your email for confirmation details and meeting link.",
      })
      
      // Clean up URL without the parameter
      router.replace('/dashboard/appointments', { scroll: false })
      
      // Hide banner after 10 seconds
      setTimeout(() => {
        setShowSuccessBanner(false)
      }, 10000)
    }
  }, [searchParams])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      const data = await response.json()

      if (data.appointments) {
        const transformedAppointments = data.appointments.map((apt: any) => ({
          id: apt.id,
          title: apt.title,
          scheduledDate: apt.scheduled_date ? new Date(apt.scheduled_date).toISOString().split('T')[0] : '',
          scheduledTime: apt.scheduled_time ? new Date(apt.scheduled_time).toTimeString().split(' ')[0].substring(0, 5) : '',
          duration: apt.duration,
          status: apt.status,
          meetingLink: apt.meeting_link,
          notes: apt.notes,
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
        }))

        setAppointments(transformedAppointments)
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully"
        })
        fetchAppointments()
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
      case 'NO_SHOW': return 'bg-orange-100 text-orange-800'
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filterAppointments = (status: string) => {
    const now = new Date()

    switch (status) {
      case 'upcoming':
        return appointments.filter(apt =>
          ['SCHEDULED', 'CONFIRMED'].includes(apt.status) &&
          new Date(apt.scheduledDate) >= now
        )
      case 'past':
        return appointments.filter(apt =>
          apt.status === 'COMPLETED' ||
          (new Date(apt.scheduledDate) < now && !['SCHEDULED', 'CONFIRMED'].includes(apt.status))
        )
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'CANCELLED')
      default:
        return appointments
    }
  }

  const filteredAppointments = filterAppointments(activeTab)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Banner */}
      {showSuccessBanner && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Appointment Booked Successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your appointment has been confirmed. Check your email for the meeting link and confirmation details.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">Manage your consultation bookings</p>
        </div>
        <Button onClick={() => router.push('/appointments/book')}>
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'upcoming'
                    ? "You don't have any upcoming appointments."
                    : `No ${activeTab} appointments.`
                  }
                </p>
                <Button onClick={() => router.push('/appointments/book')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {appointment.appointmentType.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {appointment.consultant.name}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                        {getStatusIcon(appointment.status)}
                        <span className="text-xs">{appointment.status.toLowerCase()}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDateTime(appointment.scheduledDate, appointment.scheduledTime)}
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {appointment.duration} minutes
                    </div>

                    {/* Meeting Type */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getMeetingIcon(appointment.appointmentType.meetingType)}
                      {appointment.appointmentType.meetingType}
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-900 mb-1">Notes from Admin:</p>
                        <p className="text-sm text-blue-800">{appointment.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      {appointment.meetingLink && appointment.status === 'CONFIRMED' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(appointment.meetingLink, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Join Meeting
                        </Button>
                      )}
                      {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
