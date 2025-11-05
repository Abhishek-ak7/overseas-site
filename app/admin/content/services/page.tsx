'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUpload } from '@/components/ui/image-upload'
import { AdminDropdownMenu } from '@/components/admin/admin-dropdown-menu'
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
  Shield,
  Users,
  Award,
  Clock,
  Globe,
  HeartHandshake,
  Zap,
  Target,
  CheckCircle,
  GripVertical,
  Briefcase
} from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  icon?: string
  icon_type: string
  icon_color: string
  background_color: string
  cta_text?: string
  cta_link?: string
  order_index: number
  is_active: boolean
  is_featured: boolean
  category?: string
  created_at: string
  updated_at: string
}

interface ServiceFormData {
  title: string
  description: string
  icon: string
  iconType: string
  iconColor: string
  backgroundColor: string
  ctaText: string
  ctaLink: string
  orderIndex: number
  isActive: boolean
  isFeatured: boolean
  category: string
  imageUrl: string
}

const availableIcons = [
  { name: 'Shield', component: Shield },
  { name: 'Users', component: Users },
  { name: 'Award', component: Award },
  { name: 'Clock', component: Clock },
  { name: 'Globe', component: Globe },
  { name: 'HeartHandshake', component: HeartHandshake },
  { name: 'Zap', component: Zap },
  { name: 'Target', component: Target },
  { name: 'CheckCircle', component: CheckCircle },
  { name: 'Briefcase', component: Briefcase },
]

const iconMap: { [key: string]: any } = {
  Shield,
  Users,
  Award,
  Clock,
  Globe,
  HeartHandshake,
  Zap,
  Target,
  CheckCircle,
  Briefcase,
}

const serviceCategories = [
  'General',
  'Consultation',
  'Application',
  'Visa',
  'Test Prep',
  'Financial',
  'Travel',
  'Support',
]

const defaultFormData: ServiceFormData = {
  title: '',
  description: '',
  icon: 'Shield',
  iconType: 'lucide',
  iconColor: '#6B7280',
  backgroundColor: '#FFFFFF',
  ctaText: '',
  ctaLink: '',
  orderIndex: 0,
  isActive: true,
  isFeatured: false,
  category: 'General',
  imageUrl: '',
}

export default function ServicesManagement() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [filter, setFilter] = useState<'all' | 'featured' | 'category'>('all')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const result = await ApiClient.get('/api/services')
      if (result.error) {
        console.error('Failed to fetch services:', result.error)
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
      } else {
        setServices(result.data?.services || [])
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingService
        ? `/api/services/${editingService.id}`
        : '/api/services'

      const method = editingService ? 'PUT' : 'POST'

      const result = editingService
        ? await ApiClient.put(url, formData)
        : await ApiClient.post(url, formData)

      if (result.error) {
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        alert(result.error || 'Failed to save service')
      } else {
        await fetchServices()
        setIsDialogOpen(false)
        setEditingService(null)
        setFormData(defaultFormData)
        setActiveTab('list')
      }
    } catch (error) {
      console.error('Failed to save service:', error)
      alert('Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon || 'Shield',
      iconType: service.icon_type,
      iconColor: service.icon_color,
      backgroundColor: service.background_color,
      ctaText: service.cta_text || '',
      ctaLink: service.cta_link || '',
      orderIndex: service.order_index,
      isActive: service.is_active,
      isFeatured: service.is_featured,
      category: service.category || 'General',
      imageUrl: '', // Services don't have images in current schema, but we'll add this for future use
    })
    setIsDialogOpen(true)
    setActiveTab('form')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const result = await ApiClient.delete(`/api/services/${id}`)

      if (result.error) {
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        alert(result.error || 'Failed to delete service')
      } else {
        await fetchServices()
      }
    } catch (error) {
      console.error('Failed to delete service:', error)
      alert('Failed to delete service')
    }
  }

  const handleNewService = () => {
    setEditingService(null)
    setFormData(defaultFormData)
    setIsDialogOpen(true)
    setActiveTab('form')
  }

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Shield
  }

  const getFilteredServices = () => {
    switch (filter) {
      case 'featured':
        return services.filter(s => s.is_featured)
      default:
        return services
    }
  }

  const filteredServices = getFilteredServices()

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
            <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-600">Manage your service offerings and features</p>
          </div>
        </div>
        <Button onClick={handleNewService}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Services ({services.length})</TabsTrigger>
          <TabsTrigger value="form">
            {editingService ? 'Edit Service' : 'New Service'}
          </TabsTrigger>
        </TabsList>

        {/* Services List */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>
                    Manage your service offerings and features
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ({services.length})</SelectItem>
                      <SelectItem value="featured">
                        Featured ({services.filter(s => s.is_featured).length})
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
                    <TableHead>Service</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => {
                    const IconComponent = getIconComponent(service.icon || 'Shield')
                    return (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <span className="font-mono text-sm">{service.order_index}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: service.background_color }}
                            >
                              <IconComponent
                                className="h-5 w-5"
                                style={{ color: service.icon_color }}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{service.title}</div>
                              {service.cta_text && service.cta_link && (
                                <div className="text-sm text-blue-600">
                                  {service.cta_text} → {service.cta_link}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm line-clamp-2">{service.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.category || 'General'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant={service.is_active ? 'default' : 'secondary'}
                              className={service.is_active ? 'bg-green-100 text-green-800' : ''}
                            >
                              {service.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {service.is_featured && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <AdminDropdownMenu
                            size="md"
                            debugId={`service-${service.id}`}
                            actions={[
                              {
                                label: 'Edit',
                                icon: Edit,
                                onClick: () => handleEdit(service)
                              },
                              {
                                label: service.is_active ? 'Deactivate' : 'Activate',
                                icon: service.is_active ? EyeOff : Eye,
                                onClick: () => handleEdit({
                                  ...service,
                                  is_active: !service.is_active
                                })
                              },
                              {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDelete(service.id),
                                className: 'text-red-600',
                                separator: true
                              }
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Form */}
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingService ? 'Edit Service' : 'Create New Service'}
              </CardTitle>
              <CardDescription>
                Configure a service to display on your site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Service Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Study Abroad Consultation"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detailed description of the service..."
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ctaText">CTA Text</Label>
                        <Input
                          id="ctaText"
                          value={formData.ctaText}
                          onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                          placeholder="e.g., Learn More"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ctaLink">CTA Link</Label>
                        <Input
                          id="ctaLink"
                          value={formData.ctaLink}
                          onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                          placeholder="e.g., /services/consultation"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visual Settings */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="icon">Icon</Label>
                      <Select
                        value={formData.icon}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map((icon) => (
                            <SelectItem key={icon.name} value={icon.name}>
                              <div className="flex items-center gap-2">
                                <icon.component className="h-4 w-4" />
                                {icon.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="iconColor">Icon Color</Label>
                        <Input
                          id="iconColor"
                          type="color"
                          value={formData.iconColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, iconColor: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="backgroundColor">Background Color</Label>
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        />
                      </div>
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

                    {/* Preview */}
                    <div className="border rounded-lg p-4">
                      <Label>Preview</Label>
                      <div className="mt-2 p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: formData.backgroundColor }}
                          >
                            {React.createElement(getIconComponent(formData.icon), {
                              className: "h-6 w-6",
                              style: { color: formData.iconColor }
                            })}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{formData.title || 'Service Title'}</h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {formData.description || 'Service description will appear here...'}
                            </p>
                            {formData.ctaText && formData.ctaLink && (
                              <Button variant="outline" size="sm" className="mt-2">
                                {formData.ctaText}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <ImageUpload
                        value={formData.imageUrl}
                        onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                        label="Service Image (Optional)"
                        showUrl={true}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Upload an image to be used in detailed service pages
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4 border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="isActive">Active</Label>
                        <p className="text-sm text-gray-500">Show this service on the site</p>
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
                        <p className="text-sm text-gray-500">Show in featured services</p>
                      </div>
                      <Switch
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('list')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}