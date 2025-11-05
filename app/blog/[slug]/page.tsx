'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  ArrowLeft,
  BookOpen,
  ThumbsUp,
  MessageCircle,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  slug: string
  featuredImage?: string
  author: {
    id: string
    name: string
    email: string
    avatar?: string
    bio?: string
  }
  category: {
    id: string
    name: string
    slug: string
  }
  tags: string[]
  publishedAt: string
  updatedAt: string
  readTime: number
  views: number
  likes: number
  comments: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage?: string
  publishedAt: string
  readTime: number
}

interface BlogPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostPage({ params }: BlogPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [params.slug])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${params.slug}`)
      if (!response.ok) {
        if (response.status === 404) {
          notFound()
        }
        throw new Error('Failed to fetch post')
      }

      const data = await response.json()
      setPost(data.post)
      setRelatedPosts(data.relatedPosts || [])

      // Track view
      await fetch(`/api/blog/posts/${params.slug}/view`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to fetch post:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!post) return

    try {
      const response = await fetch(`/api/blog/posts/${post.id}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        setLiked(!liked)
        setPost(prev => prev ? {
          ...prev,
          likes: liked ? prev.likes - 1 : prev.likes + 1
        } : null)
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const handleShare = (platform: string) => {
    if (!post) return

    const url = window.location.href
    const title = post.title
    const text = post.excerpt

    let shareUrl = ''

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
            <span>/</span>
            <Link href="/blog" className="text-blue-600 hover:underline">Blog</Link>
            <span>/</span>
            <span className="text-gray-600">{post.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{post.category.name}</Badge>
                  {post.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Published {formatDate(post.publishedAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {post.readTime} min read
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {post.views.toLocaleString()} views
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>
                        {getAuthorInitials(post.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">{post.author.name}</div>
                      <div className="text-sm text-gray-600">Author</div>
                    </div>
                  </div>

                  {/* Social Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={liked ? 'text-red-600 border-red-600' : ''}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      {showShareMenu && (
                        <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-2 z-10">
                          <div className="flex flex-col gap-1 min-w-32">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare('facebook')}
                              className="justify-start"
                            >
                              <Facebook className="h-4 w-4 mr-2" />
                              Facebook
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare('twitter')}
                              className="justify-start"
                            >
                              <Twitter className="h-4 w-4 mr-2" />
                              Twitter
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare('linkedin')}
                              className="justify-start"
                            >
                              <Linkedin className="h-4 w-4 mr-2" />
                              LinkedIn
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare('copy')}
                              className="justify-start"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {post.featuredImage && (
                <div className="relative h-64 md:h-96">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="px-8 pb-8">
                  <Separator className="mb-6" />
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Author Bio */}
            {post.author.bio && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About the Author
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>
                        {getAuthorInitials(post.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">{post.author.name}</h3>
                      <p className="text-gray-600 text-sm">{post.author.bio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Back to Blog */}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Related Articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <div key={relatedPost.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <Link
                          href={`/blog/${relatedPost.slug}`}
                          className="block hover:text-blue-600 transition-colors"
                        >
                          <h4 className="font-medium line-clamp-2 mb-2">
                            {relatedPost.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(relatedPost.publishedAt)}
                            <Clock className="h-3 w-3 ml-2" />
                            {relatedPost.readTime} min
                          </div>
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* CTA */}
              <Card className="bg-blue-50">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-gray-900 mb-2">Need Expert Guidance?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get personalized advice from our education consultants
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/appointments/book">
                      Book Free Consultation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}