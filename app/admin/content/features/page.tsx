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
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Feature {
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

interface FeatureFormData {
  title: string
  description: string
  icon?: string
  iconType: string
  iconColor: string
  backgroundColor: string
  ctaText?: string
  ctaLink?: string
  orderIndex: number
  isActive: boolean
  isFeatured: boolean
  category?: string
}

const defaultFormData: FeatureFormData = {
  title: '',
  description: '',
  icon: 'CheckCircle',
  iconType: 'lucide',
  iconColor: '#10B981',
  backgroundColor: '#FFFFFF',
  ctaText: '',
  ctaLink: '',
  orderIndex: 0,
  isActive: true,
  isFeatured: false,
  category: 'why-choose'
}

const iconOptions = [
  'CheckCircle', 'Users', 'Award', 'Shield', 'Heart', 'Star',
  'Globe', 'Clock', 'Target', 'TrendingUp', 'Zap', 'BookOpen'
]

const categoryOptions = [
  'why-choose', 'benefits', 'services', 'process', 'general'
]

export default function FeaturesManagementPage() {
  const router = useRouter()
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FeatureFormData>(defaultFormData)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const result = await ApiClient.get('/api/features?includeInactive=true')
      if (result.error) {
        console.error('Failed to fetch features:', result.error)
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        toast({
          title: "Error",
          description: result.error || "Failed to fetch features",
          variant: "destructive"
        })
      } else {
        setFeatures(result.data?.features || [])
      }
    } catch (error) {
      console.error('Error fetching features:', error)
      toast({
        title: "Error",
        description: "Failed to fetch features",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId ? `/api/features/${editingId}` : '/api/features'

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
          description: result.error || `Failed to ${editingId ? 'update' : 'create'} feature`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: `Feature ${editingId ? 'updated' : 'created'} successfully`
        })

        setFormData(defaultFormData)
        setEditingId(null)
        setIsCreating(false)
        fetchFeatures()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingId ? 'update' : 'create'} feature`,
        variant: "destructive"
      })
    }
  }

  const handleEdit = (feature: Feature) => {
    setFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      iconType: feature.icon_type,
      iconColor: feature.icon_color,
      backgroundColor: feature.background_color,
      ctaText: feature.cta_text || '',
      ctaLink: feature.cta_link || '',
      orderIndex: feature.order_index,
      isActive: feature.is_active,
      isFeatured: feature.is_featured,
      category: feature.category || 'why-choose'
    })
    setEditingId(feature.id)
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return

    try {
      const result = await ApiClient.delete(`/api/features/${id}`)

      if (result.error) {
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        toast({
          title: "Error",
          description: result.error || "Failed to delete feature",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Feature deleted successfully"
        })
        fetchFeatures()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete feature",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    setFormData(defaultFormData)
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
          <h1 className="text-3xl font-bold">Features Management</h1>
          <p className="text-gray-600">Manage website features and benefits sections</p>
        </div>

        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Feature
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Feature' : 'Create New Feature'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update feature information' : 'Add a new feature to display on your website'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Expert Guidance"
                    required
                  />
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the feature..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                <div className="space-y-2">
                  <Label htmlFor="orderIndex">Order Index</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Text (Optional)</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="Learn More"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaLink">CTA Link (Optional)</Label>
                  <Input
                    id="ctaLink"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="/about"
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
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Create'} Feature
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
        {features.map((feature) => (
          <Card key={feature.id} className={!feature.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: feature.background_color }}
                  >
                    <span
                      className="text-lg font-bold"
                      style={{ color: feature.icon_color }}
                    >
                      {feature.icon || '✓'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-gray-600 mt-1">{feature.description}</p>
                    <div className="flex gap-2 mt-2">
                      {feature.category && (
                        <Badge variant="secondary">{feature.category}</Badge>
                      )}
                      {feature.is_featured && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Featured
                        </Badge>
                      )}
                      {feature.cta_text && (
                        <Badge variant="outline">Has CTA</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {feature.is_active ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(feature)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(feature.id)}
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

        {features.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No features found</p>
              <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Your First Feature
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}