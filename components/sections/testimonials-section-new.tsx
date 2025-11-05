"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Testimonial {
  id: string
  name: string
  designation: string
  company?: string
  country: string
  university?: string
  course?: string
  rating: number
  testimonial: string
  avatarUrl?: string
  isActive: boolean
  isFeatured: boolean
  orderIndex: number
  videoUrl?: string
  date?: string
  location?: string
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    designation: 'Masters Student',
    university: 'University of Toronto',
    country: 'Canada',
    course: 'Computer Science',
    rating: 5,
    testimonial: "BN Overseas made my dream of studying in Canada a reality. Their expert guidance and support throughout the application process was exceptional. I couldn't have done it without them!",
    avatarUrl: '/young-woman-professional-headshot.png',
    isActive: true,
    isFeatured: true,
    orderIndex: 0,
    location: 'Toronto, Canada'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    designation: 'PhD Candidate',
    university: 'Stanford University',
    country: 'USA',
    course: 'Engineering',
    rating: 5,
    testimonial: "The team at BN Overseas provided incredible support during my PhD application process. Their attention to detail and personalized approach helped me secure admission to my dream university.",
    avatarUrl: '/young-man-professional-headshot.png',
    isActive: true,
    isFeatured: true,
    orderIndex: 1,
    location: 'California, USA'
  },
  {
    id: '3',
    name: 'Emily Chen',
    designation: 'MBA Graduate',
    university: 'Oxford University',
    country: 'UK',
    course: 'Business Administration',
    rating: 5,
    testimonial: "From university selection to visa approval, BN Overseas handled everything professionally. Their expertise in UK admissions was invaluable. Highly recommended!",
    avatarUrl: '/professional-headshot-of-young-asian-woman.jpg',
    isActive: true,
    isFeatured: true,
    orderIndex: 2,
    location: 'Oxford, UK'
  },
  {
    id: '4',
    name: 'David Miller',
    designation: 'Masters Student',
    university: 'University of Melbourne',
    country: 'Australia',
    course: 'Environmental Science',
    rating: 5,
    testimonial: "Studying in Australia seemed impossible until I met the BN Overseas team. They guided me through every step and made the entire process seamless and stress-free.",
    avatarUrl: '/young-man-glasses-headshot.png',
    isActive: true,
    isFeatured: true,
    orderIndex: 3,
    location: 'Melbourne, Australia'
  },
  {
    id: '5',
    name: 'Priya Sharma',
    designation: 'Undergraduate Student',
    university: 'University of British Columbia',
    country: 'Canada',
    course: 'Medicine',
    rating: 5,
    testimonial: "Thanks to BN Overseas, I'm now pursuing my medical degree at UBC. Their scholarship assistance helped me secure funding, and their counselors were always available for support.",
    isActive: true,
    isFeatured: false,
    orderIndex: 4,
    location: 'Vancouver, Canada'
  },
  {
    id: '6',
    name: 'James Wilson',
    designation: 'Research Student',
    university: 'Cambridge University',
    country: 'UK',
    course: 'Physics',
    rating: 5,
    testimonial: "The personalized approach of BN Overseas is what sets them apart. They understood my research interests and helped me find the perfect supervisor and program at Cambridge.",
    isActive: true,
    isFeatured: false,
    orderIndex: 5,
    location: 'Cambridge, UK'
  }
]

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials')
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data.testimonials || defaultTestimonials)
      } else {
        setTestimonials(defaultTestimonials)
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
      setTestimonials(defaultTestimonials)
    } finally {
      setLoading(false)
    }
  }

  const activeTestimonials = testimonials
    .filter(testimonial => testimonial.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(activeTestimonials.length / 3))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(activeTestimonials.length / 3)) % Math.ceil(activeTestimonials.length / 3))
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
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (activeTestimonials.length === 0) {
    return null
  }

  const testimonialsPerSlide = 3
  const totalSlides = Math.ceil(activeTestimonials.length / testimonialsPerSlide)
  const currentTestimonials = activeTestimonials.slice(
    currentSlide * testimonialsPerSlide,
    (currentSlide + 1) * testimonialsPerSlide
  )

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Student Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Hear from our successful students who achieved their 
            study abroad dreams with our expert guidance and support.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[400px]">
            {currentTestimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative"
              >
                {/* Quote Icon */}
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Quote className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4 pt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.testimonial}"
                </blockquote>

                {/* Student Info */}
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {testimonial.avatarUrl ? (
                      <Image
                        src={testimonial.avatarUrl}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {testimonial.course && `${testimonial.course} • `}{testimonial.designation}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {testimonial.university && `${testimonial.university}, `}{testimonial.country}
                    </p>
                  </div>
                </div>

                {/* Location Badge */}
                {testimonial.location && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {testimonial.location}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center mt-8 gap-4">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {[...Array(totalSlides)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-primary w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Success Story?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of successful students who achieved their study abroad dreams with our expert guidance. 
              Your journey to international education starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/appointments">
              <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                Start Your Journey
              </button>
              </Link>
              <Link href="/contact">
              <button className="px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all font-semibold">
                Read More Stories
              </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}