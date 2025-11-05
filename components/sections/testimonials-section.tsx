"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"
import Image from "next/image"

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


export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials?featured=true&limit=6')
      if (response.ok) {
        const data = await response.json()
        // Transform API data to match component interface
        const transformedTestimonials = data.testimonials?.map((testimonial: any) => ({
          id: testimonial.id,
          name: testimonial.student_name,
          designation: 'Student', // Default designation
          company: testimonial.company,
          country: testimonial.country,
          university: testimonial.university,
          course: testimonial.program,
          rating: testimonial.rating,
          testimonial: testimonial.content,
          avatarUrl: testimonial.image_url,
          isActive: testimonial.is_published,
          isFeatured: testimonial.is_featured,
          orderIndex: testimonial.position || 0,
          videoUrl: testimonial.video_url,
          location: testimonial.university && testimonial.country ? `${testimonial.university}, ${testimonial.country}` : testimonial.country
        })) || []
        setTestimonials(transformedTestimonials)
      } else {
        console.warn('No testimonials data received from API')
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl mb-6">
            <Quote className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Student Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. Hear from our successful students who achieved their
            study abroad dreams with our expert guidance and support.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
            {currentTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary/20 relative hover:-translate-y-2"
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
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 lg:p-12 border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6">
              <Star className="w-8 h-8 text-primary fill-current" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Your Success Story?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of successful students who achieved their study abroad dreams with our expert guidance.
              Your journey to international education starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-sm hover:shadow-md">
                Start Your Journey
              </button>
              <button className="flex-1 px-6 py-4 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm">
                Read More Stories
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}