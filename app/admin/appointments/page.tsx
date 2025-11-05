'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { AppointmentConfirmModal } from '@/components/admin/appointment-confirm-modal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SimpleDropdown, SimpleDropdownItem, SimpleDropdownSeparator } from '@/components/ui/simple-dropdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Clock,
  User,
  Video,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  UserCheck,
  Mail,
  Calendar as CalendarIcon
} from 'lucide-react'

interface Appointment {
  id: string
  title?: string
  description?: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED'
  meetingLink?: string
  notes?: string
  feedback?: string
  rating?: number
  createdAt: string
  user: {
    id: string
    email: string
    user_profiles?: {
      first_name: string
      last_name: string
      phone?: string
    }
  }
  consultant: {
    id: string
    name: string
    email: string
    specialties: string[]
  }
  appointmentType: {
    id: string
    name: string
    price: number
    duration: number
    meetingType: string
  }
}

interface AppointmentStats {
  total: number
  today: number
  thisWeek: number
  scheduled: number
  completed: number
  cancelled: number
  revenue: number
  averageRating: number
}

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<AppointmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [consultantFilter, setConsultantFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')
  const [isUpdating, setIsUpdating] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
    fetchStats()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/admin/appointments')
      const data = await response.json()

      if (data.success) {
        // Transform the data to match our interface
        const transformedAppointments = data.appointments.map((appointment: any) => ({
          id: appointment.id,
          title: appointment.title,
          description: appointment.description,
          scheduledDate: appointment.scheduled_date ? new Date(appointment.scheduled_date).toISOString().split('T')[0] : '',
          scheduledTime: appointment.scheduled_time ? new Date(appointment.scheduled_time).toTimeString().split(' ')[0].substring(0, 5) : '',
          duration: appointment.duration,
          status: appointment.status,
          meetingLink: appointment.meeting_link,
          notes: appointment.notes,
          feedback: appointment.feedback,
          rating: appointment.rating,
          createdAt: appointment.created_at,
          user: {
            id: appointment.users?.id || appointment.user_id,
            email: appointment.users?.email || '',
            user_profiles: appointment.users?.user_profiles ? {
              first_name: appointment.users.user_profiles.first_name,
              last_name: appointment.users.user_profiles.last_name,
              phone: appointment.users.user_profiles.phone
            } : undefined
          },
          consultant: {
            id: appointment.consultants?.id || appointment.consultant_id,
            name: appointment.consultants?.name || 'Unknown',
            email: appointment.consultants?.email || '',
            specialties: appointment.consultants?.specialties || []
          },
          appointmentType: {
            id: appointment.appointment_types?.id || appointment.type_id,
            name: appointment.appointment_types?.name || 'Unknown',
            price: appointment.appointment_types?.price ? Number(appointment.appointment_types.price) : 0,
            duration: appointment.appointment_types?.duration || appointment.duration,
            meetingType: appointment.appointment_types?.meeting_type || 'VIDEO'
          }
        }))

        setAppointments(transformedAppointments)
      } else {
        throw new Error(data.message || 'Failed to fetch appointments')
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/appointments/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        // Calculate stats from appointments if API fails
        const today = new Date().toDateString()
        const thisWeekStart = new Date()
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())

        const todayAppointments = appointments.filter(apt =>
          new Date(apt.scheduledDate).toDateString() === today
        ).length

        const thisWeekAppointments = appointments.filter(apt =>
          new Date(apt.scheduledDate) >= thisWeekStart
        ).length

        const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED')
        const cancelledAppointments = appointments.filter(apt =>
          ['CANCELLED', 'NO_SHOW'].includes(apt.status)
        ).length

        const revenue = completedAppointments.reduce((sum, apt) =>
          sum + apt.appointmentType.price, 0
        )

        const ratingsSum = completedAppointments
          .filter(apt => apt.rating)
          .reduce((sum, apt) => sum + (apt.rating || 0), 0)
        const ratingsCount = completedAppointments.filter(apt => apt.rating).length

        setStats({
          total: appointments.length,
          today: todayAppointments,
          thisWeek: thisWeekAppointments,
          scheduled: appointments.filter(apt => ['SCHEDULED', 'CONFIRMED'].includes(apt.status)).length,
          completed: completedAppointments.length,
          cancelled: cancelledAppointments,
          revenue,
          averageRating: ratingsCount > 0 ? ratingsSum / ratingsCount : 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch appointment stats:', error)
    }
  }

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setAppointments(appointments.map(appointment =>
          appointment.id === appointmentId ? { ...appointment, status: newStatus as any } : appointment
        ))

        toast({
          title: "Success",
          description: "Appointment status updated successfully"
        })

        fetchStats()
      } else {
        throw new Error('Failed to update appointment')
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error)
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAppointments(appointments.filter(appointment => appointment.id !== appointmentId))
        toast({
          title: "Success",
          description: "Appointment deleted successfully"
        })
        fetchStats()
      } else {
        throw new Error('Failed to delete appointment')
      }
    } catch (error) {
      console.error('Failed to delete appointment:', error)
      toast({
        title: "Error",
        description: "Failed to delete appointment",
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
      case 'RESCHEDULED': return 'bg-yellow-100 text-yellow-800'
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
      case 'NO_SHOW': return <AlertCircle className="h-4 w-4" />
      case 'RESCHEDULED': return <Calendar className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
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

  const filteredAppointments = appointments.filter(appointment => {
    const searchString = `${appointment.user.user_profiles?.first_name} ${appointment.user.user_profiles?.last_name} ${appointment.user.email} ${appointment.consultant.name} ${appointment.title}`.toLowerCase()
    const matchesSearch = searchTerm === '' || searchString.includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesConsultant = consultantFilter === 'all' || appointment.consultant.id === consultantFilter

    let matchesDate = true
    if (dateFilter !== 'all') {
      const appointmentDate = new Date(appointment.scheduledDate)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      switch (dateFilter) {
        case 'today':
          matchesDate = appointmentDate.toDateString() === today.toDateString()
          break
        case 'tomorrow':
          matchesDate = appointmentDate.toDateString() === tomorrow.toDateString()
          break
        case 'week':
          matchesDate = appointmentDate >= today && appointmentDate <= nextWeek
          break
      }
    }

    // Filter by active tab
    let matchesTab = true
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'upcoming':
          matchesTab = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status)
          break
        case 'today':
          const today = new Date().toDateString()
          matchesTab = new Date(appointment.scheduledDate).toDateString() === today
          break
        case 'completed':
          matchesTab = appointment.status === 'COMPLETED'
          break
        case 'cancelled':
          matchesTab = ['CANCELLED', 'NO_SHOW'].includes(appointment.status)
          break
      }
    }

    return matchesSearch && matchesStatus && matchesConsultant && matchesDate && matchesTab
  })

  const getTabCounts = () => {
    const today = new Date().toDateString()
    return {
      all: appointments.length,
      upcoming: appointments.filter(a => ['SCHEDULED', 'CONFIRMED'].includes(a.status)).length,
      today: appointments.filter(a => new Date(a.scheduledDate).toDateString() === today).length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length,
      cancelled: appointments.filter(a => ['CANCELLED', 'NO_SHOW'].includes(a.status)).length
    }
  }

  const tabCounts = getTabCounts()

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Manage student consultations and bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/appointments/consultants')}>
            <UserCheck className="h-4 w-4 mr-2" />
            Manage Consultants
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/appointments/types')}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Appointment Types
          </Button>
          <Button onClick={() => router.push('/admin/appointments/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.today} today, {stats.thisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completed} completed, {stats.cancelled} cancelled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From completed appointments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Based on student feedback
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={consultantFilter} onValueChange={setConsultantFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Consultant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Consultants</SelectItem>
                <SelectItem value="consultant_1">Sarah Wilson</SelectItem>
                <SelectItem value="consultant_2">Dr. Michael Chen</SelectItem>
                <SelectItem value="consultant_3">Emma Thompson</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">Next 7 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setConsultantFilter('all')
              setDateFilter('all')
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({tabCounts.upcoming})</TabsTrigger>
          <TabsTrigger value="today">Today ({tabCounts.today})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({tabCounts.completed})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({tabCounts.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
              <CardDescription>Manage student consultation bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full relative">
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Student</TableHead>
                      <TableHead className="w-[140px]">Consultant</TableHead>
                      <TableHead className="w-[140px]">Type</TableHead>
                      <TableHead className="w-[160px]">Date & Time</TableHead>
                      <TableHead className="w-[90px]">Duration</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[100px]">Meeting</TableHead>
                      <TableHead className="w-[80px]">Price</TableHead>
                      <TableHead className="text-right w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="font-medium truncate">
                              {appointment.user.user_profiles?.first_name} {appointment.user.user_profiles?.last_name}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{appointment.user.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[140px] truncate text-sm">
                            {appointment.consultant.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[140px]">
                            <div className="font-medium text-sm truncate">{appointment.appointmentType.name}</div>
                            {appointment.title && appointment.title !== appointment.appointmentType.name && (
                              <div className="text-xs text-gray-600 truncate">{appointment.title}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-[160px] truncate">
                            {formatDateTime(appointment.scheduledDate, appointment.scheduledTime)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            {appointment.duration}m
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(appointment.status)}
                              <span className="truncate">{appointment.status.toLowerCase().replace('_', ' ')}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            {getMeetingIcon(appointment.appointmentType.meetingType)}
                            <span className="truncate">{appointment.appointmentType.meetingType.toLowerCase()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {appointment.appointmentType.price === 0 ? 'Free' : `$${appointment.appointmentType.price}`}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Primary Actions - Always Visible */}
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                              className="h-8"
                            >
                              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                              View & Message
                            </Button>
                            
                            {/* Quick Status Actions */}
                            {appointment.status === 'SCHEDULED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointmentId(appointment.id)
                                  setConfirmModalOpen(true)
                                }}
                                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                disabled={isUpdating}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                Confirm
                              </Button>
                            )}
                            
                            {/* More Actions Dropdown */}
                            <SimpleDropdown
                              align="end"
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  aria-label="More actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              }
                            >
                              <SimpleDropdownItem
                                onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </SimpleDropdownItem>
                              <SimpleDropdownItem
                                onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Messages
                              </SimpleDropdownItem>
                              <SimpleDropdownItem
                                onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Appointment
                              </SimpleDropdownItem>
                              <SimpleDropdownSeparator />
                              
                              {/* Status Updates */}
                              {appointment.status === 'SCHEDULED' && (
                                <SimpleDropdownItem
                                  onClick={() => {
                                    setSelectedAppointmentId(appointment.id)
                                    setConfirmModalOpen(true)
                                  }}
                                  disabled={isUpdating}
                                >
                                  <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                  Confirm Appointment
                                </SimpleDropdownItem>
                              )}
                              
                              {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
                                <SimpleDropdownItem
                                  onClick={() => handleStatusUpdate(appointment.id, 'IN_PROGRESS')}
                                  disabled={isUpdating}
                                >
                                  <Video className="h-4 w-4 mr-2 text-purple-600" />
                                  Start Meeting
                                </SimpleDropdownItem>
                              )}
                              
                              {appointment.status === 'IN_PROGRESS' && (
                                <SimpleDropdownItem
                                  onClick={() => handleStatusUpdate(appointment.id, 'COMPLETED')}
                                  disabled={isUpdating}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Mark Complete
                                </SimpleDropdownItem>
                              )}
                              
                              <SimpleDropdownItem
                                onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
                                disabled={isUpdating}
                              >
                                <XCircle className="h-4 w-4 mr-2 text-orange-600" />
                                Cancel
                              </SimpleDropdownItem>
                              
                              <SimpleDropdownSeparator />
                              
                              {/* Email Student */}
                              <SimpleDropdownItem
                                onClick={() => {
                                  const email = appointment.user.email
                                  const subject = `Regarding Your Appointment - ${appointment.appointmentType.name}`
                                  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`
                                }}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Email Student
                              </SimpleDropdownItem>
                              
                              <SimpleDropdownSeparator />
                              
                              {/* Delete */}
                              <SimpleDropdownItem
                                onClick={() => handleDelete(appointment.id)}
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </SimpleDropdownItem>
                            </SimpleDropdown>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>

              {filteredAppointments.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== 'all' || consultantFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your filters to see more appointments.'
                      : 'No appointments have been scheduled yet.'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && consultantFilter === 'all' && dateFilter === 'all' && (
                    <Button onClick={() => router.push('/admin/appointments/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Modal */}
      {selectedAppointmentId && (
        <AppointmentConfirmModal
          open={confirmModalOpen}
          onOpenChange={setConfirmModalOpen}
          appointmentId={selectedAppointmentId}
          onSuccess={() => {
            fetchAppointments()
            fetchStats()
            setSelectedAppointmentId(null)
          }}
        />
      )}
    </div>
  )
}