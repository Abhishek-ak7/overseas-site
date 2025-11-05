'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EventForm } from '@/components/admin/event-form'
import {
  Calendar,
  MapPin,
  Users,
  Eye,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  DollarSign,
} from 'lucide-react'

interface Event {
  id: string
  title: string
  slug: string
  event_type: string
  start_date: string
  end_date: string | null
  city: string
  country: string
  venue: string
  is_online: boolean
  is_published: boolean
  is_featured: boolean
  is_free: boolean
  price: number | null
  currency: string
  max_attendees: number | null
  attendee_count: number
  view_count: number
  created_at: string
  users: {
    first_name: string
    last_name: string
  }
}

interface Stats {
  total: number
  published: number
  upcoming: number
  totalViews: number
  totalAttendees: number
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>()

  useEffect(() => {
    fetchEvents()
  }, [page, statusFilter, typeFilter])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status: statusFilter,
        eventType: typeFilter,
      })

      const response = await fetch(`/api/admin/events?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
        setStats(data.stats)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchEvents()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchEvents()
      } else {
        alert('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event')
    }
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingId(undefined)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingId(undefined)
    fetchEvents()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date()
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {editingId ? 'Edit Event' : 'Create Event'}
          </h1>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Back to Events
          </Button>
        </div>
        <EventForm
          eventId={editingId}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 w-full max-w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.published}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.upcoming}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Attendees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttendees}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events by title, city, or venue..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Seminar">Seminar</SelectItem>
                <SelectItem value="Webinar">Webinar</SelectItem>
                <SelectItem value="Conference">Conference</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Info Session">Info Session</SelectItem>
                <SelectItem value="Open House">Open House</SelectItem>
                <SelectItem value="Networking">Networking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No events found</p>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first event
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Event</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[160px]">Date</TableHead>
                    <TableHead className="w-[140px]">Location</TableHead>
                    <TableHead className="w-[80px]">Price</TableHead>
                    <TableHead className="w-[90px]">Stats</TableHead>
                    <TableHead className="w-[90px]">Status</TableHead>
                    <TableHead className="w-[100px]">Author</TableHead>
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <div className="font-medium flex items-center gap-1">
                            <span className="truncate">{event.title}</span>
                            {event.is_featured && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                ★
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            /{event.slug}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {event.event_type && (
                          <Badge variant="outline">{event.event_type}</Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-xs max-w-[160px]">
                          <div className="truncate mb-1">
                            {formatDate(event.start_date)}
                          </div>
                          {isUpcoming(event.start_date) && (
                            <Badge variant="default" className="text-xs">
                              Upcoming
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs max-w-[140px]">
                          {event.is_online ? (
                            <Badge variant="secondary" className="text-xs">
                              Online
                            </Badge>
                          ) : (
                            <div className="truncate">
                              {event.city || event.country || 'TBA'}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs">
                          {event.is_free ? (
                            <Badge variant="secondary" className="text-xs">Free</Badge>
                          ) : (
                            <span className="truncate">${event.price}</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-gray-400" />
                            <span>{event.view_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span>{event.attendee_count || 0}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={event.is_published ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {event.is_published ? 'Live' : 'Draft'}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs truncate max-w-[100px]">
                          {event.users.first_name} {event.users.last_name}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(event.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(event.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
