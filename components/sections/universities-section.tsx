"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Users, Star, GraduationCap, ArrowRight, Globe, Award } from 'lucide-react'

interface University {
  id: string
  name: string
  slug: string
  country: string
  city: string
  state?: string
  logo_url?: string
  banner_url?: string
  description?: string
  type?: string
  established_year?: number
  ranking_national?: number
  ranking_world?: number
  student_count?: number
  international_students?: number
  acceptance_rate?: number
  avg_tuition_fee?: string
  currency: string
  is_featured: boolean
  _count: {
    programs: number
  }
}

export function UniversitiesSection() {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/universities?limit=6&featured=true')
      const data = await response.json()
      setUniversities(data.universities || [])
    } catch (error) {
      console.error('Failed to fetch universities:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  if (universities.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Top Universities
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Partner Universities Worldwide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with prestigious universities offering world-class education and countless opportunities
          </p>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {universities.map((university) => (
            <Link key={university.id} href={`/universities/${university.slug}`}>
              <Card className="group h-full hover:shadow-2xl transition-all duration-300 border-gray-200 overflow-hidden">
                {/* University Banner */}
                <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                  {university.banner_url ? (
                    <Image
                      src={university.banner_url}
                      alt={university.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-primary/30" />
                    </div>
                  )}

                  {/* Featured Badge */}
                  {university.is_featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* University Logo */}
                  <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
                      {university.logo_url ? (
                        <Image
                          src={university.logo_url}
                          alt={university.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="pt-14 pb-6 px-6">
                  {/* University Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {university.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="truncate">
                      {university.city}, {university.country}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
                    {/* Programs Count */}
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{university._count.programs}</div>
                      <div className="text-xs text-gray-600">Programs</div>
                    </div>

                    {/* Ranking or Students */}
                    {university.ranking_world ? (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="text-lg font-bold text-gray-900">#{university.ranking_world}</div>
                        <div className="text-xs text-gray-600">World Rank</div>
                      </div>
                    ) : university.student_count ? (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {university.student_count >= 1000
                            ? `${(university.student_count / 1000).toFixed(1)}K`
                            : university.student_count}
                        </div>
                        <div className="text-xs text-gray-600">Students</div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-semibold text-gray-900">{university.type || 'University'}</div>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2">
                    {university.established_year && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Established</span>
                        <span className="font-semibold text-gray-900">{university.established_year}</span>
                      </div>
                    )}
                    {university.avg_tuition_fee && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Avg. Tuition</span>
                        <span className="font-semibold text-gray-900">
                          {university.currency} {university.avg_tuition_fee}
                        </span>
                      </div>
                    )}
                    {university.acceptance_rate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Acceptance Rate</span>
                        <span className="font-semibold text-green-600">{university.acceptance_rate}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
            <Link href="/universities">
              Explore All Universities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
