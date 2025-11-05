"use client"

import { useState, useEffect } from "react"
import { Star, Globe, GraduationCap, Award, Building2 } from "lucide-react"
import Image from "next/image"

interface Partner {
  id: string
  name: string
  logoUrl?: string
  websiteUrl?: string
  country?: string
  partnerType: string
  description?: string
  ranking?: number
  establishedYear?: number
  studentCount?: number
  coursesOffered: string[]
  isActive: boolean
  isFeatured: boolean
  isPreferred: boolean
  orderIndex: number
}


export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [statistics, setStatistics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPartners()
    fetchStatistics()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners?featured=true&limit=12')
      if (response.ok) {
        const data = await response.json()
        // Transform API data to match component interface
        const transformedPartners = data.partners?.map((partner: any) => ({
          id: partner.id,
          name: partner.name,
          logoUrl: partner.logo_url,
          websiteUrl: partner.website_url,
          country: partner.country,
          partnerType: partner.partner_type,
          description: partner.description,
          ranking: partner.ranking,
          establishedYear: partner.established_year,
          studentCount: partner.student_count,
          coursesOffered: partner.courses_offered || [],
          isActive: partner.is_active,
          isFeatured: partner.is_featured,
          isPreferred: partner.is_preferred,
          orderIndex: partner.order_index
        })) || []
        setPartners(transformedPartners)
      } else {
        console.warn('No partners data received from API')
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics?category=partners')
      if (response.ok) {
        const data = await response.json()
        setStatistics(data.statistics || [])
      } else {
        setStatistics([
          { label: 'University Partners', value: '1,200', suffix: '+', icon: 'GraduationCap' },
          { label: 'Countries', value: '30', suffix: '+', icon: 'Globe' },
          { label: 'Program Options', value: '25,000', suffix: '+', icon: 'Award' }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      setStatistics([
        { label: 'University Partners', value: '1,200', suffix: '+', icon: 'GraduationCap' },
        { label: 'Countries', value: '30', suffix: '+', icon: 'Globe' },
        { label: 'Program Options', value: '25,000', suffix: '+', icon: 'Award' }
      ])
    }
  }

  const IconMap = {
    GraduationCap,
    Globe,
    Award,
    Star
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
                <div className="h-12 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const activePartners = partners
    .filter(partner => partner.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const featuredPartners = activePartners.filter(p => p.isFeatured).slice(0, 8)
  const otherPartners = activePartners.filter(p => !p.isFeatured).slice(0, 8)
  const allDisplayPartners = [...featuredPartners, ...otherPartners].slice(0, 12)

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Our Global University Partners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We collaborate with world-renowned universities and colleges across the globe to provide you
            with access to the finest educational opportunities and programs.
          </p>
        </div>

        {/* Partners Grid */}
        {allDisplayPartners.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 lg:gap-8 mb-16">
            {allDisplayPartners.map((partner) => (
              <div
                key={partner.id}
                className="group bg-white hover:bg-white rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-primary/20 cursor-pointer hover:-translate-y-2"
                onClick={() => partner.websiteUrl && window.open(partner.websiteUrl, '_blank')}
                title={`${partner.name}${partner.country ? ` - ${partner.country}` : ''}${partner.ranking ? ` (Rank: ${partner.ranking})` : ''}`}
              >
                {/* Logo */}
                <div className="flex items-center justify-center h-16 mb-3">
                  {partner.logoUrl ? (
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      width={80}
                      height={64}
                      className="max-h-16 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-20 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </div>

                {/* University Name */}
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary transition-colors mb-1 line-clamp-2">
                    {partner.name}
                  </h4>
                  
                  {/* Country & Ranking */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    {partner.country && (
                      <span>{partner.country}</span>
                    )}
                    {partner.ranking && partner.country && (
                      <span>•</span>
                    )}
                    {partner.ranking && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        #{partner.ranking}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {statistics.length > 0 && (
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Global Education Network
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Connecting students with opportunities worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {statistics.slice(0, 3).map((stat, index) => {
                const IconComponent = IconMap[stat.icon as keyof typeof IconMap] || GraduationCap

                return (
                  <div key={index} className="group text-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 lg:p-8 transition-all duration-500 hover:shadow-lg border border-gray-100 hover:border-primary/20 hover:-translate-y-2">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>

                    {/* Number */}
                    <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
                      {stat.prefix || ''}{stat.value}{stat.suffix || ''}
                    </div>

                    {/* Label */}
                    <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <div className="text-center">
              <button className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-sm hover:shadow-md">
                Explore All Universities
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}