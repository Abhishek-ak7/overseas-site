'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UniversityFormProps {
  university?: any
  isEdit?: boolean
}

export function UniversityForm({ university, isEdit = false }: UniversityFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: university?.name || '',
    slug: university?.slug || '',
    country: university?.country || '',
    city: university?.city || '',
    state: university?.state || '',
    address: university?.address || '',
    postal_code: university?.postal_code || '',
    logo_url: university?.logo_url || '',
    banner_url: university?.banner_url || '',
    images: university?.images || [],
    website: university?.website || '',
    email: university?.email || '',
    phone: university?.phone || '',
    description: university?.description || '',
    about: university?.about || '',
    facilities: university?.facilities || [],
    type: university?.type || 'Public',
    established_year: university?.established_year || '',
    accreditation: university?.accreditation || '',
    ranking_national: university?.ranking_national || '',
    ranking_world: university?.ranking_world || '',
    student_count: university?.student_count || '',
    international_students: university?.international_students || '',
    acceptance_rate: university?.acceptance_rate || '',
    avg_tuition_fee: university?.avg_tuition_fee || '',
    currency: university?.currency || 'USD',
    campus_size: university?.campus_size || '',
    departments: university?.departments || [],
    notable_alumni: university?.notable_alumni || [],
    partnerships: university?.partnerships || [],
    admission_requirements: university?.admission_requirements || '',
    application_deadline: university?.application_deadline || '',
    language_requirement: university?.language_requirement || '',
    tags: university?.tags || [],
    meta_title: university?.meta_title || '',
    meta_description: university?.meta_description || '',
    is_featured: university?.is_featured || false,
    is_published: university?.is_published || false,
  })

  const [newFacility, setNewFacility] = useState('')
  const [newDepartment, setNewDepartment] = useState('')
  const [newAlumni, setNewAlumni] = useState('')
  const [newPartnership, setNewPartnership] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newImage, setNewImage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = isEdit
        ? `/api/admin/universities/${university.id}`
        : '/api/admin/universities'

      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save university')

      toast({
        title: "Success",
        description: `University ${isEdit ? 'updated' : 'created'} successfully`,
      })

      router.push('/admin/universities')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} university`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleArrayAdd = (field: string, value: string, setter: (v: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field as keyof typeof prev] as any[], value.trim()]
      }))
      setter('')
    }
  }

  const handleArrayRemove = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'Add'} University</h1>
            <p className="text-gray-600 mt-1">Fill in the university details below. Only name, country, and city are required.</p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'} University
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="stats">Stats & Rankings</TabsTrigger>
            <TabsTrigger value="seo">SEO & Publishing</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">University Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Harvard University"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="harvard-university"
                    />
                    <p className="text-xs text-gray-500">Leave empty to auto-generate from name</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Public">Public</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Research">Research</SelectItem>
                        <SelectItem value="Liberal Arts">Liberal Arts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                    <Input
                      id="country"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="United States"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Cambridge"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Massachusetts"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      placeholder="02138"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.harvard.edu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admissions@harvard.edu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (617) 495-1000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="A brief description of the university (2-3 sentences)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>About (Rich Text)</Label>
                  <RichTextEditor
                    value={formData.about}
                    onChange={(value) => setFormData({ ...formData, about: value })}
                    placeholder="Write a detailed description about the university..."
                    minHeight={300}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Facilities</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newFacility}
                      onChange={(e) => setNewFacility(e.target.value)}
                      placeholder="Add facility (e.g., Library, Sports Complex)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleArrayAdd('facilities', newFacility, setNewFacility)
                        }
                      }}
                    />
                    <Button type="button" onClick={() => handleArrayAdd('facilities', newFacility, setNewFacility)}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.facilities.map((facility, index) => (
                      <Badge key={index} variant="secondary">
                        {facility}
                        <X
                          className="ml-2 h-3 w-3 cursor-pointer"
                          onClick={() => handleArrayRemove('facilities', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Departments</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      placeholder="Add department (e.g., Computer Science, Engineering)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleArrayAdd('departments', newDepartment, setNewDepartment)
                        }
                      }}
                    />
                    <Button type="button" onClick={() => handleArrayAdd('departments', newDepartment, setNewDepartment)}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.departments.map((dept, index) => (
                      <Badge key={index} variant="secondary">
                        {dept}
                        <X
                          className="ml-2 h-3 w-3 cursor-pointer"
                          onClick={() => handleArrayRemove('departments', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notable Alumni</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newAlumni}
                      onChange={(e) => setNewAlumni(e.target.value)}
                      placeholder="Add notable alumni"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleArrayAdd('notable_alumni', newAlumni, setNewAlumni)
                        }
                      }}
                    />
                    <Button type="button" onClick={() => handleArrayAdd('notable_alumni', newAlumni, setNewAlumni)}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.notable_alumni.map((alumni, index) => (
                      <Badge key={index} variant="secondary">
                        {alumni}
                        <X
                          className="ml-2 h-3 w-3 cursor-pointer"
                          onClick={() => handleArrayRemove('notable_alumni', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Partnerships</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newPartnership}
                      onChange={(e) => setNewPartnership(e.target.value)}
                      placeholder="Add partnership/affiliation"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleArrayAdd('partnerships', newPartnership, setNewPartnership)
                        }
                      }}
                    />
                    <Button type="button" onClick={() => handleArrayAdd('partnerships', newPartnership, setNewPartnership)}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.partnerships.map((partnership, index) => (
                      <Badge key={index} variant="secondary">
                        {partnership}
                        <X
                          className="ml-2 h-3 w-3 cursor-pointer"
                          onClick={() => handleArrayRemove('partnerships', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admission_requirements">Admission Requirements</Label>
                  <Textarea
                    id="admission_requirements"
                    value={formData.admission_requirements}
                    onChange={(e) => setFormData({ ...formData, admission_requirements: e.target.value })}
                    placeholder="List admission requirements"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="application_deadline">Application Deadline</Label>
                    <Input
                      id="application_deadline"
                      value={formData.application_deadline}
                      onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                      placeholder="e.g., January 1st"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language_requirement">Language Requirement</Label>
                    <Input
                      id="language_requirement"
                      value={formData.language_requirement}
                      onChange={(e) => setFormData({ ...formData, language_requirement: e.target.value })}
                      placeholder="e.g., IELTS 6.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media & Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUpload
                  label="Logo"
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  context="universities"
                />

                <ImageUpload
                  label="Banner Image"
                  value={formData.banner_url}
                  onChange={(url) => setFormData({ ...formData, banner_url: url })}
                  context="universities"
                />

                <div className="space-y-4">
                  <Label>Gallery Images</Label>

                  {/* Image Upload */}
                  <ImageUpload
                    label="Upload Gallery Image"
                    value=""
                    onChange={(url) => {
                      if (url) {
                        setFormData({ ...formData, images: [...formData.images, url] })
                      }
                    }}
                    context="universities"
                    showUrl={true}
                  />

                  {/* Gallery Preview */}
                  {formData.images.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Uploaded Images ({formData.images.length})</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-image.png';
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleArrayRemove('images', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats & Rankings Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistics & Rankings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="established_year">Established Year</Label>
                    <Input
                      id="established_year"
                      type="number"
                      value={formData.established_year}
                      onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                      placeholder="1636"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accreditation">Accreditation</Label>
                    <Input
                      id="accreditation"
                      value={formData.accreditation}
                      onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                      placeholder="Regional Accreditation Body"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ranking_national">National Ranking</Label>
                    <Input
                      id="ranking_national"
                      type="number"
                      value={formData.ranking_national}
                      onChange={(e) => setFormData({ ...formData, ranking_national: e.target.value })}
                      placeholder="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ranking_world">World Ranking</Label>
                    <Input
                      id="ranking_world"
                      type="number"
                      value={formData.ranking_world}
                      onChange={(e) => setFormData({ ...formData, ranking_world: e.target.value })}
                      placeholder="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student_count">Total Students</Label>
                    <Input
                      id="student_count"
                      type="number"
                      value={formData.student_count}
                      onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
                      placeholder="20000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="international_students">International Students</Label>
                    <Input
                      id="international_students"
                      type="number"
                      value={formData.international_students}
                      onChange={(e) => setFormData({ ...formData, international_students: e.target.value })}
                      placeholder="5000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acceptance_rate">Acceptance Rate (%)</Label>
                    <Input
                      id="acceptance_rate"
                      type="number"
                      step="0.01"
                      value={formData.acceptance_rate}
                      onChange={(e) => setFormData({ ...formData, acceptance_rate: e.target.value })}
                      placeholder="5.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campus_size">Campus Size</Label>
                    <Input
                      id="campus_size"
                      value={formData.campus_size}
                      onChange={(e) => setFormData({ ...formData, campus_size: e.target.value })}
                      placeholder="e.g., 210 acres"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avg_tuition_fee">Average Tuition Fee</Label>
                    <Input
                      id="avg_tuition_fee"
                      type="number"
                      value={formData.avg_tuition_fee}
                      onChange={(e) => setFormData({ ...formData, avg_tuition_fee: e.target.value })}
                      placeholder="50000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO & Publishing Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO & Publishing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleArrayAdd('tags', newTag, setNewTag)
                        }
                      }}
                    />
                    <Button type="button" onClick={() => handleArrayAdd('tags', newTag, setNewTag)}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                        <X
                          className="ml-2 h-3 w-3 cursor-pointer"
                          onClick={() => handleArrayRemove('tags', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="SEO description for search engines"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
                    />
                    <Label htmlFor="is_featured" className="cursor-pointer">
                      Featured University
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_published: !!checked })}
                    />
                    <Label htmlFor="is_published" className="cursor-pointer">
                      Publish (Make visible to public)
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
