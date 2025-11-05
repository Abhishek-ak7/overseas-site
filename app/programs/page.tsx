'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, GraduationCap, MapPin, DollarSign, Clock, Filter, X, Award, Briefcase, Globe } from "lucide-react"
import Link from 'next/link'

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

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [filters, setFilters] = useState<any>({ countries: [], disciplines: [], degreeTypes: [], intakes: [] })
  const [stats, setStats] = useState<any>({ total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedDiscipline, setSelectedDiscipline] = useState('all')
  const [selectedDegree, setSelectedDegree] = useState('all')
  const [selectedIntake, setSelectedIntake] = useState('all')
  const [tuitionRange, setTuitionRange] = useState([0, 100000])
  const [showWorkPermit, setShowWorkPermit] = useState(false)
  const [showPRPathway, setShowPRPathway] = useState(false)
  const [showInternship, setShowInternship] = useState(false)
  const [showScholarship, setShowScholarship] = useState(false)
  const [showOnline, setShowOnline] = useState(false)

  useEffect(() => {
    fetchPrograms()
  }, [currentPage, selectedCountries, selectedDiscipline, selectedDegree, selectedIntake, tuitionRange, showWorkPermit, showPRPathway, showInternship, showScholarship, showOnline])

  const fetchPrograms = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCountries.length > 0) params.append('countries', selectedCountries.join(','))
      if (selectedDiscipline !== 'all') params.append('discipline', selectedDiscipline)
      if (selectedDegree !== 'all') params.append('degreeType', selectedDegree)
      if (selectedIntake !== 'all') params.append('intake', selectedIntake)
      if (tuitionRange[0] > 0) params.append('minTuition', tuitionRange[0].toString())
      if (tuitionRange[1] < 100000) params.append('maxTuition', tuitionRange[1].toString())
      if (showWorkPermit) params.append('workPermit', 'true')
      if (showPRPathway) params.append('prPathway', 'true')
      if (showInternship) params.append('internship', 'true')
      if (showScholarship) params.append('scholarship', 'true')
      if (showOnline) params.append('online', 'true')
      params.append('page', currentPage.toString())

      const response = await fetch(`/api/programs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.programs)
        setFilters(data.filters)
        setStats(data.stats)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPrograms()
  }

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    )
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCountries([])
    setSelectedDiscipline('all')
    setSelectedDegree('all')
    setSelectedIntake('all')
    setTuitionRange([0, 100000])
    setShowWorkPermit(false)
    setShowPRPathway(false)
    setShowInternship(false)
    setShowScholarship(false)
    setShowOnline(false)
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || selectedCountries.length > 0 || selectedDiscipline !== 'all' ||
    selectedDegree !== 'all' || selectedIntake !== 'all' || tuitionRange[0] > 0 || tuitionRange[1] < 100000 ||
    showWorkPermit || showPRPathway || showInternship || showScholarship || showOnline

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Program</h1>
          <p className="text-xl mb-6">Explore {stats.total} programs from top universities worldwide</p>

          {/* Search Bar */}
          <div className="bg-white rounded-lg p-4 shadow-lg max-w-3xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 shrink-0`}>
            <Card className="sticky top-4">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <h2 className="font-semibold text-lg">Filters</h2>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Countries */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Country</Label>
                  {filters.countries.map((country: string) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country}`}
                        checked={selectedCountries.includes(country)}
                        onCheckedChange={() => toggleCountry(country)}
                      />
                      <label htmlFor={`country-${country}`} className="text-sm cursor-pointer">
                        {country}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Discipline */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Discipline</Label>
                  <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Disciplines</SelectItem>
                      {filters.disciplines.map((discipline: string) => (
                        <SelectItem key={discipline} value={discipline}>{discipline}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Degree Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Degree Level</Label>
                  <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Degrees</SelectItem>
                      {filters.degreeTypes.map((degree: string) => (
                        <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Intake */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Intake Month</Label>
                  <Select value={selectedIntake} onValueChange={setSelectedIntake}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Intakes</SelectItem>
                      {filters.intakes.map((intake: string) => (
                        <SelectItem key={intake} value={intake}>{intake}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tuition Fee Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Tuition Fee Range</Label>
                  <div className="px-2">
                    <Slider
                      value={tuitionRange}
                      onValueChange={setTuitionRange}
                      max={100000}
                      step={5000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${tuitionRange[0].toLocaleString()}</span>
                    <span>${tuitionRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Program Features */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Program Features</Label>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="work-permit"
                      checked={showWorkPermit}
                      onCheckedChange={setShowWorkPermit}
                    />
                    <label htmlFor="work-permit" className="text-sm cursor-pointer flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      Work Permit ({stats.workPermit})
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pr-pathway"
                      checked={showPRPathway}
                      onCheckedChange={setShowPRPathway}
                    />
                    <label htmlFor="pr-pathway" className="text-sm cursor-pointer flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      PR Pathway ({stats.prPathway})
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="internship"
                      checked={showInternship}
                      onCheckedChange={setShowInternship}
                    />
                    <label htmlFor="internship" className="text-sm cursor-pointer">
                      Internship Included
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="scholarship"
                      checked={showScholarship}
                      onCheckedChange={setShowScholarship}
                    />
                    <label htmlFor="scholarship" className="text-sm cursor-pointer flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Scholarships ({stats.scholarship})
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="online"
                      checked={showOnline}
                      onCheckedChange={setShowOnline}
                    />
                    <label htmlFor="online" className="text-sm cursor-pointer">
                      Online Available
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Programs Grid */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                variant="outline"
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showMobileFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{programs.length} Programs Found</h2>
                <p className="text-gray-600">Showing page {currentPage} of {totalPages}</p>
              </div>
            </div>

            {/* Programs Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="h-96 animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <CardContent className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-20 bg-gray-200 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">No programs found</h2>
                <p className="text-gray-600 mb-4">Try adjusting your filters</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {programs.map((program) => (
                    <Link key={program.id} href={`/uni/${program.university.slug}/${program.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardHeader className="p-0 relative">
                          {program.featured_image ? (
                            <img
                              src={program.featured_image}
                              alt={program.name}
                              className="w-full h-48 object-cover rounded-t-lg group-hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center rounded-t-lg">
                              <GraduationCap className="h-16 w-16 text-white opacity-50" />
                            </div>
                          )}
                          {program.is_featured && (
                            <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                              Featured
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="p-5">
                          {/* University Info */}
                          <div className="flex items-center gap-2 mb-3">
                            {program.university.logo_url ? (
                              <img
                                src={program.university.logo_url}
                                alt={program.university.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {program.university.name}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {program.university.city}, {program.university.country}
                              </p>
                            </div>
                          </div>

                          {/* Program Name */}
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                            {program.name}
                          </h3>

                          {/* Description */}
                          {program.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {program.description}
                            </p>
                          )}

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline" className="text-xs">
                              {program.degree_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {program.discipline}
                            </Badge>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {program.work_permit && (
                              <Badge variant="secondary" className="text-xs">
                                <Briefcase className="h-3 w-3 mr-1" />
                                Work Permit
                              </Badge>
                            )}
                            {program.pr_pathway && (
                              <Badge variant="secondary" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                PR Pathway
                              </Badge>
                            )}
                            {program.scholarship_available && (
                              <Badge variant="secondary" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                Scholarship
                              </Badge>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex justify-between items-center text-sm pt-3 border-t">
                            {program.tuition_fee && (
                              <div className="flex items-center gap-1 text-purple-600 font-semibold">
                                <DollarSign className="h-4 w-4" />
                                {Number(program.tuition_fee).toLocaleString()} {program.currency}
                              </div>
                            )}
                            {program.duration_years && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="h-4 w-4" />
                                {program.duration_years} years
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          onClick={() => setCurrentPage(i + 1)}
                          size="sm"
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
