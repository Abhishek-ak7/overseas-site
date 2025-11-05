"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Users, Award, Globe, Clock, Heart, Shield, Star } from "lucide-react"
import Image from "next/image"

interface WhyChooseFeature {
  id: string
  title: string
  description: string
  icon: string
  isActive: boolean
  orderIndex: number
  stats?: {
    number: string
    label: string
  }
}


const IconMap = {
  Users,
  Award,
  Globe,
  Heart,
  Clock,
  Shield,
  CheckCircle,
  Star
}

export function WhyChooseSection() {
  const [features, setFeatures] = useState<WhyChooseFeature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/features?category=why-choose')
      if (response.ok) {
        const data = await response.json()
        // Transform API data to match component interface
        const transformedFeatures = data.features?.map((feature: any) => ({
          id: feature.id,
          title: feature.title,
          description: feature.description,
          icon: feature.icon || 'CheckCircle',
          isActive: feature.is_active,
          orderIndex: feature.order_index,
          stats: getDefaultStats(feature.title)
        })) || []
        setFeatures(transformedFeatures)
      } else {
        console.warn('No features data received from API')
      }
    } catch (error) {
      console.error('Failed to fetch why choose us features:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultStats = (title: string) => {
    const statsMap: { [key: string]: { number: string, label: string } } = {
      'Expert Counselors': { number: '50+', label: 'Expert Counselors' },
      'High Success Rate': { number: '98%', label: 'Visa Success Rate' },
      'Global University Network': { number: '1000+', label: 'Partner Universities' },
      'Personalized Support': { number: '24/7', label: 'Support Available' },
      'Fast Processing': { number: '15 Days', label: 'Average Processing' },
      'Secure & Reliable': { number: '100%', label: 'Data Security' }
    }
    return statsMap[title] || { number: '100%', label: 'Excellence' }
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

  const activeFeatures = features
    .filter(feature => feature.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  if (activeFeatures.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose BN Overseas?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            With years of experience and thousands of successful students, we've established ourselves
            as a trusted partner in your study abroad journey. Here's what sets us apart.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {activeFeatures.map((feature) => {
            const IconComponent = IconMap[feature.icon as keyof typeof IconMap] || CheckCircle

            return (
              <div
                key={feature.id}
                className="group bg-white rounded-2xl p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-primary/20 hover:-translate-y-2"
              >
                {/* Icon & Stats */}
                <div className="flex items-start justify-between mb-6">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 group-hover:bg-primary/20 rounded-xl transition-colors">
                    <IconComponent className="w-7 h-7 text-primary" />
                  </div>

                  {/* Stats */}
                  {feature.stats && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{feature.stats.number}</div>
                      <div className="text-xs text-gray-600 font-medium">{feature.stats.label}</div>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Ready to Begin Your Journey?
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Join thousands of successful students who trusted us with their dreams.
                Get personalized guidance from our expert counselors and take the first
                step towards your international education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <button className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-sm hover:shadow-md">
                  Get Free Consultation
                </button>
                <button className="flex-1 px-6 py-4 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm">
                  Download Brochure
                </button>
              </div>
            </div>

            {/* Right Content - Trust Indicators */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
                <div className="text-4xl font-bold text-primary mb-2">15+</div>
                <div className="text-gray-600 font-medium">Years Experience</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border border-gray-100">
                <div className="text-4xl font-bold text-primary mb-2">25K+</div>
                <div className="text-gray-600 font-medium">Students Placed</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border border-gray-100">
                <div className="text-4xl font-bold text-primary mb-2">30+</div>
                <div className="text-gray-600 font-medium">Countries</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-yellow-50 rounded-2xl border border-gray-100">
                <div className="text-4xl font-bold text-primary mb-2">4.9</div>
                <div className="text-gray-600 font-medium">Rating ⭐</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}