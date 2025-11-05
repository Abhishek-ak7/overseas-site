"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, MapPin, Clock, DollarSign, ArrowRight, Award, Briefcase, Globe, Building2 } from 'lucide-react'

interface Program {
  id: string
  name: string
  slug: string
  degree_type: string
  discipline: string
  specialization: string | null
  description: string | null
  featured_image: string | null
  tuition_fee: string | null
  currency: string
  duration_years: number | null
  is_featured: boolean
  work_permit: boolean
  pr_pathway: boolean
  internship_included: boolean
  scholarship_available: boolean
  university: {
    id: string
    name: string
    slug: string
    country: string
    city: string
    logo_url: string | null
  }
}

export function ProgramsSection() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs?limit=6&featured=true')
      const data = await response.json()
      setPrograms(data.programs || [])
    } catch (error) {
      console.error('Failed to fetch programs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  if (programs.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Featured Programs
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Explore Top Study Programs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse through carefully curated programs from world-renowned universities across the globe
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {programs.map((program) => (
            <Link key={program.id} href={`/programs/${program.slug}`}>
              <Card className="group h-full hover:shadow-2xl transition-all duration-300 border-gray-200 overflow-hidden">
                {/* Program Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                  {program.featured_image ? (
                    <Image
                      src={program.featured_image}
                      alt={program.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-20 h-20 text-primary/30" />
                    </div>
                  )}

                  {/* Degree Type Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-primary text-white font-semibold">
                      {program.degree_type}
                    </Badge>
                  </div>

                  {/* Featured Badge */}
                  {program.is_featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-500 text-white">
                        <Award className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* University Logo Overlay */}
                  {program.university.logo_url && (
                    <div className="absolute bottom-3 right-3 w-12 h-12 bg-white rounded-lg p-2 shadow-lg">
                      <Image
                        src={program.university.logo_url}
                        alt={program.university.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Discipline */}
                  <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
                    {program.discipline}
                  </div>

                  {/* Program Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {program.name}
                  </h3>

                  {/* Specialization */}
                  {program.specialization && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                      {program.specialization}
                    </p>
                  )}

                  {/* University */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                    <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="truncate font-medium">{program.university.name}</span>
                  </div>

                  {/* Program Details */}
                  <div className="space-y-2 mb-4">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{program.university.city}, {program.university.country}</span>
                    </div>

                    {/* Duration */}
                    {program.duration_years && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{program.duration_years} {program.duration_years === 1 ? 'Year' : 'Years'}</span>
                      </div>
                    )}

                    {/* Tuition */}
                    {program.tuition_fee && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{program.currency} {program.tuition_fee}/year</span>
                      </div>
                    )}
                  </div>

                  {/* Benefits Badges */}
                  <div className="flex flex-wrap gap-2">
                    {program.scholarship_available && (
                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <Award className="w-3 h-3 mr-1" />
                        Scholarship
                      </Badge>
                    )}
                    {program.work_permit && (
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <Briefcase className="w-3 h-3 mr-1" />
                        Work Permit
                      </Badge>
                    )}
                    {program.pr_pathway && (
                      <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        <Globe className="w-3 h-3 mr-1" />
                        PR Pathway
                      </Badge>
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
            <Link href="/programs">
              Browse All Programs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
