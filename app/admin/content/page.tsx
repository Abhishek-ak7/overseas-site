'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Globe,
  Settings,
  Image,
  Video,
  File,
  BarChart3,
  MessageSquare,
  Building,
  Flag,
  Star,
  Briefcase,
  Navigation
} from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  type: 'page' | 'post' | 'country' | 'university'
  status: 'published' | 'draft' | 'archived'
  author: string
  lastModified: string
  views?: number
  featured?: boolean
}

interface MediaItem {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  size: string
  url: string
  uploadedAt: string
}

export default function ContentManagement() {
  const router = useRouter()
  const [contents, setContents] = useState<ContentItem[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pages')

  useEffect(() => {
    fetchContent()
    fetchMedia()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content', {
        credentials: 'include'
      })
      const data = await response.json()
      // Ensure data is an array
      setContents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch content:', error)
      setContents([]) // Set empty array on error
    }
  }

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/admin/media', {
        credentials: 'include'
      })
      const data = await response.json()
      // Ensure data is an array
      setMediaItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch media:', error)
      setMediaItems([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, type: 'content' | 'media') => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const endpoint = type === 'content' ? '/api/admin/content' : '/api/admin/media'
      await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (type === 'content') {
        setContents(contents.filter(item => item.id !== id))
      } else {
        setMediaItems(mediaItems.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'document': return <File className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredContents = contents.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMedia = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const contentsByType = {
    pages: filteredContents.filter(item => item.type === 'page'),
    posts: filteredContents.filter(item => item.type === 'post'),
    countries: filteredContents.filter(item => item.type === 'country'),
    universities: filteredContents.filter(item => item.type === 'university')
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage pages, posts, and media content</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/content/media/upload')}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
          <Button onClick={() => router.push('/admin/content/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </Button>
        </div>
      </div>

      {/* Quick Access to Content Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => router.push('/admin/content/blog-posts')}
        >
          <FileText className="h-6 w-6" />
          <span className="text-sm">Blog Posts</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => router.push('/admin/content/features')}
        >
          <Star className="h-6 w-6" />
          <span className="text-sm">Features</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => router.push('/admin/content/services')}
        >
          <Briefcase className="h-6 w-6" />
          <span className="text-sm">Services</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => router.push('/admin/content/statistics')}
        >
          <BarChart3 className="h-6 w-6" />
          <span className="text-sm">Statistics</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => router.push('/admin/content/testimonials')}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-sm">Testimonials</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => router.push('/admin/content/partners')}
        >
          <Building className="h-6 w-6" />
          <span className="text-sm">Partners</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => router.push('/admin/content/journey-steps')}
        >
          <Navigation className="h-6 w-6" />
          <span className="text-sm">Journey Steps</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => router.push('/admin/content/countries')}
        >
          <Flag className="h-6 w-6" />
          <span className="text-sm">Countries</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => router.push('/admin/content/pages')}
        >
          <FileText className="h-6 w-6" />
          <span className="text-sm">Pages</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => router.push('/admin/appearance/menus')}
        >
          <Navigation className="h-6 w-6" />
          <span className="text-sm">Menus</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pages">Pages ({contentsByType.pages.length})</TabsTrigger>
          <TabsTrigger value="posts">Blog Posts ({contentsByType.posts.length})</TabsTrigger>
          <TabsTrigger value="countries">Countries ({contentsByType.countries.length})</TabsTrigger>
          <TabsTrigger value="universities">Universities ({contentsByType.universities.length})</TabsTrigger>
          <TabsTrigger value="media">Media ({filteredMedia.length})</TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Pages</CardTitle>
              <CardDescription>Manage static pages and landing pages</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentsByType.pages.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {item.title}
                          {item.featured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>{new Date(item.lastModified).toLocaleDateString()}</TableCell>
                      <TableCell>{item.views?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-[100]">
                            <DropdownMenuItem onClick={() => {
                              router.push(`/admin/content/edit/${item.id}`)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              window.open(`/pages/${item.id}`, '_blank')
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                handleDelete(item.id, 'content')
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

        {/* Blog Posts Tab */}
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>Manage blog posts and articles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentsByType.posts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {item.title}
                          {item.featured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>{new Date(item.lastModified).toLocaleDateString()}</TableCell>
                      <TableCell>{item.views?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-[100]">
                            <DropdownMenuItem onClick={() => {
                              router.push(`/admin/content/edit/${item.id}`)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              window.open(`/blog/${item.id}`, '_blank')
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                handleDelete(item.id, 'content')
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

        {/* Countries Tab */}
        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>Country Information</CardTitle>
              <CardDescription>Manage study destination information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Popular</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentsByType.countries.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {item.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(item.lastModified).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {item.featured && <Badge variant="outline">Popular</Badge>}
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
                              router.push(`/admin/countries/edit/${item.id}`)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              window.open(`/countries/${item.id}`, '_blank')
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                handleDelete(item.id, 'content')
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

        {/* Universities Tab */}
        <TabsContent value="universities">
          <Card>
            <CardHeader>
              <CardTitle>Universities</CardTitle>
              <CardDescription>Manage university profiles and information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>University</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentsByType.universities.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          {item.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>Canada</TableCell>
                      <TableCell>{new Date(item.lastModified).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-[100]">
                            <DropdownMenuItem onClick={() => {
                              router.push(`/admin/universities/edit/${item.id}`)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              window.open(`/universities/${item.id}`, '_blank')
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                handleDelete(item.id, 'content')
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

        {/* Media Tab */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>Manage images, videos, and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMedia.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400">
                          {getTypeIcon(item.type)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{item.size}</span>
                        <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <MoreHorizontal className="h-4 w-4 mr-2" />
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-[100]">
                          <DropdownMenuItem onClick={() => {
                            window.open(item.url, '_blank')
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(item.url)
                          }}>
                            <FileText className="mr-2 h-4 w-4" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              handleDelete(item.id, 'media')
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMedia.length === 0 && (
                <div className="text-center py-12">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No media files</h3>
                  <p className="text-gray-600 mb-4">Upload images, videos, or documents to get started.</p>
                  <Button onClick={() => router.push('/admin/content/media/upload')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}