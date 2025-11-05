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
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Star, Globe, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Partner {
  id: string
  name: string
  logo_url?: string
  website_url?: string
  country?: string
  partner_type: string
  description?: string
  ranking?: number
  established_year?: number
  student_count?: number
  courses_offered: string[]
  is_active: boolean
  is_featured: boolean
  is_preferred: boolean
  order_index: number
  contact_email?: string
  contact_phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  created_at: string
  updated_at: string
}

interface PartnerFormData {
  name: string
  logoUrl?: string
  websiteUrl?: string
  country?: string
  partnerType: string
  description?: string
  ranking?: number
  establishedYear?: number
  studentCount?: number
  coursesOffered: string[]
  isActive: boolean
  isFeatured: boolean
  isPreferred: boolean
  orderIndex: number
  contactEmail?: string
  contactPhone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

const defaultFormData: PartnerFormData = {
  name: '',
  logoUrl: '',
  websiteUrl: '',
  country: '',
  partnerType: 'university',
  description: '',
  ranking: undefined,
  establishedYear: undefined,
  studentCount: undefined,
  coursesOffered: [],
  isActive: true,
  isFeatured: false,
  isPreferred: false,
  orderIndex: 0,
  contactEmail: '',
  contactPhone: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
}

const partnerTypeOptions = [
  'university', 'college', 'institute', 'language-school', 'pathway-provider', 'other'
]

const countryOptions = [
  'USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Netherlands',
  'Switzerland', 'Ireland', 'New Zealand', 'Singapore', 'Other'
]

export default function PartnersManagementPage() {
  const router = useRouter()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PartnerFormData>(defaultFormData)
  const [isCreating, setIsCreating] = useState(false)
  const [coursesText, setCoursesText] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const result = await ApiClient.get('/api/partners?includeInactive=true')
      if (result.error) {
        console.error('Failed to fetch partners:', result.error)
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        toast({
          title: "Error",
          description: result.error || "Failed to fetch partners",
          variant: "destructive"
        })
      } else {
        setPartners(result.data?.partners || [])
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
      toast({
        title: "Error",
        description: "Failed to fetch partners",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId ? `/api/partners/${editingId}` : '/api/partners'

      // Parse courses from text
      const coursesArray = coursesText.split(',').map(course => course.trim()).filter(Boolean)

      const result = editingId
        ? await ApiClient.put(url, {
            ...formData,
            coursesOffered: coursesArray
          })
        : await ApiClient.post(url, {
            ...formData,
            coursesOffered: coursesArray
          })

      if (result.error) {
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        toast({
          title: "Error",
          description: result.error || `Failed to ${editingId ? 'update' : 'create'} partner`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: `Partner ${editingId ? 'updated' : 'created'} successfully`
        })

        setFormData(defaultFormData)
        setCoursesText('')
        setEditingId(null)
        setIsCreating(false)
        fetchPartners()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingId ? 'update' : 'create'} partner`,
        variant: "destructive"
      })
    }
  }

  const handleEdit = (partner: Partner) => {
    setFormData({
      name: partner.name,
      logoUrl: partner.logo_url || '',
      websiteUrl: partner.website_url || '',
      country: partner.country || '',
      partnerType: partner.partner_type,
      description: partner.description || '',
      ranking: partner.ranking,
      establishedYear: partner.established_year,
      studentCount: partner.student_count,
      coursesOffered: partner.courses_offered || [],
      isActive: partner.is_active,
      isFeatured: partner.is_featured,
      isPreferred: partner.is_preferred,
      orderIndex: partner.order_index,
      contactEmail: partner.contact_email || '',
      contactPhone: partner.contact_phone || '',
      address: partner.address || '',
      city: partner.city || '',
      state: partner.state || '',
      zipCode: partner.zip_code || ''
    })
    setCoursesText((partner.courses_offered || []).join(', '))
    setEditingId(partner.id)
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return

    try {
      const result = await ApiClient.delete(`/api/partners/${id}`)

      if (result.error) {
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        toast({
          title: "Error",
          description: result.error || "Failed to delete partner",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Partner deleted successfully"
        })
        fetchPartners()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    setFormData(defaultFormData)
    setCoursesText('')
    setEditingId(null)
    setIsCreating(false)
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
          <h1 className="text-3xl font-bold">Partners Management</h1>
          <p className="text-gray-600">Manage university and institution partnerships</p>
        </div>

        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Partner
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Partner' : 'Create New Partner'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update partner information' : 'Add a new university or institution partner'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Institution Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Harvard University"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnerType">Partner Type</Label>
                  <Select value={formData.partnerType} onValueChange={(value) => setFormData({ ...formData, partnerType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select partner type" />
                    </SelectTrigger>
                    <SelectContent>
                      {partnerTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ranking">World Ranking (Optional)</Label>
                  <Input
                    id="ranking"
                    type="number"
                    value={formData.ranking || ''}
                    onChange={(e) => setFormData({ ...formData, ranking: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://university.edu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    value={formData.establishedYear || ''}
                    onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="1636"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentCount">Student Count</Label>
                  <Input
                    id="studentCount"
                    type="number"
                    value={formData.studentCount || ''}
                    onChange={(e) => setFormData({ ...formData, studentCount: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="25000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the institution..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="coursesOffered">Courses Offered (comma-separated)</Label>
                  <Textarea
                    id="coursesOffered"
                    value={coursesText}
                    onChange={(e) => setCoursesText(e.target.value)}
                    placeholder="Computer Science, Business Administration, Engineering, Medicine"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="admissions@university.edu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1-555-0123"
                  />
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
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPreferred"
                    checked={formData.isPreferred}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPreferred: checked })}
                  />
                  <Label htmlFor="isPreferred">Preferred Partner</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Create'} Partner
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
        {partners.map((partner) => (
          <Card key={partner.id} className={!partner.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {partner.logo_url ? (
                      <Image
                        src={partner.logo_url}
                        alt={partner.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Globe className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{partner.name}</h3>
                      {partner.website_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => window.open(partner.website_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      {partner.country && <span>{partner.country}</span>}
                      {partner.ranking && (
                        <>
                          {partner.country && <span>•</span>}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            Rank #{partner.ranking}
                          </span>
                        </>
                      )}
                      {partner.established_year && (
                        <>
                          <span>•</span>
                          <span>Est. {partner.established_year}</span>
                        </>
                      )}
                    </div>

                    {partner.description && (
                      <p className="text-gray-600 text-sm mb-2">{partner.description}</p>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{partner.partner_type}</Badge>
                      {partner.is_featured && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Featured
                        </Badge>
                      )}
                      {partner.is_preferred && (
                        <Badge variant="default" className="bg-purple-600">
                          Preferred
                        </Badge>
                      )}
                      {partner.student_count && (
                        <Badge variant="outline">{partner.student_count.toLocaleString()} students</Badge>
                      )}
                    </div>

                    {partner.courses_offered && partner.courses_offered.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Courses:</p>
                        <div className="flex gap-1 flex-wrap">
                          {partner.courses_offered.slice(0, 3).map((course, index) => (
                            <Badge key={index} variant="outline" className="text-xs">{course}</Badge>
                          ))}
                          {partner.courses_offered.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{partner.courses_offered.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {partner.is_active ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(partner)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(partner.id)}
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

        {partners.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No partners found</p>
              <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Your First Partner
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}