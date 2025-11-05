"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Statistic {
  id: string
  label: string
  value: string
  icon?: string
  icon_color: string
  background_color: string
  is_animated: boolean
  animation_duration: number
  suffix?: string
  prefix?: string
  order_index: number
  is_active: boolean
  category?: string
  auto_update: boolean
  query_source?: string
  created_at: string
  updated_at: string
}

interface StatisticFormData {
  label: string
  value: string
  icon?: string
  iconColor: string
  backgroundColor: string
  isAnimated: boolean
  animationDuration: number
  suffix?: string
  prefix?: string
  orderIndex: number
  isActive: boolean
  category?: string
  autoUpdate: boolean
  querySource?: string
}

const defaultFormData: StatisticFormData = {
  label: '',
  value: '',
  icon: 'TrendingUp',
  iconColor: '#EF4444',
  backgroundColor: '#FFFFFF',
  isAnimated: true,
  animationDuration: 2000,
  suffix: '',
  prefix: '',
  orderIndex: 0,
  isActive: true,
  category: '',
  autoUpdate: false,
  querySource: ''
}

const iconOptions = [
  'TrendingUp', 'Users', 'GraduationCap', 'Award', 'Globe', 'BookOpen',
  'Calendar', 'Clock', 'Heart', 'Star', 'CheckCircle', 'Target'
]

const categoryOptions = [
  'homepage', 'partners', 'general', 'achievements', 'students', 'universities'
]

export default function StatisticsManagementPage() {
  const router = useRouter()
  const [statistics, setStatistics] = useState<Statistic[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<StatisticFormData>(defaultFormData)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const result = await ApiClient.get('/api/statistics?includeInactive=true')
      if (result.error) {
        console.error('Failed to fetch statistics:', result.error)
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        toast({
          title: "Error",
          description: result.error || "Failed to fetch statistics",
          variant: "destructive"
        })
      } else {
        setStatistics(result.data?.statistics || [])
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      toast({
        title: "Error",
        description: "Failed to fetch statistics",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId ? `/api/statistics/${editingId}` : '/api/statistics'

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
          description: result.error || `Failed to ${editingId ? 'update' : 'create'} statistic`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: `Statistic ${editingId ? 'updated' : 'created'} successfully`
        })

        setFormData(defaultFormData)
        setEditingId(null)
        setIsCreating(false)
        fetchStatistics()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingId ? 'update' : 'create'} statistic`,
        variant: "destructive"
      })
    }
  }

  const handleEdit = (statistic: Statistic) => {
    setFormData({
      label: statistic.label,
      value: statistic.value,
      icon: statistic.icon,
      iconColor: statistic.icon_color,
      backgroundColor: statistic.background_color,
      isAnimated: statistic.is_animated,
      animationDuration: statistic.animation_duration,
      suffix: statistic.suffix || '',
      prefix: statistic.prefix || '',
      orderIndex: statistic.order_index,
      isActive: statistic.is_active,
      category: statistic.category || '',
      autoUpdate: statistic.auto_update,
      querySource: statistic.query_source || ''
    })
    setEditingId(statistic.id)
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this statistic?')) return

    try {
      const result = await ApiClient.delete(`/api/statistics/${id}`)

      if (result.error) {
        if (result.error.includes('Authentication required')) {
          router.push('/auth/login')
          return
        }
        toast({
          title: "Error",
          description: result.error || "Failed to delete statistic",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Statistic deleted successfully"
        })
        fetchStatistics()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete statistic",
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
          <h1 className="text-3xl font-bold">Statistics Management</h1>
          <p className="text-gray-600">Manage homepage and section statistics</p>
        </div>

        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Statistic
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Statistic' : 'Create New Statistic'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update statistic information' : 'Add a new statistic to display on your website'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Years of Experience"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prefix">Prefix</Label>
                  <Input
                    id="prefix"
                    value={formData.prefix}
                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                    placeholder="$"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suffix">Suffix</Label>
                  <Input
                    id="suffix"
                    value={formData.suffix}
                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                    placeholder="+"
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
                  <Label htmlFor="animationDuration">Animation Duration (ms)</Label>
                  <Input
                    id="animationDuration"
                    type="number"
                    value={formData.animationDuration}
                    onChange={(e) => setFormData({ ...formData, animationDuration: parseInt(e.target.value) || 2000 })}
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
                    id="isAnimated"
                    checked={formData.isAnimated}
                    onCheckedChange={(checked) => setFormData({ ...formData, isAnimated: checked })}
                  />
                  <Label htmlFor="isAnimated">Animated</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoUpdate"
                    checked={formData.autoUpdate}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoUpdate: checked })}
                  />
                  <Label htmlFor="autoUpdate">Auto Update</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Create'} Statistic
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
        {statistics.map((statistic) => (
          <Card key={statistic.id} className={!statistic.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: statistic.background_color }}
                  >
                    <span
                      className="text-lg font-bold"
                      style={{ color: statistic.icon_color }}
                    >
                      {statistic.icon || '📊'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{statistic.label}</h3>
                    <p className="text-xl font-bold text-primary">
                      {statistic.prefix || ''}{statistic.value}{statistic.suffix || ''}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {statistic.category && (
                        <Badge variant="secondary">{statistic.category}</Badge>
                      )}
                      {statistic.is_animated && (
                        <Badge variant="outline">Animated</Badge>
                      )}
                      {statistic.auto_update && (
                        <Badge variant="outline">Auto Update</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {statistic.is_active ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(statistic)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(statistic.id)}
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

        {statistics.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No statistics found</p>
              <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Your First Statistic
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}