'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/image-upload'
import { X, Loader2, Calendar, MapPin, DollarSign, Users, ExternalLink } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

interface EventFormProps {
  eventId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface EventFormData {
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string
  images: string[]
  event_type: string

  // Location
  venue: string
  address: string
  city: string
  country: string
  is_online: boolean
  meeting_link: string

  // Date & Time
  start_date: string
  end_date: string
  registration_deadline: string

  // Registration
  is_free: boolean
  price: string
  currency: string
  max_attendees: string
  registration_link: string

  // Organizer
  organizer_name: string
  organizer_email: string
  organizer_phone: string

  // SEO
  meta_title: string
  meta_description: string
  tags: string[]

  // Status
  is_published: boolean
  is_featured: boolean
}

const EVENT_TYPES = [
  'Workshop',
  'Seminar',
  'Webinar',
  'Conference',
  'Fair',
  'Info Session',
  'Open House',
  'Networking',
  'Other',
]

const CURRENCIES = ['USD', 'CAD', 'AUD', 'GBP', 'EUR', 'INR']

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'New Zealand',
  'Germany',
  'France',
  'Ireland',
  'Singapore',
  'India',
]

export function EventForm({ eventId, onSuccess, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    images: [],
    event_type: '',
    venue: '',
    address: '',
    city: '',
    country: '',
    is_online: false,
    meeting_link: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    is_free: true,
    price: '',
    currency: 'USD',
    max_attendees: '',
    registration_link: '',
    organizer_name: '',
    organizer_email: '',
    organizer_phone: '',
    meta_title: '',
    meta_description: '',
    tags: [],
    is_published: false,
    is_featured: false,
  })

  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}`)
      if (response.ok) {
        const event = await response.json()
        setFormData({
          title: event.title || '',
          slug: event.slug || '',
          content: event.content || '',
          excerpt: event.excerpt || '',
          featured_image: event.featured_image || '',
          images: event.images || [],
          event_type: event.event_type || '',
          venue: event.venue || '',
          address: event.address || '',
          city: event.city || '',
          country: event.country || '',
          is_online: event.is_online || false,
          meeting_link: event.meeting_link || '',
          start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
          end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
          registration_deadline: event.registration_deadline
            ? new Date(event.registration_deadline).toISOString().slice(0, 16)
            : '',
          is_free: event.is_free !== undefined ? event.is_free : true,
          price: event.price?.toString() || '',
          currency: event.currency || 'USD',
          max_attendees: event.max_attendees?.toString() || '',
          registration_link: event.registration_link || '',
          organizer_name: event.organizer_name || '',
          organizer_email: event.organizer_email || '',
          organizer_phone: event.organizer_phone || '',
          meta_title: event.meta_title || '',
          meta_description: event.meta_description || '',
          tags: event.tags || [],
          is_published: event.is_published || false,
          is_featured: event.is_featured || false,
        })
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: eventId ? prev.slug : generateSlug(title),
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }))
  }

  const handleArrayRemove = (field: keyof EventFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = eventId
        ? `/api/admin/events/${eventId}`
        : '/api/admin/events'

      const method = eventId ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSuccess?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save event')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  if (loading && eventId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Annual University Fair 2025"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="annual-university-fair-2025"
                required
              />
            </div>

            <div>
              <Label htmlFor="event_type">Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="excerpt">Short Description</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary of the event..."
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="content">Event Details</Label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Full event description, agenda, speakers, etc..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date & Time *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date & Time</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="registration_deadline">Registration Deadline</Label>
              <Input
                id="registration_deadline"
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Switch
              checked={formData.is_online}
              onCheckedChange={(checked) => setFormData({ ...formData, is_online: checked })}
            />
            <Label>Online Event</Label>
          </div>

          {formData.is_online ? (
            <div>
              <Label htmlFor="meeting_link">Meeting Link</Label>
              <Input
                id="meeting_link"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                placeholder="https://zoom.us/j/123456789"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="venue">Venue Name</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Convention Center"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street, New York, NY 10001"
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Switch
              checked={formData.is_free}
              onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
            />
            <Label>Free Event</Label>
          </div>

          {!formData.is_free && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Ticket Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_attendees">Maximum Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                placeholder="Unlimited"
              />
            </div>

            <div>
              <Label htmlFor="registration_link">Registration Link</Label>
              <Input
                id="registration_link"
                type="url"
                value={formData.registration_link}
                onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                placeholder="https://example.com/register"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Organizer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizer_name">Organizer Name</Label>
              <Input
                id="organizer_name"
                value={formData.organizer_name}
                onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                placeholder="BN Overseas"
              />
            </div>

            <div>
              <Label htmlFor="organizer_email">Organizer Email</Label>
              <Input
                id="organizer_email"
                type="email"
                value={formData.organizer_email}
                onChange={(e) => setFormData({ ...formData, organizer_email: e.target.value })}
                placeholder="info@bnoverseas.com"
              />
            </div>

            <div>
              <Label htmlFor="organizer_phone">Organizer Phone</Label>
              <Input
                id="organizer_phone"
                value={formData.organizer_phone}
                onChange={(e) => setFormData({ ...formData, organizer_phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <ImageUpload
              label="Featured Image"
              value={formData.featured_image}
              onChange={(url) => setFormData({ ...formData, featured_image: url })}
              context="events"
              showUrl={true}
            />
          </div>

          <div>
            <ImageUpload
              label="Upload Gallery Image"
              value=""
              onChange={(url) => {
                if (url) {
                  setFormData({ ...formData, images: [...formData.images, url] })
                }
              }}
              context="events"
              showUrl={true}
            />

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleArrayRemove('images', index)}
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO & Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              placeholder="Annual University Fair 2025 | BN Overseas"
            />
          </div>

          <div>
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              placeholder="Join us for the biggest university fair of the year..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Add a tag"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Published</Label>
              <p className="text-sm text-gray-600">Make this event visible to the public</p>
            </div>
            <Switch
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Featured</Label>
              <p className="text-sm text-gray-600">Show this event in featured section</p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end sticky bottom-4 bg-white p-4 rounded-lg border shadow-lg">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>{eventId ? 'Update Event' : 'Create Event'}</>
          )}
        </Button>
      </div>
    </form>
  )
}
