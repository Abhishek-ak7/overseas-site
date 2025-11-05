"use client"

import { useState, useEffect } from "react"
import { Shield, Users, Award, Clock, Globe, HeartHandshake, Star, Zap, Target, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Feature {
  id: string
  title: string
  description: string
  icon?: string
  iconType: string
  iconColor: string
  backgroundColor: string
  ctaText?: string
  ctaLink?: string
  orderIndex: number
  isActive: boolean
  isFeatured: boolean
  category?: string
}

// Icon mapping for Lucide icons
const iconMap: { [key: string]: any } = {
  Shield,
  Users,
  Award,
  Clock,
  Globe,
  HeartHandshake,
  Star,
  Zap,
  Target,
  CheckCircle,
}

export function WhyChooseUsSection() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/features?category=why-choose-us')
      const data = await response.json()
      setFeatures(data.features || [])
    } catch (error) {
      console.error('Failed to fetch features:', error)
      // Fallback to default features if API fails
      setFeatures([
        {
          id: 'default-1',
          title: "On-Ground & Cloud Counselling",
          description: "Get personalized guidance from our expert counselors both in-person and online to meet your specific needs.",
          icon: "Shield",
          iconType: "lucide",
          iconColor: "#EF4444",
          backgroundColor: "#FFFFFF",
          orderIndex: 0,
          isActive: true,
          isFeatured: true,
          category: "why-choose-us"
        },
        {
          id: 'default-2',
          title: "AI-Powered Program Selection",
          description: "Our advanced AI system matches you with programs that best fit your interests and career goals.",
          icon: "Users",
          iconType: "lucide",
          iconColor: "#EF4444",
          backgroundColor: "#FFFFFF",
          orderIndex: 1,
          isActive: true,
          isFeatured: true,
          category: "why-choose-us"
        },
        {
          id: 'default-3',
          title: "Express Admissions Services",
          description: "Fast-track your application process with our streamlined admissions services and expert guidance.",
          icon: "Award",
          iconType: "lucide",
          iconColor: "#EF4444",
          backgroundColor: "#FFFFFF",
          orderIndex: 2,
          isActive: true,
          isFeatured: true,
          category: "why-choose-us"
        },
        {
          id: 'default-4',
          title: "Scholarship Guidance",
          description: "Maximize your funding opportunities with our comprehensive scholarship search and application support.",
          icon: "Clock",
          iconType: "lucide",
          iconColor: "#EF4444",
          backgroundColor: "#FFFFFF",
          orderIndex: 3,
          isActive: true,
          isFeatured: true,
          category: "why-choose-us"
        },
        {
          id: 'default-5',
          title: "Education Loan Assistance",
          description: "Get help securing education loans with our dedicated financial advisors and banking partners.",
          icon: "Globe",
          iconType: "lucide",
          iconColor: "#EF4444",
          backgroundColor: "#FFFFFF",
          orderIndex: 4,
          isActive: true,
          isFeatured: true,
          category: "why-choose-us"
        },
        {
          id: 'default-6',
          title: "Pre-departure Session",
          description: "Comprehensive pre-departure orientation covering visa, travel, accommodation, and cultural preparation.",
          icon: "HeartHandshake",
          iconType: "lucide",
          iconColor: "#EF4444",
          backgroundColor: "#FFFFFF",
          orderIndex: 5,
          isActive: true,
          isFeatured: true,
          category: "why-choose-us"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-full max-w-3xl mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-50 rounded-lg p-8 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold mb-2">Why Choose Us</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Among the Largest and Trusted Study Abroad Consultants
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            With decades of experience and thousands of successful placements, we provide comprehensive support for your
            international education journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature) => {
            // Get the icon component from the icon map
            const IconComponent = feature.icon && iconMap[feature.icon] ? iconMap[feature.icon] : Shield

            return (
              <div key={feature.id} className="text-center group">
                <div
                  className="rounded-lg p-8 hover:bg-gray-100 transition-colors"
                  style={{ backgroundColor: feature.backgroundColor }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                    <IconComponent
                      className="h-8 w-8"
                      style={{ color: feature.iconColor }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  {feature.ctaText && feature.ctaLink && (
                    <Button
                      variant="link"
                      className="text-primary mt-4 p-0 h-auto font-semibold"
                      onClick={() => window.location.href = feature.ctaLink!}
                    >
                      {feature.ctaText} →
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {features.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No features available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}
