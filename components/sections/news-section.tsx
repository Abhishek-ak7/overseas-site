"use client"

import { useState, useEffect } from "react"
import { CalendarDays, ArrowRight, Clock, User, Tag } from "lucide-react"
import Image from "next/image"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImageUrl?: string
  authorName: string
  authorAvatar?: string
  publishedAt: string
  readingTime?: number
  category: string
  isActive: boolean
  isFeatured: boolean
  orderIndex: number
  tags: string[]
  views?: number
}


export function NewsSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog-posts?featured=true&limit=3')
      if (response.ok) {
        const data = await response.json()
        // Transform API data to match component interface
        const transformedPosts = data.posts?.map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          featuredImageUrl: post.featuredImage,
          authorName: post.author ? `${post.author.firstName} ${post.author.lastName}` : 'BN Overseas Team',
          authorAvatar: post.author?.profile?.avatar_url,
          publishedAt: post.publishedAt,
          readingTime: post.readTime || 5,
          category: post.category?.name || 'Study Abroad',
          isActive: post.isPublished,
          isFeatured: post.isFeatured,
          orderIndex: 0,
          tags: post.tags?.map((tag: any) => tag.name) || [],
          views: post.viewCount
        })) || []
        setPosts(transformedPosts)
      } else {
        console.warn('No blog posts data received from API')
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatReadingTime = (minutes: number | undefined) => {
    if (!minutes) return '5 min read'
    return `${minutes} min read`
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const activePosts = posts
    .filter(post => post.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .slice(0, 3)

  if (activePosts.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6">
            <Tag className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Latest Insights & News
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest trends, tips, and insights about studying abroad.
            Our expert articles help you make informed decisions about your education journey.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {activePosts.map((post) => (
            <article 
              key={post.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              {/* Featured Image */}
              <div className="relative h-48 overflow-hidden">
                {post.featuredImageUrl ? (
                  <Image
                    src={post.featuredImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <div className="text-primary">
                      <Tag className="w-12 h-12" />
                    </div>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                </div>

                {/* Reading Time */}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatReadingTime(post.readingTime)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Meta Info */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  {post.views && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.views.toLocaleString()} views</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Author & CTA */}
                <div className="flex items-center justify-between">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                      {post.authorAvatar ? (
                        <Image
                          src={post.authorAvatar}
                          alt={post.authorName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium text-xs">
                            {post.authorName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {post.authorName}
                    </span>
                  </div>

                  {/* CTA */}
                  <button 
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                    onClick={() => window.location.href = `/blog/${post.slug}`}
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        {/* <div className="text-center">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Want More Study Abroad Tips?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter for weekly updates on study abroad opportunities, 
              visa updates, scholarship deadlines, and expert tips from our counselors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                Subscribe
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  )
}