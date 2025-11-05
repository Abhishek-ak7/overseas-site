import { BookOpen, Users, Award, Clock } from "lucide-react"

const stats = [
  {
    icon: BookOpen,
    value: "500+",
    label: "Courses Available",
    description: "Comprehensive course library",
  },
  {
    icon: Users,
    value: "50,000+",
    label: "Students Enrolled",
    description: "Active learners worldwide",
  },
  {
    icon: Award,
    value: "95%",
    label: "Success Rate",
    description: "Student achievement rate",
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Learning Support",
    description: "Round-the-clock assistance",
  },
]

export function CourseStats() {
  return (
    <section className="py-12 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
