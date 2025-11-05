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
import { ImageUpload } from '@/components/ui/image-upload'
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
  FileText,
  Calendar,
  Tag,
  Search,
  Image,
  Clock,
  User,
  ExternalLink
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt?: string
  seoTitle?: string
  seoDescription?: string
  readTime?: number
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    name: string
    email: string
  }
  category?: {
    id: string
    name: string
    slug: string
  }
  tags?: Array<{
    id: string
    name: string
    slug: string
  }>
}

interface BlogPostFormData {
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string
  seoTitle: string
  seoDescription: string
  readTime: number | null
  categoryId: string
  tagIds: string[]
}

const defaultFormData: BlogPostFormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featuredImage: '',
  status: 'DRAFT',
  publishedAt: '',
  seoTitle: '',
  seoDescription: '',
  readTime: null,
  categoryId: '',
  tagIds: [],
}

const statusOptions = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'PUBLISHED', label: 'Published', color: 'bg-green-100 text-green-800' },
  { value: 'ARCHIVED', label: 'Archived', color: 'bg-yellow-100 text-yellow-800' },
]

export default function BlogPostsManagement() {
  const router = useRouter()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Array<{id: string, name: string, slug: string}>>([])
  const [tags, setTags] = useState<Array<{id: string, name: string, slug: string}>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState<BlogPostFormData>(defaultFormData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Category management states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  useEffect(() => {
    fetchBlogPosts()
    fetchCategories()
    fetchTags()
  }, [])

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/admin/content?type=blog&limit=100', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setBlogPosts(data.posts || [])
      } else {
        console.error('Failed to fetch blog posts:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      setTags(data.tags || [])
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) return
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newCategoryName.trim(),
          slug: newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: newCategoryDescription.trim() || undefined
        })
      })

      if (response.ok) {
        await fetchCategories() // Refresh categories
        setNewCategoryName('')
        setNewCategoryDescription('')
        setIsCategoryDialogOpen(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Failed to create category:', error)
      alert('Failed to create category')
    }
  }

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    // Strip HTML tags and calculate word count
    const textContent = content.replace(/<[^>]*>/g, '').trim()
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      console.log('Original formData:', JSON.stringify(formData, null, 2))
      
      // Only extract the exact fields we need to prevent contamination
      const cleanData = {
        title: String(formData.title || '').trim(),
        slug: String(formData.slug || '').trim() || generateSlug(String(formData.title || '')),
        content: String(formData.content || '').trim(),
        excerpt: String(formData.excerpt || '').trim() || undefined,
        featuredImage: String(formData.featuredImage || '').trim() || undefined,
        status: formData.status === 'PUBLISHED' ? 'PUBLISHED' : formData.status === 'ARCHIVED' ? 'ARCHIVED' : 'DRAFT',
        seoTitle: String(formData.seoTitle || '').trim() || undefined,
        seoDescription: String(formData.seoDescription || '').trim() || undefined,
        categoryId: formData.categoryId && formData.categoryId.trim() ? formData.categoryId : undefined,
        tags: Array.isArray(formData.tagIds) ? formData.tagIds : [],
        publishedAt: formData.status === 'PUBLISHED' && !formData.publishedAt
          ? new Date().toISOString()
          : formData.publishedAt || undefined,
      }

      const url = editingPost
        ? `/api/admin/content/${editingPost.id}`
        : '/api/admin/content'

      const method = editingPost ? 'PUT' : 'POST'

      const body = editingPost 
        ? cleanData 
        : { type: 'blog', ...cleanData }

      console.log('Frontend sending body:', JSON.stringify(body, null, 2))

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (response.ok) {
        await fetchBlogPosts()
        setIsDialogOpen(false)
        setEditingPost(null)
        setFormData(defaultFormData)
        setActiveTab('list')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save blog post')
      }
    } catch (error) {
      console.error('Failed to save blog post:', error)
      alert('Failed to save blog post')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featuredImage: post.featuredImage || '',
      status: post.status,
      publishedAt: post.publishedAt || '',
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      readTime: post.readTime || null,
      categoryId: post.category?.id || '',
      tagIds: post.tags?.map(t => t.id) || [],
    })
    setIsDialogOpen(true)
    setActiveTab('form')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        await fetchBlogPosts()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete blog post')
      }
    } catch (error) {
      console.error('Failed to delete blog post:', error)
      alert('Failed to delete blog post')
    }
  }

  const handleNewPost = () => {
    setEditingPost(null)
    // Explicitly reset form data to ensure clean state
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featuredImage: '',
      status: 'DRAFT',
      publishedAt: '',
      seoTitle: '',
      seoDescription: '',
      readTime: null,
      categoryId: '',
      tagIds: [],
    })
    setIsDialogOpen(true)
    setActiveTab('form')
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status)
    return statusOption ? statusOption : statusOptions[0]
  }

  const getFilteredPosts = () => {
    let filtered = blogPosts

    if (filter !== 'all') {
      filtered = filtered.filter(post => post.status.toLowerCase() === filter)
    }

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const filteredPosts = getFilteredPosts()

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
            <h1 className="text-3xl font-bold text-gray-900">Blog Posts Management</h1>
            <p className="text-gray-600">Create and manage blog posts and articles</p>
          </div>
        </div>
        <Button onClick={handleNewPost}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({blogPosts.length})</SelectItem>
            <SelectItem value="published">
              Published ({blogPosts.filter(p => p.status === 'PUBLISHED').length})
            </SelectItem>
            <SelectItem value="draft">
              Draft ({blogPosts.filter(p => p.status === 'DRAFT').length})
            </SelectItem>
            <SelectItem value="archived">
              Archived ({blogPosts.filter(p => p.status === 'ARCHIVED').length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Posts ({filteredPosts.length})</TabsTrigger>
          <TabsTrigger value="form">
            {editingPost ? 'Edit Post' : 'New Post'}
          </TabsTrigger>
        </TabsList>

        {/* Posts List */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>
                Manage your blog posts and articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Read Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => {
                    const statusBadge = getStatusBadge(post.status)
                    return (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            {post.featuredImage ? (
                              <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-16 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <Image className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-medium line-clamp-1">{post.title}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                {post.excerpt || post.content.substring(0, 100) + '...'}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                <User className="h-3 w-3" />
                                <span>{post.author?.name || 'Unknown'}</span>
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.category ? (
                            <Badge variant="outline">{post.category.name}</Badge>
                          ) : (
                            <span className="text-gray-400">Uncategorized</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge.color}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {post.publishedAt ? (
                            <div className="text-sm">
                              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Not published'}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not published</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {post.readTime && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              {post.readTime} min
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-[100]">
                              <DropdownMenuItem onClick={() => handleEdit(post)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(post.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Post Form */}
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </CardTitle>
              <CardDescription>
                Write and publish blog posts and articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content - 2/3 width */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => {
                          const value = e.target.value
                          setFormData(prev => ({
                            ...prev,
                            title: value,
                            slug: prev.slug || generateSlug(value)
                          }))
                        }}
                        placeholder="Enter blog post title..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="blog-post-url-slug"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Brief description of the blog post..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="content">Content *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const fileInput = document.createElement('input')
                            fileInput.type = 'file'
                            fileInput.accept = 'image/*'
                            fileInput.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                const formData = new FormData()
                                formData.append('file', file)
                                formData.append('context', 'posts')
                                
                                try {
                                  const response = await fetch('/api/upload-local', {
                                    method: 'POST',
                                    body: formData,
                                    credentials: 'include'
                                  })
                                  
                                  const result = await response.json()
                                  if (result.success) {
                                    const imgTag = `<img src="${result.url}" alt="${file.name}" style="max-width: 100%; height: auto;" />\n`
                                    setFormData(prev => ({
                                      ...prev,
                                      content: prev.content + imgTag
                                    }))
                                  }
                                } catch (error) {
                                  console.error('Upload error:', error)
                                  alert('Failed to upload image')
                                }
                              }
                            }
                            fileInput.click()
                          }}
                        >
                          + Insert Image
                        </Button>
                      </div>
                      <div className="mt-2">
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Write your blog post content here... You can use HTML tags for formatting."
                          rows={15}
                          className="font-mono text-sm resize-y min-h-[300px]"
                          required
                        />
                        <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                          <p className="text-xs font-medium text-gray-700 mb-2">HTML Formatting Guide:</p>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p><code>&lt;h1&gt;Heading 1&lt;/h1&gt;</code> - Main headings</p>
                            <p><code>&lt;h2&gt;Heading 2&lt;/h2&gt;</code> - Section headings</p>
                            <p><code>&lt;p&gt;Paragraph text&lt;/p&gt;</code> - Normal paragraphs</p>
                            <p><code>&lt;strong&gt;Bold text&lt;/strong&gt;</code> - Bold formatting</p>
                            <p><code>&lt;em&gt;Italic text&lt;/em&gt;</code> - Italic formatting</p>
                            <p><code>&lt;a href="url"&gt;Link text&lt;/a&gt;</code> - Links</p>
                            <p><code>&lt;img src="url" alt="description" /&gt;</code> - Images</p>
                            <p><code>&lt;ul&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ul&gt;</code> - Bullet lists</p>
                            <p><code>&lt;ol&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ol&gt;</code> - Numbered lists</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar - 1/3 width */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Publish Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="publishedAt">Publish Date</Label>
                          <Input
                            id="publishedAt"
                            type="datetime-local"
                            value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Featured Image</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ImageUpload
                          value={formData.featuredImage}
                          onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                          label="Featured Image"
                          showUrl={true}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Categories & Tags</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="categoryId">Category</Label>
                          <Select
                            value={formData.categoryId || "no-category"}
                            onValueChange={(value) => {
                              if (value === "create-new") {
                                setIsCategoryDialogOpen(true)
                              } else {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  categoryId: value === "no-category" ? "" : value 
                                }))
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no-category">No Category</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                              <SelectItem value="create-new" className="text-blue-600 font-medium">
                                + Create New Category
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Tags</Label>
                          <div className="space-y-2">
                            {tags.map((tag) => (
                              <div key={tag.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`tag-${tag.id}`}
                                  checked={formData.tagIds.includes(tag.id)}
                                  onChange={(e) => {
                                    const checked = e.target.checked
                                    setFormData(prev => ({
                                      ...prev,
                                      tagIds: checked
                                        ? [...prev.tagIds, tag.id]
                                        : prev.tagIds.filter(id => id !== tag.id)
                                    }))
                                  }}
                                  className="rounded"
                                />
                                <label htmlFor={`tag-${tag.id}`} className="text-sm">
                                  {tag.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">SEO Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="seoTitle">SEO Title</Label>
                          <Input
                            id="seoTitle"
                            value={formData.seoTitle}
                            onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                            placeholder="SEO optimized title"
                          />
                        </div>

                        <div>
                          <Label htmlFor="seoDescription">SEO Description</Label>
                          <Textarea
                            id="seoDescription"
                            value={formData.seoDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                            placeholder="SEO meta description"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="readTime">Read Time (minutes)</Label>
                          <Input
                            id="readTime"
                            type="number"
                            value={formData.readTime || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              readTime: e.target.value ? parseInt(e.target.value) : null
                            }))}
                            placeholder="Auto-calculated"
                            min="1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

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
                    {saving ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for organizing your blog posts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description (Optional)</Label>
              <Textarea
                id="categoryDescription"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createCategory} disabled={!newCategoryName.trim()}>
              Create Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}