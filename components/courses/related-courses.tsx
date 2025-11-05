import { CourseCard } from "./course-card"

// Mock related courses data
const relatedCourses = [
  {
    id: 2,
    title: "TOEFL iBT Mastery Program",
    instructor: "Prof. Michael Chen",
    rating: 4.9,
    reviewCount: 987,
    price: 349,
    originalPrice: 449,
    duration: "10 weeks",
    level: "Intermediate",
    category: "Test Preparation",
    image: "/course-toefl.jpg",
    description: "Master the TOEFL iBT with proven strategies and extensive practice materials.",
    features: ["Interactive Lessons", "Mock Tests", "Score Prediction", "Study Plan"],
    enrolled: 3210,
  },
  {
    id: 3,
    title: "GRE Quantitative Reasoning",
    instructor: "Dr. Emily Rodriguez",
    rating: 4.7,
    reviewCount: 756,
    price: 199,
    originalPrice: 299,
    duration: "6 weeks",
    level: "Advanced",
    category: "Test Preparation",
    image: "/course-gre.jpg",
    description: "Excel in GRE Quantitative section with advanced problem-solving techniques.",
    features: ["Video Lectures", "Practice Problems", "Progress Tracking", "Expert Support"],
    enrolled: 2890,
  },
  {
    id: 4,
    title: "Academic Writing for International Students",
    instructor: "Prof. James Wilson",
    rating: 4.6,
    reviewCount: 543,
    price: 149,
    originalPrice: 199,
    duration: "4 weeks",
    level: "Beginner",
    category: "Academic Skills",
    image: "/course-writing.jpg",
    description: "Develop essential academic writing skills for university success.",
    features: ["Writing Templates", "Peer Review", "Grammar Check", "Plagiarism Guide"],
    enrolled: 1567,
  },
]

export function RelatedCourses() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Related Courses</h2>
          <p className="text-lg text-gray-600">Explore more courses that might interest you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedCourses.map((course) => (
            <CourseCard key={course.id} course={course} viewMode="grid" />
          ))}
        </div>
      </div>
    </section>
  )
}
