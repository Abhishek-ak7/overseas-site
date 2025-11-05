'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft, MapPin, Clock, DollarSign, Calendar, GraduationCap,
  BookOpen, Briefcase, CheckCircle, Globe, Users, Award,
  FileText, Home, TrendingUp, Star, Building2, Mail, Phone
} from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'

interface Program {
  id: string
  name: string
  slug: string
  degree_type: string
  discipline: string
  specialization?: string
  duration_years?: number
  duration_months?: number
  intake_months: string[]
  featured_image?: string
  images: string[]
  description?: string
  overview?: string
  curriculum?: string
  career_opportunities?: string
  tuition_fee?: string
  application_fee?: string
  currency: string
  scholarship_available: boolean
  scholarship_details?: string
  hostel_available: boolean
  hostel_fee?: string
  living_cost_min?: string
  living_cost_max?: string
  total_seats?: number
  international_seats?: number
  language_requirement?: string
  min_gpa?: number
  entrance_exam?: string
  work_permit: boolean
  pr_pathway: boolean
  internship_included: boolean
  online_available: boolean
  requirements?: string
  documents_needed: string[]
  job_prospects: string[]
  average_salary?: string
  tags: string[]
  university: {
    id: string
    name: string
    slug: string
    country: string
    city: string
    logo_url?: string
    banner_url?: string
    website?: string
    email?: string
    phone?: string
  }
}

export default function ProgramDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPrograms, setRelatedPrograms] = useState<Program[]>([])

  const universitySlug = params.slug as string
  const programSlug = params.program as string

  useEffect(() => {
    fetchProgramDetails()
  }, [universitySlug, programSlug])

  const fetchProgramDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/programs/by-slug?university=${universitySlug}&program=${programSlug}`)

      if (!response.ok) {
        if (response.status === 404) {
          notFound()
        }
        throw new Error('Failed to fetch program')
      }

      const data = await response.json()
      setProgram(data.program)
      setRelatedPrograms(data.relatedPrograms || [])
    } catch (error) {
      console.error('Error fetching program:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!program) {
    return notFound()
  }

  const duration = program.duration_years
    ? `${program.duration_years} Year${program.duration_years > 1 ? 's' : ''}`
    : program.duration_months
    ? `${program.duration_months} Months`
    : 'N/A'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        {program.featured_image && (
          <Image
            src={program.featured_image}
            alt={program.name}
            fill
            className="object-cover mix-blend-overlay"
          />
        )}

        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
          <Link href={`/${universitySlug}`} className="inline-flex items-center text-white/90 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {program.university.name}
          </Link>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex gap-3 mb-4 flex-wrap">
                <Badge className="bg-white/20 text-white border-0">{program.degree_type}</Badge>
                <Badge className="bg-white/20 text-white border-0">{program.discipline}</Badge>
                {program.specialization && (
                  <Badge className="bg-white/20 text-white border-0">{program.specialization}</Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4">{program.name}</h1>

              <div className="flex items-center gap-2 mb-6">
                {program.university.logo_url && (
                  <Image
                    src={program.university.logo_url}
                    alt={program.university.name}
                    width={50}
                    height={50}
                    className="bg-white rounded-lg p-1"
                  />
                )}
                <div>
                  <div className="font-semibold text-lg">{program.university.name}</div>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4" />
                    <span>{program.university.city}, {program.university.country}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">{duration}</span>
                </div>
                {program.tuition_fee && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">
                      {program.currency} {parseFloat(program.tuition_fee).toLocaleString()} / year
                    </span>
                  </div>
                )}
                {program.intake_months.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">Intake: {program.intake_months.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Card */}
            <div className="md:col-span-1">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold mb-1">
                      {program.tuition_fee
                        ? `${program.currency} ${parseFloat(program.tuition_fee).toLocaleString()}`
                        : 'Contact for Fees'}
                    </div>
                    <div className="text-white/80 text-sm">per year</div>
                  </div>
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 mb-3" size="lg">
                    Apply Now
                  </Button>
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                    Download Brochure
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {program.work_permit && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg p-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium">Work Permit</span>
              </div>
            )}
            {program.pr_pathway && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg p-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium">PR Pathway</span>
              </div>
            )}
            {program.internship_included && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg p-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium">Internship</span>
              </div>
            )}
            {program.scholarship_available && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg p-3">
                <Award className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">Scholarships</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 w-full mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="career">Career</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Program Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {program.description && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">About the Program</h3>
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: program.description }} />
                      </div>
                    )}

                    {program.overview && (
                      <div>
                        <Separator className="my-4" />
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: program.overview }} />
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          Program Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium">{duration}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Degree Type</span>
                            <span className="font-medium">{program.degree_type}</span>
                          </div>
                          {program.total_seats && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Total Seats</span>
                              <span className="font-medium">{program.total_seats}</span>
                            </div>
                          )}
                          {program.international_seats && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">International Seats</span>
                              <span className="font-medium">{program.international_seats}</span>
                            </div>
                          )}
                          {program.language_requirement && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Language</span>
                              <span className="font-medium">{program.language_requirement}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          Fee Structure
                        </h3>
                        <div className="space-y-2 text-sm">
                          {program.tuition_fee && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Tuition Fee</span>
                              <span className="font-medium">{program.currency} {parseFloat(program.tuition_fee).toLocaleString()}</span>
                            </div>
                          )}
                          {program.application_fee && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Application Fee</span>
                              <span className="font-medium">{program.currency} {parseFloat(program.application_fee).toLocaleString()}</span>
                            </div>
                          )}
                          {program.hostel_fee && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Hostel Fee</span>
                              <span className="font-medium">{program.currency} {parseFloat(program.hostel_fee).toLocaleString()}</span>
                            </div>
                          )}
                          {program.living_cost_min && program.living_cost_max && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Living Cost (Est.)</span>
                              <span className="font-medium">
                                {program.currency} {parseFloat(program.living_cost_min).toLocaleString()} - {parseFloat(program.living_cost_max).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Curriculum Tab */}
              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>Curriculum & Course Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {program.curriculum ? (
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: program.curriculum }} />
                    ) : (
                      <p className="text-gray-600">Curriculum details will be available soon. Please contact the university for more information.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Requirements Tab */}
              <TabsContent value="requirements">
                <Card>
                  <CardHeader>
                    <CardTitle>Admission Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {program.requirements && (
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: program.requirements }} />
                    )}

                    {program.min_gpa && (
                      <div>
                        <h3 className="font-semibold mb-2">Minimum GPA</h3>
                        <p className="text-gray-700">{program.min_gpa} / 4.0</p>
                      </div>
                    )}

                    {program.entrance_exam && (
                      <div>
                        <h3 className="font-semibold mb-2">Entrance Exams</h3>
                        <p className="text-gray-700">{program.entrance_exam}</p>
                      </div>
                    )}

                    {program.documents_needed.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Required Documents</h3>
                        <ul className="space-y-2">
                          {program.documents_needed.map((doc, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {program.scholarship_available && program.scholarship_details && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-600" />
                          Scholarship Information
                        </h3>
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: program.scholarship_details }} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Career Tab */}
              <TabsContent value="career">
                <Card>
                  <CardHeader>
                    <CardTitle>Career Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {program.career_opportunities && (
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: program.career_opportunities }} />
                    )}

                    {program.job_prospects.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Job Prospects</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {program.job_prospects.map((job, index) => (
                            <div key={index} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <Briefcase className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              <span className="text-sm font-medium">{job}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {program.average_salary && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-sm text-gray-600 mb-1">Average Starting Salary</div>
                        <div className="text-3xl font-bold text-green-700">
                          {program.currency} {parseFloat(program.average_salary).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">per year</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact University</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {program.university.website && (
                  <a href={program.university.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-blue-600">
                    <Globe className="h-5 w-5" />
                    <span className="text-sm">Visit Website</span>
                  </a>
                )}
                {program.university.email && (
                  <a href={`mailto:${program.university.email}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600">
                    <Mail className="h-5 w-5" />
                    <span className="text-sm">{program.university.email}</span>
                  </a>
                )}
                {program.university.phone && (
                  <a href={`tel:${program.university.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600">
                    <Phone className="h-5 w-5" />
                    <span className="text-sm">{program.university.phone}</span>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Related Programs */}
            {relatedPrograms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Programs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedPrograms.slice(0, 5).map((related) => (
                    <Link
                      key={related.id}
                      href={`/uni/${related.university.slug}/${related.slug}`}
                      className="block p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-sm line-clamp-2 mb-1">{related.name}</div>
                      <div className="text-xs text-gray-600">{related.degree_type} • {related.discipline}</div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
