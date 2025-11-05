"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, GraduationCap, DollarSign, Users } from "lucide-react"
import Image from "next/image"

interface Country {
  id: string
  name: string
  slug: string
  flagUrl?: string
  imageUrl?: string
  description?: string
  shortDescription?: string
  continent?: string
  currency?: string
  language?: string
  capital?: string
  population?: number
  isActive: boolean
  isFeatured: boolean
  isPopular: boolean
  orderIndex: number
  studyCost?: string
  livingCost?: string
  visaRequirements?: string
  workPermit?: string
  universities: string[]
  popularCourses: string[]
  scholarships: string[]
  admissionRequirements?: string
  intakeMonths: string[]
  studyLevels: string[]
  averageProcessingTime?: string
  minimumRequirement?: string
  workOpportunities?: string
  postStudyWork?: string
  immigrationOptions?: string
  stats?: {
    universities: number
    programs: number
    students: number
    scholarships: number
  }
}

export function DestinationsSection() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries')
      const data = await response.json()
      setCountries(data.countries || [])
    } catch (error) {
      console.error('Failed to fetch countries:', error)
      // Fallback to default countries
      setCountries([
        {
          id: 'canada',
          name: 'Canada',
          slug: 'canada',
          flagUrl: '/canada-flag.jpg',
          imageUrl: '/placeholder-canada.jpg',
          description: 'Study in Canada and experience world-class education with excellent post-study work opportunities.',
          shortDescription: 'World-class education with excellent work opportunities',
          continent: 'North America',
          currency: 'CAD',
          language: 'English, French',
          capital: 'Ottawa',
          isActive: true,
          isFeatured: true,
          isPopular: true,
          orderIndex: 0,
          studyCost: '$15,000 - $35,000',
          livingCost: '$12,000 - $18,000',
          universities: ['University of Toronto', 'McGill University', 'University of British Columbia'],
          popularCourses: ['Engineering', 'Business', 'Computer Science', 'Medicine'],
          scholarships: ['Vanier Canada Graduate Scholarships', 'Ontario Graduate Scholarship'],
          intakeMonths: ['September', 'January', 'May'],
          studyLevels: ['Undergraduate', 'Graduate', 'Postgraduate', 'PhD'],
          postStudyWork: 'Up to 3 years',
          stats: {
            universities: 200,
            programs: 15000,
            students: 45000,
            scholarships: 150
          }
        },
        {
          id: 'usa',
          name: 'United States',
          slug: 'usa',
          flagUrl: '/usa-flag.jpg',
          imageUrl: '/placeholder-usa.jpg',
          description: 'Pursue your dreams in the USA with access to top-ranked universities and cutting-edge research facilities.',
          shortDescription: 'Top-ranked universities and cutting-edge research',
          continent: 'North America',
          currency: 'USD',
          language: 'English',
          capital: 'Washington, D.C.',
          isActive: true,
          isFeatured: true,
          isPopular: true,
          orderIndex: 1,
          studyCost: '$20,000 - $50,000',
          livingCost: '$15,000 - $25,000',
          universities: ['Harvard University', 'MIT', 'Stanford University'],
          popularCourses: ['Computer Science', 'Business', 'Engineering', 'Medicine'],
          scholarships: ['Fulbright Scholarships', 'Merit-based aid'],
          intakeMonths: ['Fall', 'Spring', 'Summer'],
          studyLevels: ['Undergraduate', 'Graduate', 'Postgraduate', 'PhD'],
          postStudyWork: 'OPT up to 3 years',
          stats: {
            universities: 400,
            programs: 25000,
            students: 65000,
            scholarships: 300
          }
        },
        {
          id: 'uk',
          name: 'United Kingdom',
          slug: 'uk',
          flagUrl: '/uk-flag.jpg',
          imageUrl: '/placeholder-uk.jpg',
          description: 'Experience centuries of academic excellence in the UK with globally recognized qualifications.',
          shortDescription: 'Centuries of academic excellence and global recognition',
          continent: 'Europe',
          currency: 'GBP',
          language: 'English',
          capital: 'London',
          isActive: true,
          isFeatured: true,
          isPopular: true,
          orderIndex: 2,
          studyCost: '£12,000 - £35,000',
          livingCost: '£10,000 - £15,000',
          universities: ['Oxford University', 'Cambridge University', 'Imperial College London'],
          popularCourses: ['Business', 'Engineering', 'Medicine', 'Arts'],
          scholarships: ['Chevening Scholarships', 'Commonwealth Scholarships'],
          intakeMonths: ['September', 'January'],
          studyLevels: ['Undergraduate', 'Graduate', 'Postgraduate', 'PhD'],
          postStudyWork: 'Up to 2 years',
          stats: {
            universities: 150,
            programs: 12000,
            students: 35000,
            scholarships: 200
          }
        },
        {
          id: 'australia',
          name: 'Australia',
          slug: 'australia',
          flagUrl: '/australia-flag.jpg',
          imageUrl: '/placeholder-australia.jpg',
          description: 'Study in Australia and enjoy high-quality education in a diverse and welcoming environment.',
          shortDescription: 'High-quality education in a diverse environment',
          continent: 'Oceania',
          currency: 'AUD',
          language: 'English',
          capital: 'Canberra',
          isActive: true,
          isFeatured: true,
          isPopular: true,
          orderIndex: 3,
          studyCost: 'AUD $20,000 - $40,000',
          livingCost: 'AUD $15,000 - $20,000',
          universities: ['University of Melbourne', 'Australian National University', 'University of Sydney'],
          popularCourses: ['Engineering', 'Business', 'Medicine', 'Environmental Science'],
          scholarships: ['Australia Awards', 'University-specific scholarships'],
          intakeMonths: ['February', 'July'],
          studyLevels: ['Undergraduate', 'Graduate', 'Postgraduate', 'PhD'],
          postStudyWork: 'Up to 4 years',
          stats: {
            universities: 120,
            programs: 10000,
            students: 30000,
            scholarships: 180
          }
        }
      ])
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const activeCountries = countries
    .filter(country => country.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .slice(0, 8) // Show top 8 countries

  if (activeCountries.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Popular Study Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover world-renowned universities and exceptional opportunities across our top study destinations.
            Each country offers unique advantages for your international education journey.
          </p>
        </div>

        {/* Countries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {activeCountries.map((country) => (
            <div
              key={country.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-primary/20 hover:-translate-y-2"
            >
              {/* Country Image/Flag */}
              <div className="relative h-48 overflow-hidden">
                {country.imageUrl && (
                  <Image
                    src={country.imageUrl}
                    alt={country.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                
                {/* Flag overlay */}
                {country.flagUrl && (
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-8 rounded shadow-lg overflow-hidden border-2 border-white">
                      <Image
                        src={country.flagUrl}
                        alt={`${country.name} flag`}
                        width={48}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Featured badge */}
                {country.isFeatured && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                      Popular
                    </span>
                  </div>
                )}
              </div>

              {/* Country Info */}
              <div className="p-6">
                {/* Country Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {country.name}
                </h3>
                
                {/* Short Description */}
                {country.shortDescription && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {country.shortDescription}
                  </p>
                )}

                {/* Quick Stats */}
                {country.stats && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-primary">{country.stats.universities}</div>
                      <div className="text-xs text-gray-600">Universities</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-primary">{country.stats.programs.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Programs</div>
                    </div>
                  </div>
                )}

                {/* Key Features */}
                <div className="space-y-2 mb-4">
                  {country.studyCost && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      <span>Tuition: {country.studyCost}</span>
                    </div>
                  )}
                  {country.postStudyWork && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Work permit: {country.postStudyWork}</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button 
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg transition-all duration-300 group-hover:shadow-md"
                  onClick={() => window.location.href = `/study-in-${country.slug}`}
                >
                  <span className="font-semibold">Explore {country.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 lg:p-12 border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Can't Find Your Dream Destination?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We partner with universities across 30+ countries worldwide. Let our experts help you discover the perfect match
            for your academic goals and career aspirations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-sm hover:shadow-md">
              View All Countries
            </button>
            <button className="flex-1 px-6 py-4 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm">
              Get Expert Advice
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}