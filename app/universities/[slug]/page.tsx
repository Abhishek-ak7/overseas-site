'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  Users,
  GraduationCap,
  Award,
  Building2,
  Calendar,
  DollarSign,
  BookOpen,
  Clock,
  ExternalLink
} from "lucide-react"
import Link from 'next/link'

interface University {
  id: string
  name: string
  slug: string
  country: string
  city: string
  state: string | null
  address: string | null
  logo_url: string | null
  banner_url: string | null
  images: string[]
  website: string | null
  email: string | null
  phone: string | null
  description: string | null
  about: string | null
  facilities: string[]
  type: string | null
  established_year: number | null
  accreditation: string | null
  ranking_national: number | null
  ranking_world: number | null
  student_count: number | null
  international_students: number | null
  acceptance_rate: number | null
  avg_tuition_fee: string | null
  currency: string
  campus_size: string | null
  departments: string[]
  notable_alumni: string[]
  partnerships: string[]
  admission_requirements: string | null
  application_deadline: string | null
  language_requirement: string | null
  programs: Program[]
}

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
}

export default function UniversityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [university, setUniversity] = useState<University | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all')

  useEffect(() => {
    fetchUniversity()
  }, [params.slug])

  const fetchUniversity = async () => {
    try {
      const response = await fetch(`/api/universities/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setUniversity(data.university)
      } else {
        router.push('/programs')
      }
    } catch (error) {
      console.error('Failed to fetch university:', error)
      router.push('/programs')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!university) {
    return null
  }

  const disciplines = Array.from(new Set(university.programs.map(p => p.discipline)))
  const filteredPrograms = selectedDiscipline === 'all'
    ? university.programs
    : university.programs.filter(p => p.discipline === selectedDiscipline)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800">
        {university.banner_url ? (
          <img
            src={university.banner_url}
            alt={university.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-32 w-32 text-white opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-end gap-6">
              {university.logo_url ? (
                <div className="w-32 h-32 bg-white rounded-lg p-4 shadow-lg">
                  <img
                    src={university.logo_url}
                    alt={university.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <Building2 className="h-16 w-16 text-gray-400" />
                </div>
              )}

              <div className="flex-1 text-white pb-4">
                <h1 className="text-4xl font-bold mb-2">{university.name}</h1>
                <div className="flex items-center gap-4 text-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {university.city}, {university.country}
                  </div>
                  {university.type && (
                    <Badge className="bg-white text-blue-600">{university.type}</Badge>
                  )}
                  {university.ranking_world && (
                    <Badge className="bg-yellow-500 text-white">
                      <Award className="h-3 w-3 mr-1" />
                      #{university.ranking_world} World
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="programs">Programs ({university.programs.length})</TabsTrigger>
                <TabsTrigger value="admissions">Admissions</TabsTrigger>
                <TabsTrigger value="campus">Campus Life</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {university.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {university.description && (
                      <p className="text-gray-700 text-lg">{university.description}</p>
                    )}

                    {university.about && (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: university.about }}
                      />
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {university.established_year && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{university.established_year}</div>
                          <div className="text-sm text-gray-600">Established</div>
                        </div>
                      )}
                      {university.student_count && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{university.student_count.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Students</div>
                        </div>
                      )}
                      {university.international_students && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Globe className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{university.international_students.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">International</div>
                        </div>
                      )}
                      {university.programs.length > 0 && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{university.programs.length}</div>
                          <div className="text-sm text-gray-600">Programs</div>
                        </div>
                      )}
                    </div>

                    {/* Departments */}
                    {university.departments.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-lg mb-3">Departments</h3>
                        <div className="flex flex-wrap gap-2">
                          {university.departments.map((dept, index) => (
                            <Badge key={index} variant="secondary">{dept}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notable Alumni */}
                    {university.notable_alumni.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-lg mb-3">Notable Alumni</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {university.notable_alumni.map((alumni, index) => (
                            <li key={index}>{alumni}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="programs" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Programs</CardTitle>
                    <div className="flex gap-2 mt-4">
                      <Badge
                        className={`cursor-pointer ${selectedDiscipline === 'all' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setSelectedDiscipline('all')}
                      >
                        All ({university.programs.length})
                      </Badge>
                      {disciplines.map(discipline => (
                        <Badge
                          key={discipline}
                          className={`cursor-pointer ${selectedDiscipline === discipline ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'}`}
                          onClick={() => setSelectedDiscipline(discipline)}
                        >
                          {discipline} ({university.programs.filter(p => p.discipline === discipline).length})
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredPrograms.map((program) => (
                        <Link key={program.id} href={`/uni/${university.slug}/${program.slug}`}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                {program.featured_image && (
                                  <img
                                    src={program.featured_image}
                                    alt={program.name}
                                    className="w-24 h-24 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-lg">{program.name}</h3>
                                    {program.is_featured && (
                                      <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                                    )}
                                  </div>
                                  {program.description && (
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{program.description}</p>
                                  )}
                                  <div className="flex flex-wrap gap-2 items-center text-sm">
                                    <Badge variant="outline">{program.degree_type}</Badge>
                                    <Badge variant="outline">{program.discipline}</Badge>
                                    {program.duration_years && (
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <Clock className="h-3 w-3" />
                                        {program.duration_years} years
                                      </div>
                                    )}
                                    {program.tuition_fee && (
                                      <div className="flex items-center gap-1 text-blue-600 font-semibold ml-auto">
                                        <DollarSign className="h-4 w-4" />
                                        {Number(program.tuition_fee).toLocaleString()} {program.currency}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admissions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Admission Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {university.admission_requirements && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                        <p className="text-gray-700 whitespace-pre-line">{university.admission_requirements}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {university.language_requirement && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-semibold mb-1">Language Requirements</div>
                          <div className="text-gray-700">{university.language_requirement}</div>
                        </div>
                      )}
                      {university.application_deadline && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-semibold mb-1">Application Deadline</div>
                          <div className="text-gray-700">{university.application_deadline}</div>
                        </div>
                      )}
                      {university.acceptance_rate && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-semibold mb-1">Acceptance Rate</div>
                          <div className="text-gray-700">{university.acceptance_rate}%</div>
                        </div>
                      )}
                      {university.avg_tuition_fee && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-semibold mb-1">Average Tuition</div>
                          <div className="text-gray-700">
                            {Number(university.avg_tuition_fee).toLocaleString()} {university.currency}/year
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="campus" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campus Life</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {university.campus_size && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Campus Size</h3>
                        <p className="text-gray-700">{university.campus_size}</p>
                      </div>
                    )}

                    {university.facilities.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Facilities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {university.facilities.map((facility, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <Award className="h-5 w-5 text-blue-600" />
                              <span className="text-sm">{facility}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {university.partnerships.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Partnerships</h3>
                        <div className="flex flex-wrap gap-2">
                          {university.partnerships.map((partnership, index) => (
                            <Badge key={index} variant="outline" className="text-sm">{partnership}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Gallery */}
                    {university.images.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Campus Gallery</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {university.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Campus ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {university.website && (
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-600 hover:underline"
                  >
                    <Globe className="h-5 w-5" />
                    <span>Visit Website</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {university.email && (
                  <a href={`mailto:${university.email}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600">
                    <Mail className="h-5 w-5" />
                    <span className="text-sm">{university.email}</span>
                  </a>
                )}
                {university.phone && (
                  <a href={`tel:${university.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600">
                    <Phone className="h-5 w-5" />
                    <span className="text-sm">{university.phone}</span>
                  </a>
                )}
                {university.address && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 mt-1" />
                    <span className="text-sm">{university.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rankings Card */}
            {(university.ranking_national || university.ranking_world) && (
              <Card>
                <CardHeader>
                  <CardTitle>Rankings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {university.ranking_world && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600">World Ranking</div>
                        <div className="text-2xl font-bold text-yellow-700">#{university.ranking_world}</div>
                      </div>
                      <Award className="h-8 w-8 text-yellow-600" />
                    </div>
                  )}
                  {university.ranking_national && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600">National Ranking</div>
                        <div className="text-2xl font-bold text-blue-700">#{university.ranking_national}</div>
                      </div>
                      <Award className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-80" />
                <h3 className="font-bold text-xl mb-2">Interested in Applying?</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Get expert guidance on your application process
                </p>
                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  Schedule Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
