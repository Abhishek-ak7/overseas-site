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
import { ImageUpload } from '@/components/ui/image-upload'
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
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  ImageIcon,
  Video,
  Palette,
  Settings,
  GripVertical
} from 'lucide-react'

interface HeroSlide {
  id: string
  title: string
  subtitle?: string
  description?: string
  ctaText?: string
  ctaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  backgroundImage?: string
  backgroundVideo?: string
  textColor: string
  overlayColor?: string
  overlayOpacity: number
  orderIndex: number
  isActive: boolean
  displayDuration: number
  animationType: string
  mobileImage?: string
  createdAt: string
  updatedAt: string
}

interface SlideFormData {
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
  secondaryCtaText: string
  secondaryCtaLink: string
  backgroundImage: string
  backgroundVideo: string
  textColor: string
  overlayColor: string
  overlayOpacity: number
  orderIndex: number
  isActive: boolean
  displayDuration: number
  animationType: string
  mobileImage: string
}

export default function HeroSlidesPage() {
  const router = useRouter()
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState<SlideFormData>({
    title: '',
    subtitle: '',
    description: '',
    ctaText: '',
    ctaLink: '',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    backgroundImage: '',
    backgroundVideo: '',
    textColor: '#FFFFFF',
    overlayColor: '#000000',
    overlayOpacity: 0.3,
    orderIndex: 0,
    isActive: true,
    displayDuration: 5000,
    animationType: 'fade',
    mobileImage: ''
  })

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides?includeInactive=true', {
        credentials: 'include'
      })
      const data = await response.json()
      setSlides(data.heroSlides || [])
    } catch (error) {
      console.error('Failed to fetch hero slides:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof SlideFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = editingSlide
        ? `/api/hero-slides/${editingSlide.id}`
        : '/api/hero-slides'

      const method = editingSlide ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchSlides()
        setShowDialog(false)
        setEditingSlide(null)
        resetForm()
      } else {
        throw new Error('Failed to save slide')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save slide. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (slide: HeroSlide) => {
    console.log('handleEdit called with slide:', slide)
    setEditingSlide(slide)
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      ctaText: slide.ctaText || '',
      ctaLink: slide.ctaLink || '',
      secondaryCtaText: slide.secondaryCtaText || '',
      secondaryCtaLink: slide.secondaryCtaLink || '',
      backgroundImage: slide.backgroundImage || '',
      backgroundVideo: slide.backgroundVideo || '',
      textColor: slide.textColor || '#FFFFFF',
      overlayColor: slide.overlayColor || '#000000',
      overlayOpacity: slide.overlayOpacity || 0.3,
      orderIndex: slide.orderIndex || 0,
      isActive: slide.isActive !== undefined ? slide.isActive : true,
      displayDuration: slide.displayDuration || 5000,
      animationType: slide.animationType || 'fade',
      mobileImage: slide.mobileImage || ''
    })
    setTimeout(() => {
      setShowDialog(true)
    }, 100)
  }

  const handleDelete = async (slideId: string) => {
    if (!confirm('Are you sure you want to delete this slide? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/hero-slides/${slideId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchSlides()
      } else {
        throw new Error('Failed to delete slide')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete slide. Please try again.')
    }
  }

  const handleToggleStatus = async (slideId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/hero-slides/${slideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        await fetchSlides()
      } else {
        throw new Error('Failed to update slide status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('Failed to update slide status. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      ctaText: '',
      ctaLink: '',
      secondaryCtaText: '',
      secondaryCtaLink: '',
      backgroundImage: '',
      backgroundVideo: '',
      textColor: '#FFFFFF',
      overlayColor: '#000000',
      overlayOpacity: 0.3,
      orderIndex: slides.length,
      isActive: true,
      displayDuration: 5000,
      animationType: 'fade',
      mobileImage: ''
    })
  }

  const openCreateDialog = () => {
    setEditingSlide(null)
    resetForm()
    setShowDialog(true)
  }

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
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hero Slides Management</h1>
            <p className="text-gray-600">Manage homepage hero carousel slides</p>
          </div>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Slide
        </Button>
      </div>

      {/* Slides List */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Slides ({slides.length})</CardTitle>
          <CardDescription>
            Manage the carousel slides displayed on your homepage hero section
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slides.length > 0 ? (
            <div className="relative overflow-visible">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Slide</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slides.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-sm">{slide.orderIndex}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden">
                          {slide.backgroundImage ? (
                            <img
                              src={slide.backgroundImage}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{slide.title}</div>
                          {slide.subtitle && (
                            <div className="text-sm text-gray-600">{slide.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={slide.isActive ? "default" : "secondary"}>
                          {slide.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(slide.id, !slide.isActive)}
                        >
                          {slide.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{Math.round(slide.displayDuration / 1000)}s</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {slide.updatedAt ? new Date(slide.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2">
                        {/* Quick action buttons for testing */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log('Quick edit clicked for slide:', slide.id)
                            handleEdit(slide)
                          }}
                          className="h-8 px-2"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>

                        {/* Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-[100]">
                            <DropdownMenuItem
                              onClick={() => {
                                console.log('Dropdown edit clicked for slide:', slide.id)
                                handleEdit(slide)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Slide
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open('/', '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                console.log('Dropdown delete clicked for slide:', slide.id)
                                handleDelete(slide.id)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hero slides</h3>
              <p className="text-gray-600 mb-4">
                Create your first hero slide to get started with the homepage carousel.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Slide
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          console.log('Dialog onOpenChange:', open)
          setShowDialog(open)
          if (!open) {
            // Reset form when closing
            setEditingSlide(null)
            resetForm()
          }
        }}
        key={editingSlide?.id || 'new'}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSlide ? 'Edit Hero Slide' : 'Create New Hero Slide'}
            </DialogTitle>
            <DialogDescription>
              Configure the hero slide content, appearance, and behavior
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter slide title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Enter slide subtitle"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter slide description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">Primary CTA Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => handleInputChange('ctaText', e.target.value)}
                    placeholder="e.g., Get Started"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">Primary CTA Link</Label>
                  <Input
                    id="ctaLink"
                    value={formData.ctaLink}
                    onChange={(e) => handleInputChange('ctaLink', e.target.value)}
                    placeholder="e.g., /contact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryCtaText">Secondary CTA Text</Label>
                  <Input
                    id="secondaryCtaText"
                    value={formData.secondaryCtaText}
                    onChange={(e) => handleInputChange('secondaryCtaText', e.target.value)}
                    placeholder="e.g., Learn More"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryCtaLink">Secondary CTA Link</Label>
                  <Input
                    id="secondaryCtaLink"
                    value={formData.secondaryCtaLink}
                    onChange={(e) => handleInputChange('secondaryCtaLink', e.target.value)}
                    placeholder="e.g., /about"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <div className="space-y-2">
                <ImageUpload
                  value={formData.backgroundImage}
                  onChange={(url) => handleInputChange('backgroundImage', url)}
                  label="Background Image"
                  showUrl={true}
                  context="hero-slides"
                />
                <p className="text-sm text-gray-500">
                  Upload or paste URL for the main background image (desktop)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundVideo">Background Video URL (optional)</Label>
                <Input
                  id="backgroundVideo"
                  value={formData.backgroundVideo}
                  onChange={(e) => handleInputChange('backgroundVideo', e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
                <p className="text-sm text-gray-500">
                  Optional: Video will play behind the slide content
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Text Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="textColor">Primary Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => handleInputChange('textColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded"
                        />
                        <Input
                          type="text"
                          value={formData.textColor}
                          onChange={(e) => handleInputChange('textColor', e.target.value)}
                          placeholder="#FFFFFF"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Background & Overlay</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="overlayColor">Overlay Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="overlayColor"
                          type="color"
                          value={formData.overlayColor}
                          onChange={(e) => handleInputChange('overlayColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded"
                        />
                        <Input
                          type="text"
                          value={formData.overlayColor}
                          onChange={(e) => handleInputChange('overlayColor', e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overlayOpacity">Overlay Opacity</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="overlayOpacity"
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={formData.overlayOpacity}
                          onChange={(e) => handleInputChange('overlayOpacity', parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono w-12 text-center">
                          {(formData.overlayOpacity * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Quick Color Presets</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Light theme preset */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleInputChange('textColor', '#1F2937')
                        handleInputChange('overlayColor', '#FFFFFF')
                        handleInputChange('overlayOpacity', 0.8)
                      }}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <div className="w-8 h-6 bg-white border border-gray-300 rounded"></div>
                      <span className="text-xs">Light</span>
                    </Button>

                    {/* Dark theme preset */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleInputChange('textColor', '#FFFFFF')
                        handleInputChange('overlayColor', '#000000')
                        handleInputChange('overlayOpacity', 0.6)
                      }}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <div className="w-8 h-6 bg-black rounded"></div>
                      <span className="text-xs">Dark</span>
                    </Button>

                    {/* Blue theme preset */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleInputChange('textColor', '#FFFFFF')
                        handleInputChange('overlayColor', '#1E40AF')
                        handleInputChange('overlayOpacity', 0.7)
                      }}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <div className="w-8 h-6 bg-blue-700 rounded"></div>
                      <span className="text-xs">Blue</span>
                    </Button>

                    {/* Green theme preset */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleInputChange('textColor', '#FFFFFF')
                        handleInputChange('overlayColor', '#059669')
                        handleInputChange('overlayOpacity', 0.7)
                      }}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <div className="w-8 h-6 bg-emerald-600 rounded"></div>
                      <span className="text-xs">Green</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Live Preview</h3>
                  <div
                    className="relative rounded-lg overflow-hidden h-32 flex items-center justify-center"
                    style={{
                      backgroundImage: formData.backgroundImage ? `url(${formData.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: formData.overlayColor,
                        opacity: formData.overlayOpacity
                      }}
                    />
                    <div className="relative z-10 text-center">
                      <h2
                        className="text-2xl font-bold mb-2"
                        style={{ color: formData.textColor }}
                      >
                        {formData.title || 'Preview Title'}
                      </h2>
                      {formData.subtitle && (
                        <p
                          className="text-sm"
                          style={{ color: formData.textColor, opacity: 0.9 }}
                        >
                          {formData.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <ImageUpload
                  value={formData.mobileImage}
                  onChange={(url) => handleInputChange('mobileImage', url)}
                  label="Mobile Image (optional)"
                  showUrl={true}
                  context="hero-slides"
                />
                <p className="text-sm text-gray-500">
                  Optional: Different image optimized for mobile devices
                </p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderIndex">Display Order</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    min="0"
                    value={formData.orderIndex}
                    onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayDuration">Display Duration (ms)</Label>
                  <Input
                    id="displayDuration"
                    type="number"
                    min="1000"
                    step="500"
                    value={formData.displayDuration}
                    onChange={(e) => handleInputChange('displayDuration', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-gray-600">
                    Show this slide in the carousel
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.title}>
              {saving ? 'Saving...' : editingSlide ? 'Update Slide' : 'Create Slide'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}