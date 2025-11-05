import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Users, Play } from "lucide-react"

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

interface CourseCardProps {
  course: Course
  viewMode: "grid" | "list"
}

export function CourseCard({ course, viewMode }: CourseCardProps) {
  const currencySymbol = course.currency === 'INR' ? '₹' : '$'
  const displayPrice = course.price.toLocaleString()
  const displayOriginalPrice = course.originalPrice?.toLocaleString()

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <img
                src={course.thumbnailUrl || "/placeholder.svg"}
                alt={course.title}
                className="w-48 h-32 object-cover rounded-lg"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {course.category.name}
                  </Badge>
                  {course.isFeatured && (
                    <Badge variant="default" className="mb-2 ml-2">
                      Featured
                    </Badge>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 hover:text-primary">
                    <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                  </h3>
                  <p className="text-gray-600 mt-1">by {course.instructorName}</p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{currencySymbol}{displayPrice}</div>
                  {course.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">{currencySymbol}{displayOriginalPrice}</div>
                  )}
                </div>
              </div>

              <p className="text-gray-600 line-clamp-2">{course.shortDescription || course.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{course.rating.toFixed(1)}</span>
                  <span>({course.totalRatings})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.totalStudents.toLocaleString()} enrolled</span>
                </div>
                <Badge variant="outline">{course.level}</Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-wrap gap-2">
                  {course.learningObjectives.slice(0, 3).map((objective, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {objective}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/courses/${course.slug}`}>View Details</Link>
                  </Button>
                  <Button size="sm">Enroll Now</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={course.thumbnailUrl || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {course.videoUrl && (
            <Button size="sm" variant="secondary" className="gap-2">
              <Play className="h-4 w-4" />
              Preview
            </Button>
          )}
        </div>
        <Badge className="absolute top-3 left-3 bg-primary">{course.category.name}</Badge>
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="secondary">{course.level}</Badge>
          {course.isFeatured && (
            <Badge variant="default">Featured</Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
              <Link href={`/courses/${course.slug}`}>{course.title}</Link>
            </h3>
            <p className="text-sm text-gray-600">by {course.instructorName}</p>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">{course.shortDescription || course.description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium">{course.rating.toFixed(1)}</span>
              <span>({course.totalRatings})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}h</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{course.totalStudents.toLocaleString()} students enrolled</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {course.learningObjectives.slice(0, 2).map((objective, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {objective}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <span className="text-2xl font-bold text-primary">{currencySymbol}{displayPrice}</span>
              {course.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">{currencySymbol}{displayOriginalPrice}</span>
              )}
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Enroll Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
