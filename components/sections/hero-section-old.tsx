"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Phone } from "lucide-react"
import Image from "next/image"

interface HeroSlide {
  id: string
  title: string
  subtitle?: string
  description?: string
  ctaText?: string
  ctaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  backgroundImage?: string
  backgroundVideo?: string
  textColor: string
  overlayColor?: string
  overlayOpacity: number
  orderIndex: number
  isActive: boolean
  displayDuration: number
  animationType: string
  mobileImage?: string
}

export function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeroSlides()
  }, [])

  useEffect(() => {
    if (slides.length > 0) {
      const currentSlideDuration = slides[currentSlide]?.displayDuration || 8000
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, currentSlideDuration)
      return () => clearInterval(timer)
    }
  }, [slides, currentSlide])

  const fetchHeroSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides')
      const data = await response.json()
      setSlides(data.heroSlides || [])
    } catch (error) {
      console.error('Failed to fetch hero slides:', error)
      // Fallback to default slides if API fails
      setSlides([
        {
          id: 'default-1',
          title: 'Your Trusted Partner for Study Abroad Success',
          subtitle: 'Realize Your Global Education Dreams',
          description: 'With our comprehensive services and expert guidance, we help students gain admission to top international universities worldwide. Start your journey to a global career today.',
          ctaText: 'Get Free Counselling',
          ctaLink: '/contact',
          secondaryCtaText: 'Check Eligibility',
          secondaryCtaLink: '/eligibility',
          backgroundImage: '/study-abroad-hero.jpg',
          textColor: '#FFFFFF',
          overlayOpacity: 0.3,
          orderIndex: 0,
          isActive: true,
          displayDuration: 5000,
          animationType: 'fade'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  if (loading) {
    return (
      <section className="relative bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center min-h-[600px] lg:min-h-[700px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  if (slides.length === 0) {
    return (
      <section className="relative bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center min-h-[600px] lg:min-h-[700px]">
            <div className="text-center max-w-2xl">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Your Journey to Global Success Starts Here
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Expert guidance for your international education dreams
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4">
                  Get Free Counselling
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-4">
                  Check Eligibility
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const slide = slides[currentSlide]

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {slide.backgroundImage && (
          <div className="relative w-full h-full">
            <Image
              src={slide.backgroundImage}
              alt={slide.title}
              fill
              className="object-cover"
              priority
            />
            {slide.overlayColor && (
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: slide.overlayColor,
                  opacity: slide.overlayOpacity
                }}
              />
            )}
          </div>
        )}
        {!slide.backgroundImage && (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        <div className="min-h-[600px] lg:min-h-[700px] flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 w-full items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {slide.subtitle && (
                <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  {slide.subtitle}
                </div>
              )}
              
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                style={{ color: slide.textColor }}
              >
                {slide.title}
              </h1>
              
              {slide.description && (
                <p 
                  className="text-lg lg:text-xl mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                  style={{ color: slide.textColor === '#FFFFFF' ? '#F3F4F6' : '#6B7280' }}
                >
                  {slide.description}
                </p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {slide.ctaText && slide.ctaLink && (
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 h-auto"
                    onClick={() => window.location.href = slide.ctaLink!}
                  >
                    {slide.ctaText}
                  </Button>
                )}
                
                {/* {slide.secondaryCtaText && slide.secondaryCtaLink && (
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 h-auto"
                    onClick={() => window.location.href = slide.secondaryCtaLink!}
                  >
                    {slide.secondaryCtaText}
                  </Button>
                )} */}
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-8 border-t border-gray-200/20">
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span style={{ color: slide.textColor === '#FFFFFF' ? '#E5E7EB' : '#6B7280' }}>
                      29+ Years Experience
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span style={{ color: slide.textColor === '#FFFFFF' ? '#E5E7EB' : '#6B7280' }}>
                      1000+ Universities
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span style={{ color: slide.textColor === '#FFFFFF' ? '#E5E7EB' : '#6B7280' }}>
                      50,000+ Students Guided
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Content (could be form, image, or video) */}
            <div className="order-1 lg:order-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Get Free Counselling
                  </h3>
                  <p className="text-gray-600">
                    Let our experts guide your study abroad journey
                  </p>
                </div>

                <form className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option>Select Study Destination</option>
                      <option>Canada</option>
                      <option>USA</option>
                      <option>UK</option>
                      <option>Australia</option>
                      <option>Germany</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3">
                    Get Free Counselling
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>Call Now</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>Virtual Meeting</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      {slides.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-900 w-12 h-12 rounded-full shadow-lg"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-900 w-12 h-12 rounded-full shadow-lg"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-white'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
              )}
    </section>
  )
}
      </div>
    </section>
  )
}
