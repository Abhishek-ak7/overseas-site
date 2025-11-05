'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Star,
  Flag,
  Globe,
  MapPin,
  Users,
  DollarSign,
  BookOpen,
  Award,
  Calendar,
  Clock,
  Mail,
  Phone,
  GripVertical,
  ExternalLink
} from 'lucide-react'

interface Country {
  id: string
  name: string
  slug: string
  flagUrl?: string
  imageUrl?: string
  description?: string
  shortDescription?: string
  continent?: string
  currency?: string
  language?: string
  capital?: string
  population?: number
  isActive: boolean
  isFeatured: boolean
  isPopular: boolean
  orderIndex: number
  studyCost?: string
  livingCost?: string
  visaRequirements?: string
  workPermit?: string
  universities: string[]
  popularCourses: string[]
  scholarships: string[]
  admissionRequirements?: string
  applicationDeadlines?: string
  intakeSeasons: string[]
  processingTime?: string
  successRate?: number
  metaTitle?: string
  metaDescription?: string
  contactEmail?: string
  contactPhone?: string
  createdAt: string
  updatedAt: string
}

interface CountryFormData {
  name: string
  slug: string
  flagUrl: string
  imageUrl: string
  description: string
  shortDescription: string
  continent: string
  currency: string
  language: string
  capital: string
  population: number | null
  isActive: boolean
  isFeatured: boolean
  isPopular: boolean
  orderIndex: number
  studyCost: string
  livingCost: string
  visaRequirements: string
  workPermit: string
  universities: string[]
  popularCourses: string[]
  scholarships: string[]
  admissionRequirements: string
  applicationDeadlines: string
  intakeSeasons: string[]
  processingTime: string
  successRate: number | null
  metaTitle: string
  metaDescription: string
  contactEmail: string
  contactPhone: string
}

const defaultFormData: CountryFormData = {
  name: '',
  slug: '',
  flagUrl: '',
  imageUrl: '',
  description: '',
  shortDescription: '',
  continent: '',
  currency: '',
  language: '',
  capital: '',
  population: null,
  isActive: true,
  isFeatured: false,
  isPopular: false,
  orderIndex: 0,
  studyCost: '',
  livingCost: '',
  visaRequirements: '',
  workPermit: '',
  universities: [],
  popularCourses: [],
  scholarships: [],
  admissionRequirements: '',
  applicationDeadlines: '',
  intakeSeasons: [],
  processingTime: '',
  successRate: null,
  metaTitle: '',
  metaDescription: '',
  contactEmail: '',
  contactPhone: '',
}

const continents = [
  'North America',
  'Europe',
  'Asia',
  'Oceania',
  'South America',
  'Africa',
]

const intakeOptions = [
  'Spring (January)',
  'Summer (May)',
  'Fall (September)',
  'Winter (December)',
]

const commonCourses = [
  'Computer Science',
  'Business Administration',
  'Engineering',
  'Medicine',
  'Law',
  'Arts & Humanities',
  'Sciences',
  'Economics',
  'Psychology',
  'Education',
]

export default function CountriesManagement() {
  const router = useRouter()
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [formData, setFormData] = useState<CountryFormData>(defaultFormData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [filter, setFilter] = useState<'all' | 'featured' | 'popular' | 'continents'>('all')
  const [listInput, setListInput] = useState('')
  const [listType, setListType] = useState<'universities' | 'courses' | 'scholarships' | 'intakes'>('universities')

  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries?includeInactive=true')
      const data = await response.json()
      setCountries(data.countries || [])
    } catch (error) {
      console.error('Failed to fetch countries:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const submitData = {
        ...formData,
        population: formData.population || undefined,
        successRate: formData.successRate || undefined,
        slug: formData.slug || generateSlug(formData.name),
      }

      const url = editingCountry
        ? `/api/countries/${editingCountry.id}`
        : '/api/countries'

      const method = editingCountry ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        await fetchCountries()
        setIsDialogOpen(false)
        setEditingCountry(null)
        setFormData(defaultFormData)
        setActiveTab('list')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save country')
      }
    } catch (error) {
      console.error('Failed to save country:', error)
      alert('Failed to save country')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (country: Country) => {
    setEditingCountry(country)
    setFormData({
      name: country.name,
      slug: country.slug,
      flagUrl: country.flagUrl || '',
      imageUrl: country.imageUrl || '',
      description: country.description || '',
      shortDescription: country.shortDescription || '',
      continent: country.continent || '',
      currency: country.currency || '',
      language: country.language || '',
      capital: country.capital || '',
      population: country.population || null,
      isActive: country.isActive,
      isFeatured: country.isFeatured,
      isPopular: country.isPopular,
      orderIndex: country.orderIndex,
      studyCost: country.studyCost || '',
      livingCost: country.livingCost || '',
      visaRequirements: country.visaRequirements || '',
      workPermit: country.workPermit || '',
      universities: country.universities || [],
      popularCourses: country.popularCourses || [],
      scholarships: country.scholarships || [],
      admissionRequirements: country.admissionRequirements || '',
      applicationDeadlines: country.applicationDeadlines || '',
      intakeSeasons: country.intakeSeasons || [],
      processingTime: country.processingTime || '',
      successRate: country.successRate || null,
      metaTitle: country.metaTitle || '',
      metaDescription: country.metaDescription || '',
      contactEmail: country.contactEmail || '',
      contactPhone: country.contactPhone || '',
    })
    setIsDialogOpen(true)
    setActiveTab('form')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country?')) return

    try {
      const response = await fetch(`/api/countries/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCountries()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete country')
      }
    } catch (error) {
      console.error('Failed to delete country:', error)
      alert('Failed to delete country')
    }
  }

  const handleNewCountry = () => {
    setEditingCountry(null)
    setFormData(defaultFormData)
    setIsDialogOpen(true)
    setActiveTab('form')
  }

  const addToList = (type: keyof Pick<CountryFormData, 'universities' | 'popularCourses' | 'scholarships' | 'intakeSeasons'>) => {
    if (listInput.trim() && !formData[type].includes(listInput.trim())) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], listInput.trim()]
      }))
      setListInput('')
    }
  }

  const removeFromList = (type: keyof Pick<CountryFormData, 'universities' | 'popularCourses' | 'scholarships' | 'intakeSeasons'>, item: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i !== item)
    }))
  }

  const getFilteredCountries = () => {
    switch (filter) {
      case 'featured':
        return countries.filter(c => c.isFeatured)
      case 'popular':
        return countries.filter(c => c.isPopular)
      default:
        return countries
    }
  }

  const filteredCountries = getFilteredCountries()

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/content')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Countries Management</h1>
            <p className="text-gray-600">Manage study destinations and country information</p>
          </div>
        </div>
        <Button onClick={handleNewCountry}>
          <Plus className="h-4 w-4 mr-2" />
          Add Country
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Countries ({countries.length})</TabsTrigger>
          <TabsTrigger value="form">
            {editingCountry ? 'Edit Country' : 'New Country'}
          </TabsTrigger>
        </TabsList>

        {/* Countries List */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Countries</CardTitle>
                  <CardDescription>
                    Manage study destinations and country information
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ({countries.length})</SelectItem>
                      <SelectItem value="featured">
                        Featured ({countries.filter(c => c.isFeatured).length})
                      </SelectItem>
                      <SelectItem value="popular">
                        Popular ({countries.filter(c => c.isPopular).length})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Continent</TableHead>
                    <TableHead>Universities</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCountries.map((country) => (
                    <TableRow key={country.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm">{country.orderIndex}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {country.flagUrl ? (
                            <img
                              src={country.flagUrl}
                              alt={`${country.name} flag`}
                              className="w-8 h-6 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center">
                              <Flag className="h-3 w-3 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{country.name}</div>
                            {country.capital && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {country.capital}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {country.continent || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 text-blue-500" />
                          <span className="text-sm">{country.universities.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {country.successRate ? (
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-green-500" />
                            <span className="text-sm">{country.successRate}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={country.isActive ? 'default' : 'secondary'}
                            className={country.isActive ? 'bg-green-100 text-green-800' : ''}
                          >
                            {country.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <div className="flex gap-1">
                            {country.isFeatured && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-xs">
                                Featured
                              </Badge>
                            )}
                            {country.isPopular && (
                              <Badge variant="outline" className="text-purple-600 border-purple-200 text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-[100]">
                            <DropdownMenuItem onClick={() => {
                              handleEdit(country)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              window.open(`/study-abroad/${country.slug}`, '_blank')
                            }}>
                              <Globe className="mr-2 h-4 w-4" />
                              View Page
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              handleEdit({
                                ...country,
                                isActive: !country.isActive
                              })
                            }}>
                              {country.isActive ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                handleDelete(country.id)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Country Form */}
        <TabsContent value="form">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingCountry ? 'Edit Country' : 'Create New Country'}
                </CardTitle>
                <CardDescription>
                  Add or edit study destination information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information Tab */}
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="study">Study Info</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="seo">SEO & Contact</TabsTrigger>
                    </TabsList>

                    {/* Basic Information */}
                    <TabsContent value="basic" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Country Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => {
                                const value = e.target.value
                                setFormData(prev => ({
                                  ...prev,
                                  name: value,
                                  slug: prev.slug || generateSlug(value)
                                }))
                              }}
                              placeholder="e.g., Canada"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="slug">URL Slug *</Label>
                            <Input
                              id="slug"
                              value={formData.slug}
                              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                              placeholder="e.g., canada"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="continent">Continent</Label>
                            <Select
                              value={formData.continent}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, continent: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select continent" />
                              </SelectTrigger>
                              <SelectContent>
                                {continents.map((continent) => (
                                  <SelectItem key={continent} value={continent}>
                                    {continent}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="capital">Capital City</Label>
                            <Input
                              id="capital"
                              value={formData.capital}
                              onChange={(e) => setFormData(prev => ({ ...prev, capital: e.target.value }))}
                              placeholder="e.g., Ottawa"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="currency">Currency</Label>
                              <Input
                                id="currency"
                                value={formData.currency}
                                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                placeholder="e.g., CAD"
                              />
                            </div>
                            <div>
                              <Label htmlFor="language">Language</Label>
                              <Input
                                id="language"
                                value={formData.language}
                                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                                placeholder="e.g., English, French"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="population">Population</Label>
                            <Input
                              id="population"
                              type="number"
                              value={formData.population || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                population: e.target.value ? parseInt(e.target.value) : null
                              }))}
                              placeholder="e.g., 38000000"
                              min="0"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="flagUrl">Flag URL</Label>
                            <Input
                              id="flagUrl"
                              value={formData.flagUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, flagUrl: e.target.value }))}
                              placeholder="https://example.com/flag.png"
                            />
                          </div>

                          <div>
                            <Label htmlFor="imageUrl">Country Image URL</Label>
                            <Input
                              id="imageUrl"
                              value={formData.imageUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                              placeholder="https://example.com/country.jpg"
                            />
                          </div>

                          <div>
                            <Label htmlFor="shortDescription">Short Description</Label>
                            <Textarea
                              id="shortDescription"
                              value={formData.shortDescription}
                              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                              placeholder="Brief description for cards..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="description">Full Description</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Detailed description of the country..."
                              rows={6}
                            />
                          </div>

                          <div>
                            <Label htmlFor="orderIndex">Order Index</Label>
                            <Input
                              id="orderIndex"
                              type="number"
                              value={formData.orderIndex}
                              onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-medium">Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="isActive">Active</Label>
                              <p className="text-sm text-gray-500">Show this country on the site</p>
                            </div>
                            <Switch
                              id="isActive"
                              checked={formData.isActive}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="isFeatured">Featured</Label>
                              <p className="text-sm text-gray-500">Show in featured countries</p>
                            </div>
                            <Switch
                              id="isFeatured"
                              checked={formData.isFeatured}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="isPopular">Popular</Label>
                              <p className="text-sm text-gray-500">Mark as popular destination</p>
                            </div>
                            <Switch
                              id="isPopular"
                              checked={formData.isPopular}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked }))}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Study Information */}
                    <TabsContent value="study" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Cost Information</h3>

                          <div>
                            <Label htmlFor="studyCost">Study Cost</Label>
                            <Input
                              id="studyCost"
                              value={formData.studyCost}
                              onChange={(e) => setFormData(prev => ({ ...prev, studyCost: e.target.value }))}
                              placeholder="e.g., $15,000 - $35,000 per year"
                            />
                          </div>

                          <div>
                            <Label htmlFor="livingCost">Living Cost</Label>
                            <Input
                              id="livingCost"
                              value={formData.livingCost}
                              onChange={(e) => setFormData(prev => ({ ...prev, livingCost: e.target.value }))}
                              placeholder="e.g., $12,000 - $15,000 per year"
                            />
                          </div>

                          <div>
                            <Label htmlFor="processingTime">Processing Time</Label>
                            <Input
                              id="processingTime"
                              value={formData.processingTime}
                              onChange={(e) => setFormData(prev => ({ ...prev, processingTime: e.target.value }))}
                              placeholder="e.g., 4-8 weeks"
                            />
                          </div>

                          <div>
                            <Label htmlFor="successRate">Success Rate (%)</Label>
                            <Input
                              id="successRate"
                              type="number"
                              value={formData.successRate || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                successRate: e.target.value ? parseFloat(e.target.value) : null
                              }))}
                              placeholder="e.g., 85"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Requirements & Process</h3>

                          <div>
                            <Label htmlFor="visaRequirements">Visa Requirements</Label>
                            <Textarea
                              id="visaRequirements"
                              value={formData.visaRequirements}
                              onChange={(e) => setFormData(prev => ({ ...prev, visaRequirements: e.target.value }))}
                              placeholder="Visa requirements and process..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="workPermit">Work Permit Information</Label>
                            <Textarea
                              id="workPermit"
                              value={formData.workPermit}
                              onChange={(e) => setFormData(prev => ({ ...prev, workPermit: e.target.value }))}
                              placeholder="Work permit rules and regulations..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="admissionRequirements">Admission Requirements</Label>
                            <Textarea
                              id="admissionRequirements"
                              value={formData.admissionRequirements}
                              onChange={(e) => setFormData(prev => ({ ...prev, admissionRequirements: e.target.value }))}
                              placeholder="General admission requirements..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="applicationDeadlines">Application Deadlines</Label>
                            <Textarea
                              id="applicationDeadlines"
                              value={formData.applicationDeadlines}
                              onChange={(e) => setFormData(prev => ({ ...prev, applicationDeadlines: e.target.value }))}
                              placeholder="Application deadline information..."
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Details */}
                    <TabsContent value="details" className="space-y-6">
                      <div className="space-y-6">
                        {/* Universities */}
                        <div>
                          <Label>Universities</Label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={listType === 'universities' ? listInput : ''}
                                onChange={(e) => {
                                  setListType('universities')
                                  setListInput(e.target.value)
                                }}
                                placeholder="Enter university name"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('universities'))}
                              />
                              <Button type="button" onClick={() => addToList('universities')}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.universities.map((university, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => removeFromList('universities', university)}
                                >
                                  {university} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Popular Courses */}
                        <div>
                          <Label>Popular Courses</Label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={listType === 'courses' ? listInput : ''}
                                onChange={(e) => {
                                  setListType('courses')
                                  setListInput(e.target.value)
                                }}
                                placeholder="Enter course name"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('popularCourses'))}
                              />
                              <Button type="button" onClick={() => addToList('popularCourses')}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.popularCourses.map((course, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => removeFromList('popularCourses', course)}
                                >
                                  {course} ×
                                </Badge>
                              ))}
                            </div>
                            <div className="text-sm text-gray-500">
                              Quick add: {commonCourses.filter(c => !formData.popularCourses.includes(c)).slice(0, 5).map((course, index) => (
                                <span
                                  key={index}
                                  className="cursor-pointer text-blue-600 hover:underline mr-2"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    popularCourses: [...prev.popularCourses, course]
                                  }))}
                                >
                                  +{course}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Scholarships */}
                        <div>
                          <Label>Available Scholarships</Label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={listType === 'scholarships' ? listInput : ''}
                                onChange={(e) => {
                                  setListType('scholarships')
                                  setListInput(e.target.value)
                                }}
                                placeholder="Enter scholarship name"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('scholarships'))}
                              />
                              <Button type="button" onClick={() => addToList('scholarships')}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.scholarships.map((scholarship, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => removeFromList('scholarships', scholarship)}
                                >
                                  {scholarship} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Intake Seasons */}
                        <div>
                          <Label>Intake Seasons</Label>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500">
                              Select available intake seasons:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {intakeOptions.map((intake) => (
                                <Button
                                  key={intake}
                                  type="button"
                                  variant={formData.intakeSeasons.includes(intake) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    if (formData.intakeSeasons.includes(intake)) {
                                      removeFromList('intakeSeasons', intake)
                                    } else {
                                      setFormData(prev => ({
                                        ...prev,
                                        intakeSeasons: [...prev.intakeSeasons, intake]
                                      }))
                                    }
                                  }}
                                >
                                  {intake}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* SEO & Contact */}
                    <TabsContent value="seo" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">SEO Information</h3>

                          <div>
                            <Label htmlFor="metaTitle">Meta Title</Label>
                            <Input
                              id="metaTitle"
                              value={formData.metaTitle}
                              onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                              placeholder="SEO title for search engines"
                            />
                          </div>

                          <div>
                            <Label htmlFor="metaDescription">Meta Description</Label>
                            <Textarea
                              id="metaDescription"
                              value={formData.metaDescription}
                              onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                              placeholder="SEO description for search engines..."
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Contact Information</h3>

                          <div>
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input
                              id="contactEmail"
                              type="email"
                              value={formData.contactEmail}
                              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                              placeholder="country@bnoverseas.com"
                            />
                          </div>

                          <div>
                            <Label htmlFor="contactPhone">Contact Phone</Label>
                            <Input
                              id="contactPhone"
                              value={formData.contactPhone}
                              onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                              placeholder="+1 234 567 8900"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Submit */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('list')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : editingCountry ? 'Update Country' : 'Create Country'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}