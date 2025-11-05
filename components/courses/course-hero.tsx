import { Badge } from "@/components/ui/badge"
import { Star, Clock, Users, Globe, Calendar } from "lucide-react"

interface CourseHeroProps {
  course: any // In real app, this would be properly typed
}

export function CourseHero({ course }: CourseHeroProps) {
  return (
    <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <Badge className="bg-primary">{course.category}</Badge>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{course.title}</h1>
              <p className="text-xl text-gray-300 leading-relaxed">{course.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{course.rating}</span>
                <span className="text-gray-300">({course.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span>{course.enrolled.toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-400" />
                <span>{course.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>Updated {course.lastUpdated}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={course.instructor.image || "/placeholder.svg"}
                alt={course.instructor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">Created by {course.instructor.name}</p>
                <p className="text-sm text-gray-300">{course.instructor.bio}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="relative">
              <img
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg shadow-xl"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
