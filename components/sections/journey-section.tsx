"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Search, BarChart3, User, FileText, Plane, Building, DollarSign, Shield, Home, CheckCircle, Clock, Users, Award } from "lucide-react"

interface JourneyStep {
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
  duration?: string
}

const IconMap = {
  Search,
  BarChart3,
  User,
  FileText,
  Plane,
  Building,
  DollarSign,
  Shield,
  Home,
  CheckCircle,
  Clock,
  Users,
  Award
}


export function JourneySection() {
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJourneySteps()
  }, [])

  const fetchJourneySteps = async () => {
    try {
      const response = await fetch('/api/journey-steps')
      if (response.ok) {
        const data = await response.json()
        setJourneySteps(data.journeySteps || [])
      } else {
        console.warn('No journey steps data received from API')
      }
    } catch (error) {
      console.error('Failed to fetch journey steps:', error)
    } finally {
      setLoading(false)
    }
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
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
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

  const activeSteps = journeySteps
    .filter(step => step.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const featuredSteps = activeSteps.filter(step => step.isFeatured)
  const otherSteps = activeSteps.filter(step => !step.isFeatured)

  if (activeSteps.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Your Study Abroad Journey Made Simple
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From initial consultation to post-arrival support, we guide you through every step
            of your international education journey with expert care and personalized attention.
          </p>
        </div>

        {/* Featured Steps - Main Process */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Core Application Process
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSteps.map((step, index) => {
              const IconComponent = IconMap[step.icon as keyof typeof IconMap] || CheckCircle

              return (
                <div
                  key={step.id}
                  className="group bg-gray-50 hover:bg-white rounded-2xl p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-primary/20 relative hover:-translate-y-2"
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  {/* Icon & Duration */}
                  <div className="flex items-start justify-between mb-6">
                    <div 
                      className="inline-flex items-center justify-center w-14 h-14 rounded-xl transition-colors"
                      style={{ backgroundColor: `${step.iconColor}20` }}
                    >
                      <IconComponent 
                        className="w-7 h-7" 
                        style={{ color: step.iconColor }}
                      />
                    </div>
                    
                    {step.duration && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{step.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {step.title}
                  </h4>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* CTA */}
                  <button 
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                    onClick={() => step.ctaLink && (window.location.href = step.ctaLink)}
                  >
                    <span>{step.ctaText || 'Learn More'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Additional Support Services */}
        {otherSteps.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Additional Support Services
            </h3>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {otherSteps.map((step) => {
                const IconComponent = IconMap[step.icon as keyof typeof IconMap] || CheckCircle
                
                return (
                  <div 
                    key={step.id}
                    className="group bg-white hover:bg-primary/5 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-primary/20 flex items-start gap-4"
                  >
                    {/* Icon */}
                    <div 
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 transition-colors"
                      style={{ backgroundColor: `${step.iconColor}20` }}
                    >
                      <IconComponent 
                        className="w-6 h-6" 
                        style={{ color: step.iconColor }}
                      />
                    </div>

                    <div className="flex-1">
                      {/* Title & Duration */}
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                          {step.title}
                        </h4>
                        {step.duration && (
                          <span className="text-xs text-gray-500 ml-2">
                            {step.duration}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {step.description}
                      </p>

                      {/* CTA */}
                      <button 
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        onClick={() => step.ctaLink && (window.location.href = step.ctaLink)}
                      >
                        <span>{step.ctaText || 'Learn More'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 lg:p-12 border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6">
            <Plane className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Journey?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Take the first step towards your international education. Our expert counselors
            are here to guide you through every stage of your study abroad journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-sm hover:shadow-md">
              Book Free Consultation
            </button>
            <button className="flex-1 px-6 py-4 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm">
              Download Journey Guide
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}