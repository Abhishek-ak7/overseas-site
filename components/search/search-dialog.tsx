"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, X, FileText, BookOpen, Calendar, Clock, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  id: string
  type: 'blog' | 'page'
  title: string
  slug: string
  excerpt: string
  image?: string | null
  date?: Date | null
  author?: string
  readTime?: number | null
  url: string
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState({ blogs: 0, pages: 0 })

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([])
      setCounts({ blogs: 0, pages: 0 })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`)
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        setCounts(data.counts)
      } else {
        setResults([])
        setCounts({ blogs: 0, pages: 0 })
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setCounts({ blogs: 0, pages: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setCounts({ blogs: 0, pages: 0 })
    }
  }, [open])

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleResultClick = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Search className="h-6 w-6 text-primary" />
            Search
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 pt-4 pb-3 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search articles, pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg border-2 focus:border-primary rounded-xl"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Result counts */}
          {query.length >= 2 && !loading && (
            <div className="flex gap-3 mt-3">
              <Badge variant="secondary" className="text-sm">
                {counts.blogs} Blog{counts.blogs !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {counts.pages} Page{counts.pages !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto flex-1 px-6 py-4" style={{ maxHeight: 'calc(85vh - 200px)' }}>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Start typing to search articles and pages...</p>
              <p className="text-sm mt-2">Minimum 2 characters required</p>
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No results found for "{query}"</p>
              <p className="text-sm mt-2">Try different keywords or check spelling</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.url}
                  onClick={handleResultClick}
                  className="block group"
                >
                  <div className="flex gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                    {/* Image */}
                    {result.image && (
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={result.image}
                          alt={result.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {result.type === 'blog' ? (
                            <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                          <Badge variant={result.type === 'blog' ? 'default' : 'secondary'} className="text-xs">
                            {result.type === 'blog' ? 'Blog' : 'Page'}
                          </Badge>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>

                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">
                        {result.title}
                      </h3>

                      {result.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {result.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {result.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(result.date)}
                          </div>
                        )}
                        {result.author && (
                          <div className="flex items-center gap-1">
                            By {result.author}
                          </div>
                        )}
                        {result.readTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {result.readTime} min read
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}