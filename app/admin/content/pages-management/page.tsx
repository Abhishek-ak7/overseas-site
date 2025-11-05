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
import dynamic from 'next/dynamic'

import { RichTextEditor } from '@/components/ui/rich-text-editor'
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
// Custom dropdown implementation - removed Radix dropdown imports
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
  FileText,
  Search,
  Globe,
  Calendar,
  User
} from 'lucide-react'

interface Page {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  featured_image?: string
  template?: string
  is_published: boolean
  published_at?: string
  author_id: string
  created_at: string
  updated_at: string
  users: {
    first_name: string
    last_name: string
    email: string
  }
  page_sections: any[]
}

interface PageFormData {
  title: string
  slug: string
  content: string
  excerpt: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  featured_image: string
  template: string
  is_published: boolean
  published_at: string
}

export default function PagesManagementPage() {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [publishedFilter, setPublishedFilter] = useState<string>('all')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    featured_image: '',
    template: 'default',
    is_published: false,
    published_at: '',
  })

  useEffect(() => {
    fetchPages()
  }, [searchQuery, publishedFilter])

  const fetchPages = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (publishedFilter !== 'all') params.append('published', publishedFilter)

      const response = await fetch(`/api/admin/pages-content?${params.toString()}`, {
        credentials: 'include'
      })
      const data = await response.json()
      setPages(data.pages || [])
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof PageFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug from title
    if (field === 'title' && !editingPage) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({
        ...prev,
        slug: slug
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = editingPage
        ? `/api/admin/pages-content/${editingPage.id}`
        : '/api/admin/pages-content'

      const method = editingPage ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          published_at: formData.is_published && !formData.published_at
            ? new Date().toISOString()
            : formData.published_at || null,
        }),
      })

      if (response.ok) {
        await fetchPages()
        setShowDialog(false)
        setEditingPage(null)
        resetForm()
      } else {
        const errorData = await response.json()
        alert(`Failed to save page: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save page. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      meta_keywords: page.meta_keywords || '',
      featured_image: page.featured_image || '',
      template: page.template || 'default',
      is_published: page.is_published,
      published_at: page.published_at || '',
    })
    setShowDialog(true)
  }

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/pages-content/${pageId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchPages()
      } else {
        throw new Error('Failed to delete page')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete page. Please try again.')
    }
  }

  const handleTogglePublished = async (pageId: string, isPublished: boolean) => {
    try {
      const page = pages.find(p => p.id === pageId)
      if (!page) return

      const response = await fetch(`/api/admin/pages-content/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...page,
          is_published: isPublished,
          published_at: isPublished && !page.published_at ? new Date().toISOString() : page.published_at,
        }),
      })

      if (response.ok) {
        await fetchPages()
      } else {
        throw new Error('Failed to update page status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('Failed to update page status. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      featured_image: '',
      template: 'default',
      is_published: false,
      published_at: '',
    })
  }

  const openCreateDialog = () => {
    setEditingPage(null)
    resetForm()
    setShowDialog(true)
  }

  const toggleDropdown = (pageId: string) => {
    setOpenDropdown(openDropdown === pageId ? null : pageId)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null)
    }

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdown])

  // Template options for different page types
  const pageTemplates = [
    { value: 'default', label: 'Default' },
    { value: 'about', label: 'About Us' },
    { value: 'services', label: 'Services' },
    { value: 'study-abroad', label: 'Study Abroad' },
    { value: 'guide', label: 'Guide/Resources' },
    { value: 'contact', label: 'Contact' },
    { value: 'landing', label: 'Landing Page' },
  ]

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
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Page Management</h1>
            <p className="text-gray-600">Manage all website pages and content</p>
          </div>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Page
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Pages</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title, slug, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Publication Status</Label>
              <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="true">Published Only</SelectItem>
                  <SelectItem value="false">Draft Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      <Card>
        <CardHeader>
          <CardTitle>Pages ({pages.length})</CardTitle>
          <CardDescription>
            Manage your website pages and their content
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {pages.length > 0 ? (
              <div className="relative">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {pages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{page.title}</div>
                            {page.excerpt && (
                              <div className="text-sm text-gray-600 truncate max-w-xs">
                                {page.excerpt}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          /{page.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge variant={page.is_published ? "default" : "secondary"}>
                            {page.is_published ? 'Published' : 'Draft'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublished(page.id, !page.is_published)}
                          >
                            {page.is_published ?
                              <EyeOff className="h-4 w-4" /> :
                              <Eye className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline">
                          {page.template || 'default'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {page.users.first_name} {page.users.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(page.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative inline-block">
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleDropdown(page.id)
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>

                          {openDropdown === page.id && (
                            <div
                              className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-blue-200 rounded-lg shadow-xl z-50"
                              style={{
                                zIndex: 9999,
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                animation: 'fadeIn 0.15s ease-out'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleEdit(page)
                                    setOpenDropdown(null)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Page
                                </button>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    window.open(`/${page.slug}`, '_blank')
                                    setOpenDropdown(null)
                                  }}
                                >
                                  <Globe className="mr-2 h-4 w-4" />
                                  View Page
                                </button>
                                <hr className="my-1 border-gray-200" />
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleDelete(page.id)
                                    setOpenDropdown(null)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || publishedFilter !== 'all'
                    ? "No pages match your current filters."
                    : "Create your first page to get started."
                  }
                </p>
                {(!searchQuery && publishedFilter === 'all') && (
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Page
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) {
            setEditingPage(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Edit Page' : 'Create New Page'}
            </DialogTitle>
            <DialogDescription>
              Configure page content, SEO settings, and publication options
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter page title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="page-url-slug"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Page Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description of the page"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Page Content *</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder="Enter the main content for this page..."
                  minHeight={300}
                />
                <p className="text-sm text-gray-500">
                  Use the rich text editor to format your content. Content sections can be managed separately after creation.
                </p>
              </div>

              <div className="space-y-2">
                <ImageUpload
                  value={formData.featured_image}
                  onChange={(url) => handleInputChange('featured_image', url)}
                  label="Featured Image"
                  showUrl={true}
                  context="pages"
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="SEO title (defaults to page title)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="Brief description for search engines (150-160 characters)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Page Template</Label>
                <Select value={formData.template} onValueChange={(value) => handleInputChange('template', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageTemplates.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Publish Page</Label>
                  <p className="text-sm text-gray-600">
                    Make this page visible on the website
                  </p>
                </div>
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                />
              </div>

              {formData.is_published && (
                <div className="space-y-2">
                  <Label htmlFor="published_at">Publication Date</Label>
                  <Input
                    id="published_at"
                    type="datetime-local"
                    value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('published_at', e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Leave empty to use current date/time
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.title || !formData.slug}>
              {saving ? 'Saving...' : editingPage ? 'Update Page' : 'Create Page'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}