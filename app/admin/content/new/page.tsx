'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ArrowLeft, Save, Eye, FileText, Globe, Settings } from 'lucide-react'

interface ContentData {
  title: string
  slug: string
  content: string
  excerpt: string
  type: 'page' | 'post' | 'country' | 'university'
  status: 'draft' | 'published'
  featuredImage: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  template: string
  category: string
  tags: string[]
  isFeatured: boolean
}

export default function NewContentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [contentData, setContentData] = useState<ContentData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    type: 'page',
    status: 'draft',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    template: '',
    category: '',
    tags: [],
    isFeatured: false
  })

  const handleInputChange = (field: keyof ContentData, value: any) => {
    setContentData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setContentData(prev => ({ ...prev, slug }))
    }
  }

  const handleSave = async (status: 'draft' | 'published') => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contentData,
          status
        }),
      })

      if (response.ok) {
        router.push('/admin/content?success=created')
      } else {
        throw new Error('Failed to save content')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const templates = {
    page: [
      { value: 'default', label: 'Default Page' },
      { value: 'homepage', label: 'Homepage' },
      { value: 'about', label: 'About Us' },
      { value: 'contact', label: 'Contact Us' },
      { value: 'services', label: 'Services' },
      { value: 'landing', label: 'Landing Page' }
    ],
    post: [
      { value: 'default', label: 'Default Post' },
      { value: 'news', label: 'News Article' },
      { value: 'guide', label: 'Study Guide' },
      { value: 'success-story', label: 'Success Story' }
    ],
    country: [
      { value: 'country-profile', label: 'Country Profile' },
      { value: 'study-guide', label: 'Study Guide' }
    ],
    university: [
      { value: 'university-profile', label: 'University Profile' },
      { value: 'course-listing', label: 'Course Listing' }
    ]
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Content</h1>
            <p className="text-gray-600">Build pages, posts, and content with the rich editor</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={loading || !contentData.title}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={loading || !contentData.title}
          >
            <Eye className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={contentData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter content title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={contentData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="url-friendly-slug"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={contentData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Brief description for previews and SEO..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Content</Label>
                    <RichTextEditor
                      value={contentData.content}
                      onChange={(value) => handleInputChange('content', value)}
                      placeholder="Start writing your content..."
                      minHeight={400}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    SEO Optimization
                  </CardTitle>
                  <CardDescription>
                    Optimize your content for search engines and social media
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={contentData.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      placeholder="SEO title (max 60 characters)"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500">
                      {contentData.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={contentData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      placeholder="SEO description (max 160 characters)"
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      {contentData.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Keywords</Label>
                    <Input
                      id="metaKeywords"
                      value={contentData.metaKeywords}
                      onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featuredImage">Featured Image URL</Label>
                    <Input
                      id="featuredImage"
                      value={contentData.featuredImage}
                      onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Content Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select
                      value={contentData.template}
                      onValueChange={(value) => handleInputChange('template', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates[contentData.type].map((template) => (
                          <SelectItem key={template.value} value={template.value}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={contentData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="Content category"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Featured Content</Label>
                      <p className="text-sm text-gray-600">
                        Mark as featured content for homepage
                      </p>
                    </div>
                    <Switch
                      checked={contentData.isFeatured}
                      onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Content Type</Label>
                <Select
                  value={contentData.type}
                  onValueChange={(value: any) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="post">Blog Post</SelectItem>
                    <SelectItem value="country">Country Info</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={contentData.status}
                  onValueChange={(value: any) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}