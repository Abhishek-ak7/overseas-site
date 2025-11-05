"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Search, MapPin, Building2, Users, Star, GraduationCap,
  Globe, Award, Filter, X, ChevronRight, SlidersHorizontal
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
  programs: Array<{
    id: string
    name: string
    discipline: string
    degree_type: string
    tuition_fee?: string
    duration_years?: number
    intake_months?: string[]
    slug: string
  }>
  _count: {
    programs: number
  }
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedState, setSelectedState] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDiscipline, setSelectedDiscipline] = useState('all')
  const [selectedDegree, setSelectedDegree] = useState('all')
  const [selectedIntake, setSelectedIntake] = useState('all')
  const [tuitionRange, setTuitionRange] = useState([0, 50000])
  const [selectedBacklogs, setSelectedBacklogs] = useState('all')
  const [selectedGapYear, setSelectedGapYear] = useState('all')
  const [sortBy, setSortBy] = useState('ranking')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Available filters (populated from API)
  const [availableCountries, setAvailableCountries] = useState<string[]>([])
  const [availableStates, setAvailableStates] = useState<string[]>([])
  const [availableDisciplines, setAvailableDisciplines] = useState<string[]>([])
  const [availableDegrees, setAvailableDegrees] = useState<string[]>([])
  const [availableIntakes, setAvailableIntakes] = useState<string[]>([])

  // Stats
  const [stats, setStats] = useState({ total: 0, countries: 0, featured: 0 })

  useEffect(() => {
    fetchUniversities()
  }, [searchTerm, selectedCountries, selectedState, selectedType, selectedDiscipline, selectedDegree, selectedIntake, sortBy, currentPage])

  const fetchUniversities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedCountries.length > 0) params.append('countries', selectedCountries.join(','))
      if (selectedState && selectedState !== 'all') params.append('state', selectedState)
      if (selectedType && selectedType !== 'all') params.append('type', selectedType)
      if (selectedDiscipline && selectedDiscipline !== 'all') params.append('discipline', selectedDiscipline)
      if (selectedDegree && selectedDegree !== 'all') params.append('degree', selectedDegree)
      if (selectedIntake && selectedIntake !== 'all') params.append('intake', selectedIntake)
      if (tuitionRange[0] > 0 || tuitionRange[1] < 50000) {
        params.append('minTuition', tuitionRange[0].toString())
        params.append('maxTuition', tuitionRange[1].toString())
      }

      const response = await fetch(`/api/universities?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setUniversities(data.universities || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setStats(data.stats || { total: 0, countries: 0, featured: 0 })

      // Populate filter options
      if (data.filters) {
        setAvailableCountries(data.filters.countries || [])
        setAvailableStates(data.filters.states || [])
        setAvailableDisciplines(data.filters.disciplines || [])
        setAvailableDegrees(data.filters.degrees || [])
        setAvailableIntakes(data.filters.intakes || [])
      }
    } catch (error) {
      console.error('Failed to fetch universities:', error)
    } finally {
      setLoading(false)
    }
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
    setSelectedState('all')
    setSelectedType('all')
    setSelectedDiscipline('all')
    setSelectedDegree('all')
    setSelectedIntake('all')
    setTuitionRange([0, 50000])
    setSelectedBacklogs('all')
    setSelectedGapYear('all')
    setSortBy('ranking')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || selectedCountries.length > 0 || selectedState !== 'all' ||
    selectedType !== 'all' || selectedDiscipline !== 'all' || selectedDegree !== 'all' ||
    selectedIntake !== 'all' || tuitionRange[0] > 0 || tuitionRange[1] < 50000

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Find Your Dream University</h1>
          <p className="text-lg md:text-xl text-blue-100 mb-6">
            Explore {stats.total}+ universities across {stats.countries}+ countries
          </p>

          {/* Search Bar */}
          <div className="relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search universities by name, city, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 text-base md:text-lg bg-white text-gray-900 rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-80 flex-shrink-0`}>
            <Card className="sticky top-4">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    <h3 className="font-bold text-lg">Filter By</h3>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600">
                      <X className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Country Filter */}
                <div>
                  <Label className="font-semibold mb-3 block">Country</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableCountries.map(country => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox
                          id={`country-${country}`}
                          checked={selectedCountries.includes(country)}
                          onCheckedChange={() => toggleCountry(country)}
                        />
                        <label htmlFor={`country-${country}`} className="text-sm cursor-pointer flex-1">
                          {country}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* State/Province Filter (for countries like Canada, USA) */}
                {selectedCountries.length === 1 && availableStates.length > 0 && (
                  <div>
                    <Label className="font-semibold mb-2 block">State/Province</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select State/Province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {availableStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* University Type */}
                <div>
                  <Label className="font-semibold mb-2 block">University Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Liberal Arts">Liberal Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Program Discipline */}
                <div>
                  <Label className="font-semibold mb-2 block">Program Discipline</Label>
                  <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Disciplines</SelectItem>
                      {availableDisciplines.map(disc => (
                        <SelectItem key={disc} value={disc}>{disc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Degree Type */}
                <div>
                  <Label className="font-semibold mb-2 block">Degree Level</Label>
                  <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master">Master's Degree</SelectItem>
                      <SelectItem value="PhD">Doctoral Degree (PhD)</SelectItem>
                      <SelectItem value="Diploma">Diploma/Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Intake */}
                <div>
                  <Label className="font-semibold mb-2 block">Intake Month</Label>
                  <Select value={selectedIntake} onValueChange={setSelectedIntake}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Intake" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Intakes</SelectItem>
                      {availableIntakes.map(intake => (
                        <SelectItem key={intake} value={intake}>{intake}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tuition Fee Range */}
                <div>
                  <Label className="font-semibold mb-3 block">
                    Tuition Fee Range (${tuitionRange[0].toLocaleString()} - ${tuitionRange[1].toLocaleString()})
                  </Label>
                  <Slider
                    min={0}
                    max={50000}
                    step={1000}
                    value={tuitionRange}
                    onValueChange={setTuitionRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>$0</span>
                    <span>$50,000+</span>
                  </div>
                </div>

                {/* Backlogs */}
                <div>
                  <Label className="font-semibold mb-2 block">Academic Backlogs</Label>
                  <Select value={selectedBacklogs} onValueChange={setSelectedBacklogs}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Backlogs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="0">No Backlogs</SelectItem>
                      <SelectItem value="1-2">1-2 Backlogs</SelectItem>
                      <SelectItem value="3-5">3-5 Backlogs</SelectItem>
                      <SelectItem value="5+">5+ Backlogs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gap Years */}
                <div>
                  <Label className="font-semibold mb-2 block">Gap Year</Label>
                  <Select value={selectedGapYear} onValueChange={setSelectedGapYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gap Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="0">No Gap</SelectItem>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="3+">3+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
                <span className="text-sm text-gray-600">
                  <strong>{universities.length}</strong> universities found
                </span>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ranking">World Ranking</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="students">Student Count</SelectItem>
                  <SelectItem value="programs">Number of Programs</SelectItem>
                  <SelectItem value="tuition">Tuition Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Universities Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : universities.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No universities found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {universities.map((university) => (
                    <Link href={`/universities/${university.slug}`} key={university.id}>
                      <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer h-full overflow-hidden border hover:border-blue-500">
                        {/* Banner */}
                        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-blue-700">
                          {university.banner_url ? (
                            <Image
                              src={university.banner_url}
                              alt={university.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Building2 className="h-16 w-16 text-white opacity-50" />
                            </div>
                          )}
                          {university.is_featured && (
                            <Badge className="absolute top-3 right-3 bg-yellow-500 text-white border-0">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {/* Logo */}
                          {university.logo_url && (
                            <div className="absolute -bottom-8 left-4 bg-white p-2 rounded-lg shadow-lg border-2 border-white">
                              <Image
                                src={university.logo_url}
                                alt={`${university.name} logo`}
                                width={60}
                                height={60}
                                className="object-contain"
                              />
                            </div>
                          )}
                        </div>

                        <CardContent className="p-4 pt-10">
                          <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[56px]">
                            {university.name}
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{university.city}, {university.country}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                            {university.ranking_world && (
                              <div className="flex items-center gap-1">
                                <Award className="h-4 w-4 text-yellow-600" />
                                <span className="text-gray-700">#{university.ranking_world} World</span>
                              </div>
                            )}
                            {university.student_count && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="text-gray-700">{(university.student_count / 1000).toFixed(0)}K</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {university.type && (
                              <Badge variant="secondary" className="text-xs">{university.type}</Badge>
                            )}
                            {university.programs.length > 0 && university.programs[0].intake_months && (
                              <Badge variant="outline" className="text-xs">
                                Intake: {university.programs[0].intake_months[0]}
                              </Badge>
                            )}
                          </div>

                          <div className="border-t pt-3 flex items-center justify-between">
                            <span className="text-sm text-gray-600 font-medium">
                              {university._count.programs} Programs
                            </span>
                            <ChevronRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            onClick={() => setCurrentPage(pageNum)}
                            size="sm"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      {totalPages > 5 && <span className="text-gray-500">...</span>}
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
