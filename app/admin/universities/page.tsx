'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Globe,
  BookOpen,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface University {
  id: string
  name: string
  slug: string
  country: string
  city: string
  logo_url: string | null
  ranking_world: number | null
  is_published: boolean
  created_at: string
  _count?: {
    programs: number
  }
}

interface Stats {
  total: number
  published: number
  countries: number
}

export default function UniversitiesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [universities, setUniversities] = useState<University[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, countries: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/admin/universities')
      if (!response.ok) throw new Error('Failed to fetch universities')

      const data = await response.json()
      setUniversities(data.universities)
      setStats(data.stats)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load universities",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will also delete all associated programs.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/universities/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete university')

      toast({
        title: "Success",
        description: "University deleted successfully",
      })
      fetchUniversities()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete university",
        variant: "destructive"
      })
    }
  }

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Universities</h1>
          <p className="text-gray-600 mt-1">Manage universities and their programs</p>
        </div>
        <Button onClick={() => router.push('/admin/universities/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add University
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Universities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.countries}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search universities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-visible">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>University</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>World Ranking</TableHead>
              <TableHead>Programs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUniversities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No universities found matching your search' : 'No universities yet. Click "Add University" to create one.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUniversities.map((university) => (
                <TableRow key={university.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {university.logo_url ? (
                        <img
                          src={university.logo_url}
                          alt={university.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{university.name}</div>
                        <div className="text-sm text-gray-500">{university.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span>{university.city}, {university.country}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {university.ranking_world ? (
                      <Badge variant="outline">#{university.ranking_world}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span>{university._count?.programs || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {university.is_published ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/universities/edit/${university.id}`)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/universities/${university.id}/programs`)}
                        title="View Programs"
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(university.id, university.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
