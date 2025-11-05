"use client"

import { useState, useEffect } from "react"
import { CourseCard } from "./course-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, List, Loader2 } from "lucide-react"

interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  instructorName: string
  price: number
  originalPrice?: number
  currency: string
  duration: number
  level: string
  category: {
    id: string
    name: string
    slug: string
  }
  thumbnailUrl?: string
  videoUrl?: string
  isPublished: boolean
  isFeatured: boolean
  maxStudents?: number
  language: string
  requirements: string[]
  learningObjectives: string[]
  rating: number
  totalRatings: number
  totalStudents: number
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  courses: Course[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function CourseGrid() {
  const [courses, setCourses] = useState<Course[]>([])
  const [pagination, setPagination] = useState<ApiResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [levelFilter, setLevelFilter] = useState("")
  const coursesPerPage = 12

  useEffect(() => {
    fetchCourses()
  }, [currentPage, sortBy, searchTerm, categoryFilter, levelFilter])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: coursesPerPage.toString(),
        sort: sortBy,
      })

      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter) params.append('categoryId', categoryFilter)
      if (levelFilter) params.append('level', levelFilter)

      const response = await fetch(`/api/courses?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      const data: ApiResponse = await response.json()
      setCourses(data.courses)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('Failed to load courses. Please try again.')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchCourses} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with sorting and view options */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Courses</h2>
          <p className="text-gray-600">
            {pagination ? `${pagination.totalCount} courses found` : `${courses.length} courses found`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="title">Alphabetical</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Course Grid/List */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No courses found</div>
          <p className="text-gray-400">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>

          {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
            let page: number
            if (pagination.totalPages <= 5) {
              page = index + 1
            } else if (currentPage <= 3) {
              page = index + 1
            } else if (currentPage >= pagination.totalPages - 2) {
              page = pagination.totalPages - 4 + index
            } else {
              page = currentPage - 2 + index
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className="w-10"
              >
                {page}
              </Button>
            )
          })}

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
