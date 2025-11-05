"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, GraduationCap, FileText, Users, BookOpen, Plane, Heart, Award, Briefcase } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Service {
  id: string
  title: string
  description: string
  icon?: string
  icon_type: string
  icon_color: string
  background_color: string
  cta_text?: string
  cta_link?: string
  order_index: number
  is_active: boolean
  is_featured: boolean
  category?: string
}


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
        setServices(data.services || [])
      } else {
        console.warn('No services data received from API')
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
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
    .filter(service => service.is_active)
    .sort((a, b) => a.order_index - b.order_index)

  const featuredServices = activeServices.filter(service => service.is_featured).slice(0, 4)
  const otherServices = activeServices.filter(service => !service.is_featured).slice(0, 2)

  if (activeServices.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Our Expert Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            End-to-end support services designed to make your study abroad journey seamless and successful.
            We're with you at every step of your international education adventure.
          </p>
        </div>

        {/* Featured Services */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {featuredServices.map((service) => {
            const IconComponent = IconMap[service.icon as keyof typeof IconMap] || GraduationCap

            return (
              <div
                key={service.id}
                className="group bg-white hover:bg-white rounded-2xl p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-primary/20 hover:-translate-y-2"
              >
                {/* Icon */}
                <div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 transition-colors"
                  style={{ backgroundColor: service.background_color }}
                >
                  <IconComponent className="w-7 h-7" style={{ color: service.icon_color }} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* CTA */}
                <button 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent hover:bg-primary text-gray-700 hover:text-white border border-gray-200 hover:border-primary rounded-lg transition-all duration-300 font-medium group-hover:shadow-md"
                  onClick={() => window.location.href = service.cta_link || '/services'}
                >
                  <span>{service.cta_text || 'Learn More'}</span>
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
                  <div 
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 transition-colors"
                    style={{ backgroundColor: service.background_color }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: service.icon_color }} />
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
                      onClick={() => window.location.href = service.cta_link || '/services'}
                    >
                      <span>{service.cta_text || 'Learn More'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Need Personalized Assistance?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Our expert consultants are ready to create a customized plan tailored to your unique goals and circumstances.
            Start your journey with a free consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/appointments">
            <button className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-sm hover:shadow-md">
              Book Free Consultation
            </button>
            </Link>
            <Link href="/services">
            <button className="flex-1 px-6 py-4 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm">
              View All Services
            </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}