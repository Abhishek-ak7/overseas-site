"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, ArrowRight, Users } from 'lucide-react'
import Image from 'next/image'

interface Event {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string | null
  event_type: string
  start_date: string
  end_date: string | null
  venue: string | null
  city: string | null
  country: string | null
  is_online: boolean
  is_free: boolean
  is_featured: boolean
  price: string | null
  currency: string
  max_attendees: number | null
  attendee_count: number
}

export function EventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?timeframe=upcoming&limit=6')
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Upcoming Events
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Join Our Latest Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't miss out on our educational fairs, webinars, and workshops designed to help you achieve your study abroad dreams
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`}>
              <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200">
                {/* Event Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {event.featured_image ? (
                    <Image
                      src={event.featured_image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-primary/40" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {event.is_featured && (
                      <Badge className="bg-primary text-white">Featured</Badge>
                    )}
                    {event.is_free && (
                      <Badge className="bg-green-500 text-white">Free</Badge>
                    )}
                  </div>

                  {/* Event Type */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {event.event_type}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Event Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  {/* Event Excerpt */}
                  {event.excerpt && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.excerpt}
                    </p>
                  )}

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{formatTime(event.start_date)}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      {event.is_online ? (
                        <span>Online Event</span>
                      ) : (
                        <span className="truncate">
                          {event.city && event.country
                            ? `${event.city}, ${event.country}`
                            : event.country || event.city || 'TBA'}
                        </span>
                      )}
                    </div>

                    {/* Attendees */}
                    {event.max_attendees && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>
                          {event.attendee_count}/{event.max_attendees} registered
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="pt-4 border-t border-gray-100">
                    {event.is_free ? (
                      <span className="text-green-600 font-semibold">Free Entry</span>
                    ) : (
                      <span className="text-gray-900 font-semibold">
                        {event.currency} {event.price}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
            <Link href="/events">
              View All Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
