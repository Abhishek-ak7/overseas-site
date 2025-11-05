'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Search,
  Filter,
  ExternalLink,
  Clock,
  X,
} from 'lucide-react'

interface Event {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string | null
  event_type: string | null
  start_date: string
  end_date: string | null
  venue: string | null
  city: string | null
  country: string | null
  is_online: boolean
  is_free: boolean
  is_featured: boolean
  price: number | null
  currency: string
  max_attendees: number | null
  attendee_count: number
  registration_deadline: string | null
  view_count: number
}

interface FilterOption {
  value: string
  count: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [eventType, setEventType] = useState('all')
  const [country, setCountry] = useState('all')
  const [city, setCity] = useState('all')
  const [timeframe, setTimeframe] = useState('upcoming')
  const [isFree, setIsFree] = useState<boolean | null>(null)
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter options
  const [eventTypes, setEventTypes] = useState<FilterOption[]>([])
  const [countries, setCountries] = useState<FilterOption[]>([])
  const [cities, setCities] = useState<FilterOption[]>([])

  useEffect(() => {
    fetchEvents()
  }, [page, eventType, country, city, timeframe, isFree, isOnline])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search,
        timeframe,
      })

      if (eventType && eventType !== 'all') params.append('eventType', eventType)
      if (country && country !== 'all') params.append('country', country)
      if (city && city !== 'all') params.append('city', city)
      if (isFree !== null) params.append('isFree', isFree.toString())
      if (isOnline !== null) params.append('isOnline', isOnline.toString())

      const response = await fetch(`/api/events?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
        setTotal(data.pagination.total)
        setTotalPages(data.pagination.totalPages)
        setEventTypes(data.filters.eventTypes)
        setCountries(data.filters.countries)
        setCities(data.filters.cities)
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

  const clearFilters = () => {
    setSearch('')
    setEventType('all')
    setCountry('all')
    setCity('all')
    setTimeframe('upcoming')
    setIsFree(null)
    setIsOnline(null)
    setPage(1)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isRegistrationOpen = (deadline: string | null, startDate: string) => {
    const now = new Date()
    if (deadline && new Date(deadline) < now) return false
    if (new Date(startDate) < now) return false
    return true
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-red-100 max-w-3xl">
            Discover educational fairs, webinars, workshops, and networking events
            to help you achieve your study abroad dreams.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-4">
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Search */}
                <div>
                  <Label>Search</Label>
                  <form onSubmit={handleSearch} className="flex gap-2 mt-2">
                    <Input
                      placeholder="Search events..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                </div>

                {/* Timeframe */}
                <div>
                  <Label>When</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Event Type */}
                {eventTypes.length > 0 && (
                  <div>
                    <Label>Event Type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.value} ({type.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Country */}
                {countries.length > 0 && (
                  <div>
                    <Label>Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="All Countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {countries.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.value} ({c.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* City */}
                {cities.length > 0 && (
                  <div>
                    <Label>City</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.value} ({c.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Free Events */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="free"
                    checked={isFree === true}
                    onCheckedChange={(checked) => {
                      setIsFree(checked ? true : null)
                      setPage(1)
                    }}
                  />
                  <Label htmlFor="free" className="cursor-pointer">
                    Free events only
                  </Label>
                </div>

                {/* Online Events */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="online"
                    checked={isOnline === true}
                    onCheckedChange={(checked) => {
                      setIsOnline(checked ? true : null)
                      setPage(1)
                    }}
                  />
                  <Label htmlFor="online" className="cursor-pointer">
                    Online events only
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {timeframe === 'upcoming' ? 'Upcoming' : timeframe === 'past' ? 'Past' : 'All'} Events
                </h2>
                <p className="text-gray-600 mt-1">
                  {total} {total === 1 ? 'event' : 'events'} found
                </p>
              </div>
            </div>

            {/* Events Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <CardContent className="pt-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No events found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Link key={event.id} href={`/events/${event.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                        {/* Featured Image */}
                        {event.featured_image ? (
                          <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <img
                              src={event.featured_image}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {event.is_featured && (
                              <Badge className="absolute top-3 right-3 bg-yellow-500">
                                Featured
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="relative h-48 bg-gradient-to-br from-red-500 to-red-600 rounded-t-lg flex items-center justify-center">
                            <Calendar className="h-16 w-16 text-white opacity-50" />
                            {event.is_featured && (
                              <Badge className="absolute top-3 right-3 bg-yellow-500">
                                Featured
                              </Badge>
                            )}
                          </div>
                        )}

                        <CardContent className="pt-4">
                          {/* Event Type */}
                          {event.event_type && (
                            <Badge variant="secondary" className="mb-3">
                              {event.event_type}
                            </Badge>
                          )}

                          {/* Title */}
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                            {event.title}
                          </h3>

                          {/* Excerpt */}
                          {event.excerpt && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {event.excerpt}
                            </p>
                          )}

                          <div className="space-y-2 text-sm">
                            {/* Date */}
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>{formatDate(event.start_date)}</span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-gray-700">
                              {event.is_online ? (
                                <>
                                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                  <span>Online Event</span>
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="line-clamp-1">
                                    {event.city && event.country
                                      ? `${event.city}, ${event.country}`
                                      : event.city || event.country || 'TBA'}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 flex-shrink-0 text-gray-700" />
                              {event.is_free ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  Free
                                </Badge>
                              ) : (
                                <span className="text-gray-700">
                                  {event.price} {event.currency}
                                </span>
                              )}
                            </div>

                            {/* Registration Status */}
                            {event.registration_deadline && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                <span className="text-xs">
                                  {isRegistrationOpen(
                                    event.registration_deadline,
                                    event.start_date
                                  ) ? (
                                    <>Register by {new Date(event.registration_deadline).toLocaleDateString()}</>
                                  ) : (
                                    <span className="text-red-600">Registration Closed</span>
                                  )}
                                </span>
                              </div>
                            )}

                            {/* Attendees */}
                            {event.max_attendees && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="h-4 w-4 flex-shrink-0" />
                                <span className="text-xs">
                                  {event.attendee_count || 0} / {event.max_attendees} attendees
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            onClick={() => setPage(pageNum)}
                            size="sm"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-gray-500">...</span>
                          <Button
                            variant={page === totalPages ? 'default' : 'outline'}
                            onClick={() => setPage(totalPages)}
                            size="sm"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
