"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import * as LucideIcons from "lucide-react"

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

export function WhyBNOverseasSection() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/features?featured=true')
      const data = await response.json()
      setFeatures(data.features || [])
    } catch (error) {
      console.error('Failed to fetch features:', error)
      // Fallback to default features
      setFeatures([
        {
          id: 'default-1',
          title: 'On-Ground & Cloud Counselling',
          description: 'Enjoy in-person counselling at our offices or meet our experts virtually.',
          icon: 'Users',
          iconType: 'lucide',
          iconColor: '#EF4444',
          backgroundColor: '#FFFFFF',
          ctaText: 'Learn More',
          ctaLink: '/services/counselling',
          orderIndex: 0,
          isActive: true,
          isFeatured: true
        },
        {
          id: 'default-2',
          title: 'AI-Powered Program Selection',
          description: 'Receive customised AI recommendations to match with programs that best fit your interests and career goals.',
          icon: 'Lightbulb',
          iconType: 'lucide',
          iconColor: '#EF4444',
          backgroundColor: '#FFFFFF',
          ctaText: 'Learn More',
          ctaLink: '/services/program-selection',
          orderIndex: 1,
          isActive: true,
          isFeatured: true
        },
        {
          id: 'default-3',
          title: 'Express Admissions Services',
          description: 'Get express response from your dream university and secure admission within seconds!',
          icon: 'Zap',
          iconType: 'lucide',
          iconColor: '#EF4444',
          backgroundColor: '#FFFFFF',
          ctaText: 'Learn More',
          ctaLink: '/services/admissions',
          orderIndex: 2,
          isActive: true,
          isFeatured: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return LucideIcons.Star
    const Icon = (LucideIcons as any)[iconName]
    return Icon || LucideIcons.Star
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Why BNOverseas?</h2>
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Amongst the Largest and Trusted Study Abroad Consultants
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = getIconComponent(feature.icon)
            return (
              <div
                key={feature.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                style={{ backgroundColor: feature.backgroundColor }}
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent
                    className="w-6 h-6"
                    style={{ color: feature.iconColor }}
                  />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                {feature.ctaText && (
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 p-0 h-auto font-medium"
                    onClick={() => feature.ctaLink && (window.location.href = feature.ctaLink)}
                  >
                    {feature.ctaText} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
