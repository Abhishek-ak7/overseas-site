'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

interface ProgramFormProps {
  program?: any
  isEdit?: boolean
}

const DEGREE_TYPES = ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate', 'Associate']
const DISCIPLINES = ['Engineering', 'Business', 'Medicine', 'Computer Science', 'Arts', 'Science', 'Law', 'Education', 'Social Sciences', 'Other']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function ProgramForm({ program, isEdit = false }: ProgramFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [universities, setUniversities] = useState([])

  const [formData, setFormData] = useState({
    university_id: searchParams.get('universityId') || program?.university_id || '',
    name: program?.name || '',
    slug: program?.slug || '',
    degree_type: program?.degree_type || 'Bachelor',
    discipline: program?.discipline || '',
    specialization: program?.specialization || '',
    duration_years: program?.duration_years || '',
    duration_months: program?.duration_months || '',
    intake_months: program?.intake_months || [],
    featured_image: program?.featured_image || '',
    images: program?.images || [],
    description: program?.description || '',
    overview: program?.overview || '',
    curriculum: program?.curriculum || '',
    career_opportunities: program?.career_opportunities || '',
    tuition_fee: program?.tuition_fee || '',
    application_fee: program?.application_fee || '',
    currency: program?.currency || 'USD',
    scholarship_available: program?.scholarship_available || false,
    scholarship_details: program?.scholarship_details || '',
    hostel_available: program?.hostel_available || false,
    hostel_fee: program?.hostel_fee || '',
    living_cost_min: program?.living_cost_min || '',
    living_cost_max: program?.living_cost_max || '',
    total_seats: program?.total_seats || '',
    international_seats: program?.international_seats || '',
    language_requirement: program?.language_requirement || '',
    min_gpa: program?.min_gpa || '',
    entrance_exam: program?.entrance_exam || '',
    work_permit: program?.work_permit || false,
    pr_pathway: program?.pr_pathway || false,
    internship_included: program?.internship_included || false,
    online_available: program?.online_available || false,
    requirements: program?.requirements || '',
    documents_needed: program?.documents_needed || [],
    job_prospects: program?.job_prospects || [],
    average_salary: program?.average_salary || '',
    tags: program?.tags || [],
    meta_title: program?.meta_title || '',
    meta_description: program?.meta_description || '',
    is_featured: program?.is_featured || false,
    is_published: program?.is_published || false,
  })

  const [newDocument, setNewDocument] = useState('')
  const [newJobProspect, setNewJobProspect] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newImage, setNewImage] = useState('')

  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/admin/universities')
      if (response.ok) {
        const data = await response.json()
        setUniversities(data.universities)
      }
    } catch (error) {
      console.error('Failed to fetch universities:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = isEdit
        ? `/api/admin/programs/${program.id}`
        : '/api/admin/programs'

      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save program')

      toast({
        title: "Success",
        description: `Program ${isEdit ? 'updated' : 'created'} successfully`,
      })

      router.push(`/admin/universities/${formData.university_id}/programs`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} program`,
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

  const toggleIntakeMonth = (month: string) => {
    setFormData(prev => ({
      ...prev,
      intake_months: prev.intake_months.includes(month)
        ? prev.intake_months.filter(m => m !== month)
        : [...prev.intake_months, month]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'Add'} Program</h1>
          <p className="text-gray-600 mt-1">Fill in the program details below</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'} Program
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="university_id">University *</Label>
                <Select
                  value={formData.university_id}
                  onValueChange={(value) => setFormData({ ...formData, university_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni: any) => (
                      <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Program Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Bachelor of Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree_type">Degree Type *</Label>
                  <Select
                    value={formData.degree_type}
                    onValueChange={(value) => setFormData({ ...formData, degree_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREE_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discipline">Discipline *</Label>
                  <Select
                    value={formData.discipline}
                    onValueChange={(value) => setFormData({ ...formData, discipline: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCIPLINES.map(disc => (
                        <SelectItem key={disc} value={disc}>{disc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g., Artificial Intelligence"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="bachelor-computer-science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_years">Duration (Years)</Label>
                  <Input
                    id="duration_years"
                    type="number"
                    step="0.5"
                    value={formData.duration_years}
                    onChange={(e) => setFormData({ ...formData, duration_years: e.target.value })}
                    placeholder="4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_months">Duration (Months)</Label>
                  <Input
                    id="duration_months"
                    type="number"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                    placeholder="48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Intake Months</Label>
                <div className="flex flex-wrap gap-2">
                  {MONTHS.map(month => (
                    <Badge
                      key={month}
                      variant={formData.intake_months.includes(month) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleIntakeMonth(month)}
                    >
                      {month}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description (2-3 sentences)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Overview (Rich Text)</Label>
                <RichTextEditor
                  value={formData.overview}
                  onChange={(value) => setFormData({ ...formData, overview: value })}
                  placeholder="Write detailed program overview..."
                  minHeight={250}
                />
              </div>

              <div className="space-y-2">
                <Label>Curriculum (Rich Text)</Label>
                <RichTextEditor
                  value={formData.curriculum}
                  onChange={(value) => setFormData({ ...formData, curriculum: value })}
                  placeholder="Describe curriculum and courses..."
                  minHeight={250}
                />
              </div>

              <div className="space-y-2">
                <Label>Career Opportunities (Rich Text)</Label>
                <RichTextEditor
                  value={formData.career_opportunities}
                  onChange={(value) => setFormData({ ...formData, career_opportunities: value })}
                  placeholder="Describe career opportunities..."
                  minHeight={250}
                />
              </div>

              <div className="space-y-2">
                <Label>Job Prospects</Label>
                <div className="flex gap-2">
                  <Input
                    value={newJobProspect}
                    onChange={(e) => setNewJobProspect(e.target.value)}
                    placeholder="Add job prospect"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleArrayAdd('job_prospects', newJobProspect, setNewJobProspect)
                      }
                    }}
                  />
                  <Button type="button" onClick={() => handleArrayAdd('job_prospects', newJobProspect, setNewJobProspect)}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.job_prospects.map((job, index) => (
                    <Badge key={index} variant="secondary">
                      {job}
                      <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => handleArrayRemove('job_prospects', index)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="average_salary">Average Salary</Label>
                <Input
                  id="average_salary"
                  type="number"
                  value={formData.average_salary}
                  onChange={(e) => setFormData({ ...formData, average_salary: e.target.value })}
                  placeholder="50000"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="work_permit"
                    checked={formData.work_permit}
                    onCheckedChange={(checked) => setFormData({ ...formData, work_permit: !!checked })}
                  />
                  <Label htmlFor="work_permit">Work Permit</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pr_pathway"
                    checked={formData.pr_pathway}
                    onCheckedChange={(checked) => setFormData({ ...formData, pr_pathway: !!checked })}
                  />
                  <Label htmlFor="pr_pathway">PR Pathway</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internship_included"
                    checked={formData.internship_included}
                    onCheckedChange={(checked) => setFormData({ ...formData, internship_included: !!checked })}
                  />
                  <Label htmlFor="internship_included">Internship</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="online_available"
                    checked={formData.online_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, online_available: !!checked })}
                  />
                  <Label htmlFor="online_available">Online</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fees & Costs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tuition_fee">Tuition Fee</Label>
                  <Input
                    id="tuition_fee"
                    type="number"
                    value={formData.tuition_fee}
                    onChange={(e) => setFormData({ ...formData, tuition_fee: e.target.value })}
                    placeholder="30000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application_fee">Application Fee</Label>
                  <Input
                    id="application_fee"
                    type="number"
                    value={formData.application_fee}
                    onChange={(e) => setFormData({ ...formData, application_fee: e.target.value })}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
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

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="scholarship_available"
                    checked={formData.scholarship_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, scholarship_available: !!checked })}
                  />
                  <Label htmlFor="scholarship_available">Scholarship Available</Label>
                </div>
              </div>

              {formData.scholarship_available && (
                <div className="space-y-2">
                  <Label htmlFor="scholarship_details">Scholarship Details</Label>
                  <Textarea
                    id="scholarship_details"
                    value={formData.scholarship_details}
                    onChange={(e) => setFormData({ ...formData, scholarship_details: e.target.value })}
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hostel_available"
                    checked={formData.hostel_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, hostel_available: !!checked })}
                  />
                  <Label htmlFor="hostel_available">Hostel Available</Label>
                </div>
              </div>

              {formData.hostel_available && (
                <div className="space-y-2">
                  <Label htmlFor="hostel_fee">Hostel Fee</Label>
                  <Input
                    id="hostel_fee"
                    type="number"
                    value={formData.hostel_fee}
                    onChange={(e) => setFormData({ ...formData, hostel_fee: e.target.value })}
                    placeholder="5000"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="living_cost_min">Living Cost (Min)</Label>
                  <Input
                    id="living_cost_min"
                    type="number"
                    value={formData.living_cost_min}
                    onChange={(e) => setFormData({ ...formData, living_cost_min: e.target.value })}
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="living_cost_max">Living Cost (Max)</Label>
                  <Input
                    id="living_cost_max"
                    type="number"
                    value={formData.living_cost_max}
                    onChange={(e) => setFormData({ ...formData, living_cost_max: e.target.value })}
                    placeholder="15000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Requirements & Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requirements">General Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language_requirement">Language Requirement</Label>
                  <Input
                    id="language_requirement"
                    value={formData.language_requirement}
                    onChange={(e) => setFormData({ ...formData, language_requirement: e.target.value })}
                    placeholder="IELTS 6.5 or TOEFL 90"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_gpa">Minimum GPA</Label>
                  <Input
                    id="min_gpa"
                    type="number"
                    step="0.01"
                    value={formData.min_gpa}
                    onChange={(e) => setFormData({ ...formData, min_gpa: e.target.value })}
                    placeholder="3.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entrance_exam">Entrance Exam</Label>
                  <Input
                    id="entrance_exam"
                    value={formData.entrance_exam}
                    onChange={(e) => setFormData({ ...formData, entrance_exam: e.target.value })}
                    placeholder="SAT, GRE, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_seats">Total Seats</Label>
                  <Input
                    id="total_seats"
                    type="number"
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="international_seats">International Seats</Label>
                  <Input
                    id="international_seats"
                    type="number"
                    value={formData.international_seats}
                    onChange={(e) => setFormData({ ...formData, international_seats: e.target.value })}
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Documents Needed</Label>
                <div className="flex gap-2">
                  <Input
                    value={newDocument}
                    onChange={(e) => setNewDocument(e.target.value)}
                    placeholder="Add document"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleArrayAdd('documents_needed', newDocument, setNewDocument)
                      }
                    }}
                  />
                  <Button type="button" onClick={() => handleArrayAdd('documents_needed', newDocument, setNewDocument)}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.documents_needed.map((doc, index) => (
                    <Badge key={index} variant="secondary">
                      {doc}
                      <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => handleArrayRemove('documents_needed', index)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media & Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                label="Featured Image"
                value={formData.featured_image}
                onChange={(url) => setFormData({ ...formData, featured_image: url })}
                context="programs"
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
                  context="programs"
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

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Publishing</CardTitle>
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
                      <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => handleArrayRemove('tags', index)} />
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
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
                  <Label htmlFor="is_featured">Featured Program</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: !!checked })}
                  />
                  <Label htmlFor="is_published">Publish (Make visible to public)</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
