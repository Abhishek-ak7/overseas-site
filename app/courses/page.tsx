import { CoursesHeader } from "@/components/courses/courses-header"
import { CourseFilters } from "@/components/courses/course-filters"
import { CourseGrid } from "@/components/courses/course-grid"
import { CourseStats } from "@/components/courses/course-stats"

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CoursesHeader />
      <CourseStats />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <CourseFilters />
          </div>
          <div className="lg:col-span-3">
            <CourseGrid />
          </div>
        </div>
      </div>
    </div>
  )
}
