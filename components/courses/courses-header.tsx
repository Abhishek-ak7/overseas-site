import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function CoursesHeader() {
  return (
    <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Discover comprehensive courses designed to prepare you for international education success
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search courses, universities, or programs..."
              className="pl-12 pr-4 py-3 text-lg bg-white text-gray-900 border-0 rounded-lg"
            />
            <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90">Search</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
