"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, GraduationCap, FileText, Users, BookOpen, Plane, Heart, Award, Briefcase } from "lucide-react"
import Image from "next/image"

interface Service {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  iconUrl?: string
  imageUrl?: string
  icon?: string
  isActive: boolean
  isFeatured: boolean
  orderIndex: number
  features: string[]
  benefits: string[]
  price?: string
  duration?: string
  category?: string
  requirements?: string[]
}

const defaultServices = [
  {
    id: 'admission-guidance',
    title: 'Admission Guidance',
    slug: 'admission-guidance',
    description: 'Complete guidance for university admissions including application preparation, document review, and submission assistance.',
    shortDescription: 'End-to-end university admission support',
    isActive: true,
    isFeatured: true,
    orderIndex: 0,
    features: ['University Selection', 'Application Review', 'Document Preparation', 'Submission Support'],
    benefits: ['Higher Acceptance Rate', 'Expert Guidance', 'Time Saving'],
    category: 'Academic',
    icon: 'GraduationCap'
  },
  {
    id: 'visa-assistance',
    title: 'Visa Assistance',
    slug: 'visa-assistance',
    description: 'Professional visa application services including documentation, interview preparation, and application tracking.',
    shortDescription: 'Hassle-free visa application support',
    isActive: true,
    isFeatured: true,
    orderIndex: 1,
    features: ['Document Checklist', 'Application Filling', 'Interview Prep', 'Status Tracking'],
    benefits: ['High Success Rate', 'Expert Review', 'Peace of Mind'],
    category: 'Legal',
    icon: 'FileText'
  },
  {
    id: 'test-preparation',
    title: 'Test Preparation',
    slug: 'test-preparation',
    description: 'Comprehensive test prep for IELTS, TOEFL, GRE, GMAT, and other standardized tests.',
    shortDescription: 'Score higher with expert test preparation',
    isActive: true,
    isFeatured: true,
    orderIndex: 2,
    features: ['Practice Tests', 'Study Material', 'Expert Tutoring', 'Score Analysis'],
    benefits: ['Higher Scores', 'Proven Methods', 'Flexible Timing'],
    category: 'Academic',
    icon: 'BookOpen'
  },
  {
    id: 'career-counseling',
    title: 'Career Counseling',
    slug: 'career-counseling',
    description: 'Personalized career guidance to help you choose the right path and achieve your professional goals.',
    shortDescription: 'Expert guidance for your career journey',
    isActive: true,
    isFeatured: true,
    orderIndex: 3,
    features: ['Career Assessment', 'Goal Setting', 'Industry Insights', 'Skill Development'],
    benefits: ['Clear Direction', 'Industry Knowledge', 'Personal Growth'],
    category: 'Career',
    icon: 'Briefcase'
  },
  {
    id: 'accommodation-support',
    title: 'Accommodation Support',
    slug: 'accommodation-support',
    description: 'Find safe and comfortable housing options near your university with our accommodation services.',
    shortDescription: 'Safe and comfortable housing solutions',
    isActive: true,
    isFeatured: false,
    orderIndex: 4,
    features: ['Housing Search', 'Safety Verification', 'Booking Assistance', 'Local Support'],
    benefits: ['Safe Housing', 'Convenience', 'Local Expertise'],
    category: 'Lifestyle',
    icon: 'Heart'
  },
  {
    id: 'scholarship-assistance',
    title: 'Scholarship Assistance',
    slug: 'scholarship-assistance',
    description: 'Maximize your funding opportunities with our scholarship search and application assistance.',
    shortDescription: 'Unlock funding opportunities',
    isActive: true,
    isFeatured: false,
    orderIndex: 5,
    features: ['Scholarship Search', 'Application Assistance', 'Essay Review', 'Deadline Tracking'],
    benefits: ['Financial Relief', 'Expert Support', 'Higher Success'],
    category: 'Financial',
    icon: 'Award'
  }
]

const IconMap = {
  GraduationCap,
  FileText,
  BookOpen,
  Briefcase,
  Heart,
  Award,
  MapPin,
  Users,
  Plane
}

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || defaultServices)
      } else {
        setServices(defaultServices)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      setServices(defaultServices)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const activeServices = services
    .filter(service => service.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const featuredServices = activeServices.filter(service => service.isFeatured).slice(0, 4)
  const otherServices = activeServices.filter(service => !service.isFeatured).slice(0, 2)

  if (activeServices.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Expert Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive support services designed to make your study abroad journey smooth and successful. 
            From admission guidance to career counseling, we're with you every step of the way.
          </p>
        </div>

        {/* Featured Services */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {featuredServices.map((service) => {
            const IconComponent = IconMap[service.icon as keyof typeof IconMap] || GraduationCap
            
            return (
              <div 
                key={service.id}
                className="group bg-gray-50 hover:bg-white rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-gray-200"
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 group-hover:bg-primary/20 rounded-xl mb-6 transition-colors">
                  <IconComponent className="w-7 h-7 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {service.shortDescription}
                </p>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA */}
                <button 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent hover:bg-primary text-gray-700 hover:text-white border border-gray-200 hover:border-primary rounded-lg transition-all duration-300 font-medium group-hover:shadow-md"
                  onClick={() => window.location.href = `/services/${service.slug}`}
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Other Services */}
        {otherServices.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
            {otherServices.map((service) => {
              const IconComponent = IconMap[service.icon as keyof typeof IconMap] || GraduationCap
              
              return (
                <div 
                  key={service.id}
                  className="group bg-gray-50 hover:bg-white rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-gray-200 flex items-start gap-6"
                >
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex-shrink-0 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex-1">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {service.description}
                    </p>

                    {/* CTA */}
                    <button 
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                      onClick={() => window.location.href = `/services/${service.slug}`}
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center bg-primary/5 rounded-2xl p-8 lg:p-12">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Need Personalized Assistance?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our expert consultants are ready to create a customized plan tailored to your unique goals and circumstances. 
            Book a free consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
              Book Free Consultation
            </button>
            <button className="px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all font-semibold">
              View All Services
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}