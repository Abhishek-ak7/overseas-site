"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Star, Image, Video, MapPin, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Testimonial {
  id: string
  student_name: string
  student_email?: string
  student_phone?: string
  university?: string
  course?: string
  country?: string
  city?: string
  graduation_year?: number
  current_position?: string
  company?: string
  testimonial_text: string
  rating: number
  image?: string
  video?: string
  date_submitted: string
  is_featured: boolean
  is_published: boolean
  category?: string
  order_index: number
  created_at: string
  updated_at: string
}

interface TestimonialFormData {
  studentName: string
  studentEmail?: string
  studentPhone?: string
  university?: string
  course?: string
  country?: string
  city?: string
  graduationYear?: number
  currentPosition?: string
  company?: string
  testimonialText: string
  rating: number
  image?: string
  video?: string
  isFeatured: boolean
  isPublished: boolean
  category?: string
  orderIndex: number
}

const defaultFormData: TestimonialFormData = {
  studentName: '',
  studentEmail: '',
  studentPhone: '',
  university: '',
  course: '',
  country: '',
  city: '',
  graduationYear: new Date().getFullYear(),
  currentPosition: '',
  company: '',
  testimonialText: '',
  rating: 5,
  image: '',
  video: '',
  isFeatured: false,
  isPublished: true,
  category: 'general',
  orderIndex: 0
}

const categoryOptions = [
  'general', 'success-story', 'university-experience', 'career-guidance', 'visa-process', 'accommodation'
]

const ratingOptions = [1, 2, 3, 4, 5]

export default function TestimonialsManagementPage() {
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<TestimonialFormData>(defaultFormData)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const result = await ApiClient.get('/api/testimonials?includeUnpublished=true')
      if (result.error) {
        console.error('Failed to fetch testimonials:', result.error)
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        toast({
          title: "Error",
          description: result.error || "Failed to fetch testimonials",
          variant: "destructive"
        })
      } else {
        setTestimonials(result.data?.testimonials || [])
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast({
        title: "Error",
        description: "Failed to fetch testimonials",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId ? `/api/testimonials/${editingId}` : '/api/testimonials'

      const result = editingId
        ? await ApiClient.put(url, formData)
        : await ApiClient.post(url, formData)

      if (result.error) {
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        toast({
          title: "Error",
          description: result.error || `Failed to ${editingId ? 'update' : 'create'} testimonial`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: `Testimonial ${editingId ? 'updated' : 'created'} successfully`
        })

        setFormData(defaultFormData)
        setEditingId(null)
        setIsCreating(false)
        fetchTestimonials()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingId ? 'update' : 'create'} testimonial`,
        variant: "destructive"
      })
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      studentName: testimonial.student_name,
      studentEmail: testimonial.student_email || '',
      studentPhone: testimonial.student_phone || '',
      university: testimonial.university || '',
      course: testimonial.course || '',
      country: testimonial.country || '',
      city: testimonial.city || '',
      graduationYear: testimonial.graduation_year || new Date().getFullYear(),
      currentPosition: testimonial.current_position || '',
      company: testimonial.company || '',
      testimonialText: testimonial.testimonial_text,
      rating: testimonial.rating,
      image: testimonial.image || '',
      video: testimonial.video || '',
      isFeatured: testimonial.is_featured,
      isPublished: testimonial.is_published,
      category: testimonial.category || 'general',
      orderIndex: testimonial.order_index
    })
    setEditingId(testimonial.id)
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const result = await ApiClient.delete(`/api/testimonials/${id}`)

      if (result.error) {
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        toast({
          title: "Error",
          description: result.error || "Failed to delete testimonial",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Testimonial deleted successfully"
        })
        fetchTestimonials()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    setFormData(defaultFormData)
    setEditingId(null)
    setIsCreating(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Testimonials Management</h1>
          <p className="text-gray-600">Manage student testimonials and success stories</p>
        </div>

        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Testimonial
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Testimonial' : 'Create New Testimonial'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update testimonial information' : 'Add a new student testimonial'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentEmail">Student Email (Optional)</Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="University of Oxford"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    placeholder="Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United Kingdom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="London"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || new Date().getFullYear() })}
                    min="2000"
                    max="2030"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratingOptions.map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderIndex">Order Index</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="testimonialText">Testimonial Text</Label>
                  <Textarea
                    id="testimonialText"
                    value={formData.testimonialText}
                    onChange={(e) => setFormData({ ...formData, testimonialText: e.target.value })}
                    placeholder="Share your experience..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPosition">Current Position (Optional)</Label>
                  <Input
                    id="currentPosition"
                    value={formData.currentPosition}
                    onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                    placeholder="Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Google"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL (Optional)</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video">Video URL (Optional)</Label>
                  <Input
                    id="video"
                    value={formData.video}
                    onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Create'} Testimonial
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className={!testimonial.is_published ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.student_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <GraduationCap className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{testimonial.student_name}</h3>
                      <div className="flex gap-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      {testimonial.university && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {testimonial.university}
                        </span>
                      )}
                      {testimonial.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {testimonial.city ? `${testimonial.city}, ${testimonial.country}` : testimonial.country}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-3">{testimonial.testimonial_text}</p>

                    <div className="flex gap-2 mb-2">
                      {testimonial.category && (
                        <Badge variant="secondary">{testimonial.category}</Badge>
                      )}
                      {testimonial.is_featured && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Featured
                        </Badge>
                      )}
                      {testimonial.image && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Image className="w-3 h-3" />
                          Image
                        </Badge>
                      )}
                      {testimonial.video && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video
                        </Badge>
                      )}
                    </div>

                    {testimonial.current_position && testimonial.company && (
                      <p className="text-sm text-gray-500">
                        {testimonial.current_position} at {testimonial.company}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {testimonial.is_published ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(testimonial)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {testimonials.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No testimonials found</p>
              <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Your First Testimonial
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}