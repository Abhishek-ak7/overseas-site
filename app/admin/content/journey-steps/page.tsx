'use client'

import { useState, useEffect } from 'react'
import { ApiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
  Route,
  Save,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface JourneyStep {
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

interface JourneyStepForm {
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
}

export default function JourneyStepsPage() {
  const router = useRouter()
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<JourneyStep | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState<JourneyStepForm>({
    title: '',
    description: '',
    icon: '',
    iconType: 'lucide',
    iconColor: '#6B7280',
    backgroundColor: '#FFFFFF',
    ctaText: '',
    ctaLink: '',
    orderIndex: 0,
    isActive: true,
    isFeatured: false,
    category: '',
  })

  useEffect(() => {
    fetchJourneySteps()
  }, [])

  const fetchJourneySteps = async () => {
    try {
      const result = await ApiClient.get('/api/journey-steps')
      if (result.error) {
        console.error('Failed to fetch journey steps:', result.error)
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
      } else {
        setJourneySteps(result.data?.journeySteps || [])
      }
    } catch (error) {
      console.error('Failed to fetch journey steps:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const url = editingStep ? `/api/journey-steps/${editingStep.id}` : '/api/journey-steps'

      const result = editingStep
        ? await ApiClient.put(url, formData)
        : await ApiClient.post(url, formData)

      if (result.error) {
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        console.error('Save failed:', result.error)
      } else {
        await fetchJourneySteps()
        setIsDialogOpen(false)
        setEditingStep(null)
        resetForm()
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (step: JourneyStep) => {
    setEditingStep(step)
    setFormData({
      title: step.title,
      description: step.description,
      icon: step.icon || '',
      iconType: step.icon_type,
      iconColor: step.icon_color,
      backgroundColor: step.background_color,
      ctaText: step.cta_text || '',
      ctaLink: step.cta_link || '',
      orderIndex: step.order_index,
      isActive: step.is_active,
      isFeatured: step.is_featured,
      category: step.category || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journey step?')) return

    try {
      const result = await ApiClient.delete(`/api/journey-steps/${id}`)

      if (result.error) {
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        console.error('Delete error:', result.error)
      } else {
        await fetchJourneySteps()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: '',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: '',
      ctaLink: '',
      orderIndex: 0,
      isActive: true,
      isFeatured: false,
      category: '',
    })
  }

  const filteredSteps = journeySteps.filter(step =>
    step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    step.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/content')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Journey Steps</h1>
            <p className="text-gray-600">Manage the study abroad journey process steps</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingStep(null) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Journey Step
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingStep ? 'Edit Journey Step' : 'Add New Journey Step'}
              </DialogTitle>
              <DialogDescription>
                Create or edit a step in the study abroad journey process
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Choose Your Destination"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. planning, application, visa"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this step in the journey..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon Name</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g. Globe, BookOpen, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iconColor">Icon Color</Label>
                  <Input
                    id="iconColor"
                    type="color"
                    value={formData.iconColor}
                    onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="e.g. Learn More, Get Started"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">CTA Link</Label>
                  <Input
                    id="ctaLink"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="e.g. /countries, /contact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderIndex">Order Index</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                  />
                </div>
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
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formData.title || !formData.description}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingStep ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search journey steps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Journey Steps Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Journey Steps ({filteredSteps.length})
          </CardTitle>
          <CardDescription>
            Manage the steps that guide users through their study abroad journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSteps
                .sort((a, b) => a.order_index - b.order_index)
                .map((step) => (
                  <TableRow key={step.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{step.order_index}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: step.icon_color }}
                        />
                        <span className="font-medium">{step.title}</span>
                        {step.is_featured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm text-gray-600">
                        {step.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      {step.category && (
                        <Badge variant="outline">{step.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={step.is_active ? "default" : "secondary"}
                        className={step.is_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {step.is_active ? 'Active' : 'Inactive'}
                      </Badge>
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
                            handleEdit(step)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              handleDelete(step.id)
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

          {filteredSteps.length === 0 && (
            <div className="text-center py-12">
              <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No journey steps found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No steps match your search.' : 'Get started by creating your first journey step.'}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Journey Step
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}