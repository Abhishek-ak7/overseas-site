'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GraduationCap,
  MapPin,
  FileText,
  Plane,
  CreditCard,
  Home,
  Brain,
  Users,
  CheckCircle,
  ArrowRight,
  Globe,
  BookOpen,
  Shield,
  Heart
} from 'lucide-react'
import Link from 'next/link'

const studyAbroadServices = [
  {
    id: 'country-guidance',
    title: 'Country-Specific Guidance',
    description: 'Comprehensive guidance for studying in your preferred destination',
    icon: Globe,
    features: ['Education System Overview', 'Cost of Living Analysis', 'Career Opportunities', 'Immigration Pathways'],
    countries: ['Canada', 'UK', 'USA', 'Australia', 'Germany', 'Ireland', 'New Zealand', 'Netherlands']
  },
  {
    id: 'university-selection',
    title: 'University Selection',
    description: 'Find the perfect university that matches your academic and career goals',
    icon: GraduationCap,
    features: ['Program Matching', 'Ranking Analysis', 'Admission Requirements', 'Scholarship Opportunities'],
    benefits: ['500+ Partner Universities', 'Free Consultation', 'Application Support', '90% Success Rate']
  },
  {
    id: 'course-finder',
    title: 'Course Finder',
    description: 'Discover courses that align with your interests and career aspirations',
    icon: BookOpen,
    features: ['Subject Area Exploration', 'Career Outcome Analysis', 'Prerequisites Check', 'Duration & Fees'],
    specialties: ['Engineering', 'Business', 'Medicine', 'IT', 'Arts', 'Sciences']
  },
  {
    id: 'application-assistance',
    title: 'Application Assistance',
    description: 'End-to-end support for your university applications',
    icon: FileText,
    features: ['Document Preparation', 'SOP Writing', 'LOR Guidance', 'Portfolio Review'],
    timeline: ['2-3 months before deadline', 'Expert review process', 'Multiple revisions included']
  },
  {
    id: 'visa-guidance',
    title: 'Visa Guidance',
    description: 'Complete visa application support with high success rates',
    icon: Shield,
    features: ['Document Checklist', 'Interview Preparation', 'Form Filling', 'Status Tracking'],
    success: '95% Visa Success Rate'
  },
  {
    id: 'pre-departure',
    title: 'Pre-Departure Services',
    description: 'Prepare for your journey with comprehensive pre-departure support',
    icon: Plane,
    features: ['Orientation Sessions', 'Packing Guidelines', 'Airport Assistance', 'Emergency Contacts'],
    included: ['Cultural Preparation', 'Academic Readiness', 'Practical Tips']
  }
]

const additionalServices = [
  {
    id: 'test-prep',
    title: 'Test Preparation',
    description: 'Comprehensive preparation for English and standardized tests',
    icon: Brain,
    tests: ['IELTS', 'TOEFL', 'PTE', 'GRE', 'GMAT', 'SAT', 'ACT'],
    features: ['Mock Tests', 'One-on-One Coaching', 'Study Materials', 'Score Guarantee']
  },
  {
    id: 'education-loans',
    title: 'Education Loans',
    description: 'Financial assistance to make your dreams affordable',
    icon: CreditCard,
    features: ['Loan Eligibility Check', 'Bank Partnerships', 'Documentation Support', 'Interest Rate Comparison'],
    benefits: ['Up to 1.5 Cr funding', 'Collateral-free options', 'Quick approval']
  },
  {
    id: 'accommodation',
    title: 'Accommodation Assistance',
    description: 'Find safe and comfortable housing in your destination country',
    icon: Home,
    features: ['On-Campus Housing', 'Off-Campus Options', 'Homestay Programs', 'Shared Accommodations'],
    locations: ['Near Campus', 'City Center', 'Budget-Friendly', 'Premium Options']
  },
  {
    id: 'forex',
    title: 'Forex Services',
    description: 'Foreign exchange services at competitive rates',
    icon: CreditCard,
    features: ['Currency Exchange', 'Travel Cards', 'Wire Transfers', 'Rate Alerts'],
    currencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'NZD']
  },
  {
    id: 'travel',
    title: 'Travel Assistance',
    description: 'Complete travel planning and booking services',
    icon: Plane,
    features: ['Flight Booking', 'Travel Insurance', 'Airport Transfers', 'Group Travel'],
    support: ['24/7 Emergency Support', 'Travel Documentation', 'Itinerary Planning']
  }
]

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('study-abroad')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our Services
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Comprehensive support for your study abroad journey - from initial consultation to successful graduation
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">
                <Users className="mr-2 h-5 w-5" />
                Free Consultation
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/courses">
                <GraduationCap className="mr-2 h-5 w-5" />
                Browse Courses
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Tabs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="study-abroad">Study Abroad</TabsTrigger>
              <TabsTrigger value="additional">Additional Services</TabsTrigger>
            </TabsList>

            <TabsContent value="study-abroad">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Study Abroad Services</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  End-to-end support for your international education journey
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {studyAbroadServices.map((service) => {
                  const IconComponent = service.icon
                  return (
                    <Card key={service.id} className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <CardTitle className="text-xl">{service.title}</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Key Features:</h4>
                            <ul className="space-y-1">
                              {service.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {service.countries && (
                            <div>
                              <h4 className="font-semibold mb-2">Countries:</h4>
                              <div className="flex flex-wrap gap-1">
                                {service.countries.slice(0, 4).map((country, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {country}
                                  </Badge>
                                ))}
                                {service.countries.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{service.countries.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {service.benefits && (
                            <div>
                              <h4 className="font-semibold mb-2">Benefits:</h4>
                              <div className="flex flex-wrap gap-1">
                                {service.benefits.map((benefit, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {benefit}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {service.success && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-green-800">{service.success}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <Button className="w-full mt-6" asChild>
                          <Link href={`/services/${service.id}`}>
                            Learn More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="additional">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Services</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Supporting services to make your study abroad journey smooth and successful
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {additionalServices.map((service) => {
                  const IconComponent = service.icon
                  return (
                    <Card key={service.id} className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-purple-100 p-3 rounded-lg">
                            <IconComponent className="h-6 w-6 text-purple-600" />
                          </div>
                          <CardTitle className="text-xl">{service.title}</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Features:</h4>
                            <ul className="space-y-1">
                              {service.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {service.tests && (
                            <div>
                              <h4 className="font-semibold mb-2">Tests Covered:</h4>
                              <div className="flex flex-wrap gap-1">
                                {service.tests.map((test, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {test}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {service.benefits && (
                            <div>
                              <h4 className="font-semibold mb-2">Benefits:</h4>
                              <div className="space-y-1">
                                {service.benefits.map((benefit, index) => (
                                  <div key={index} className="text-sm text-gray-600">
                                    • {benefit}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <Button className="w-full mt-6" variant="outline" asChild>
                          <Link href={`/services/${service.id}`}>
                            Learn More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Book a free consultation with our education experts and take the first step towards your international education goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/appointments">
                <Users className="mr-2 h-5 w-5" />
                Book Free Consultation
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}