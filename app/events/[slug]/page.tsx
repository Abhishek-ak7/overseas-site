'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Share2,
  Eye,
  ArrowLeft,
} from 'lucide-react'

interface Event {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string | null
  images: string[]
  event_type: string | null

  // Location
  venue: string | null
  address: string | null
  city: string | null
  state_province: string | null
  country: string | null
  postal_code: string | null
  is_online: boolean
  meeting_link: string | null
  meeting_details: string | null

  // Date & Time
  start_date: string
  end_date: string | null
  timezone: string | null
  registration_deadline: string | null

  // Registration
  is_free: boolean
  price: number | null
  currency: string
  max_attendees: number | null
  attendee_count: number
  registration_link: string | null
  registration_email: string | null

  // Organizer
  organizer_name: string | null
  organizer_email: string | null
  organizer_phone: string | null
  organizer_website: string | null

  // Meta
  tags: string[]
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at: string

  users: {
    first_name: string
    last_name: string
    email: string
  }
}

interface RelatedEvent {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string | null
  event_type: string | null
  start_date: string
  city: string | null
  country: string | null
  is_online: boolean
  is_free: boolean
}

export default function EventDetailPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<RelatedEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchEvent()
    }
  }, [params.slug])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
        setRelatedEvents(data.relatedEvents || [])
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isRegistrationOpen = (event: Event) => {
    const now = new Date()
    if (event.registration_deadline && new Date(event.registration_deadline) < now) {
      return false
    }
    if (new Date(event.start_date) < now) {
      return false
    }
    if (event.max_attendees && event.attendee_count >= event.max_attendees) {
      return false
    }
    return true
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Skeleton className="h-96 w-full" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/events">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const registrationOpen = isRegistrationOpen(event)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        {event.featured_image ? (
          <div className="relative h-96 overflow-hidden">
            <img
              src={event.featured_image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
          </div>
        ) : (
          <div className="relative h-96 bg-gradient-to-br from-red-600 to-red-700">
            <div className="absolute inset-0 opacity-20">
              <Calendar className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Floating Header */}
        <div className="absolute bottom-0 left-0 right-0 text-white">
          <div className="container mx-auto px-4 pb-8">
            <Link href="/events" className="inline-flex items-center gap-2 mb-4 hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              {event.event_type && (
                <Badge className="bg-white text-red-600">{event.event_type}</Badge>
              )}
              {event.is_featured && (
                <Badge className="bg-yellow-500 text-white">Featured</Badge>
              )}
              {event.is_free && (
                <Badge className="bg-green-500 text-white">Free</Badge>
              )}
              {event.is_online && (
                <Badge className="bg-red-500 text-white">Online</Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>

            {event.excerpt && (
              <p className="text-xl text-gray-100 max-w-3xl">{event.excerpt}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <Card className="mb-8">
              <CardContent className="pt-6">
                {/* Event Details Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
                  {/* Date & Time */}
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="h-5 w-5" />
                      <span className="font-semibold">Date & Time</span>
                    </div>
                    <p className="text-lg">{formatDate(event.start_date)}</p>
                    {event.end_date && (
                      <p className="text-gray-600">to {formatDate(event.end_date)}</p>
                    )}
                    {event.timezone && (
                      <p className="text-sm text-gray-500 mt-1">{event.timezone}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="h-5 w-5" />
                      <span className="font-semibold">Location</span>
                    </div>
                    {event.is_online ? (
                      <div>
                        <p className="text-lg flex items-center gap-2">
                          <ExternalLink className="h-5 w-5" />
                          Online Event
                        </p>
                        {event.meeting_link && registrationOpen && (
                          <a
                            href={event.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:underline text-sm"
                          >
                            Join Meeting
                          </a>
                        )}
                        {event.meeting_details && (
                          <p className="text-sm text-gray-600 mt-2">
                            {event.meeting_details}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        {event.venue && <p className="text-lg font-medium">{event.venue}</p>}
                        {event.address && <p className="text-gray-700">{event.address}</p>}
                        <p className="text-gray-700">
                          {[event.city, event.state_province, event.country]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {event.postal_code && (
                          <p className="text-gray-600">{event.postal_code}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  {!event.is_free && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <DollarSign className="h-5 w-5" />
                        <span className="font-semibold">Price</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600">
                        {event.price} {event.currency}
                      </p>
                    </div>
                  )}

                  {/* Attendees */}
                  {event.max_attendees && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Users className="h-5 w-5" />
                        <span className="font-semibold">Attendees</span>
                      </div>
                      <p className="text-lg">
                        {event.attendee_count || 0} / {event.max_attendees}
                      </p>
                      {event.max_attendees - (event.attendee_count || 0) <= 10 && (
                        <p className="text-sm text-orange-600 mt-1">
                          Only {event.max_attendees - (event.attendee_count || 0)} spots left!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Registration Deadline */}
                  {event.registration_deadline && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="h-5 w-5" />
                        <span className="font-semibold">Registration Deadline</span>
                      </div>
                      <p className="text-lg">{formatDate(event.registration_deadline)}</p>
                    </div>
                  )}

                  {/* Views */}
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Eye className="h-5 w-5" />
                      <span className="font-semibold">Views</span>
                    </div>
                    <p className="text-lg">{event.view_count || 0}</p>
                  </div>
                </div>

                {/* Event Description */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                  <div dangerouslySetInnerHTML={{ __html: event.content }} />
                </div>

                {/* Image Gallery */}
                {event.images.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Event Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {event.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Event image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {event.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organizer Info */}
            {(event.organizer_name || event.organizer_email || event.organizer_phone || event.organizer_website) && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Organizer</h3>
                  <div className="space-y-3">
                    {event.organizer_name && (
                      <p className="text-lg font-medium">{event.organizer_name}</p>
                    )}
                    {event.organizer_email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${event.organizer_email}`}
                          className="hover:text-red-600"
                        >
                          {event.organizer_email}
                        </a>
                      </div>
                    )}
                    {event.organizer_phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4" />
                        <a
                          href={`tel:${event.organizer_phone}`}
                          className="hover:text-red-600"
                        >
                          {event.organizer_phone}
                        </a>
                      </div>
                    )}
                    {event.organizer_website && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Globe className="h-4 w-4" />
                        <a
                          href={event.organizer_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-red-600"
                        >
                          {event.organizer_website}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-96">
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                {/* Registration CTA */}
                {registrationOpen ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      {event.is_free ? (
                        <p className="text-3xl font-bold text-green-600 mb-2">FREE</p>
                      ) : (
                        <p className="text-3xl font-bold text-red-600 mb-2">
                          {event.price} {event.currency}
                        </p>
                      )}
                      <p className="text-gray-600">Registration is open</p>
                    </div>

                    {event.registration_link ? (
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full" size="lg">
                          Register Now
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    ) : event.registration_email ? (
                      <a href={`mailto:${event.registration_email}`} className="block">
                        <Button className="w-full" size="lg">
                          Email to Register
                          <Mail className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    ) : null}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Event
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-lg font-semibold text-red-600 mb-2">
                      Registration Closed
                    </p>
                    <p className="text-sm text-gray-600">
                      {event.max_attendees && event.attendee_count >= event.max_attendees
                        ? 'Event is full'
                        : 'Registration deadline has passed'}
                    </p>
                  </div>
                )}

                {/* Quick Info */}
                <div className="mt-6 pt-6 border-t space-y-4">
                  <h4 className="font-semibold">Quick Info</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{event.event_type || 'Event'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium">
                        {event.is_online ? 'Online' : 'In-Person'}
                      </span>
                    </div>
                    {event.max_attendees && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{event.max_attendees}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-4">Related Events</h4>
                  <div className="space-y-4">
                    {relatedEvents.map((related) => (
                      <Link key={related.id} href={`/events/${related.slug}`}>
                        <div className="group cursor-pointer">
                          {related.featured_image && (
                            <img
                              src={related.featured_image}
                              alt={related.title}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          )}
                          <h5 className="font-medium group-hover:text-red-600 transition-colors line-clamp-2">
                            {related.title}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatShortDate(related.start_date)}
                          </p>
                          {related.event_type && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {related.event_type}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
