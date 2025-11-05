'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  BookOpen,
  GraduationCap,
  DollarSign,
  ArrowLeft
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Program {
  id: string
  name: string
  slug: string
  degree_type: string
  discipline: string
  tuition_fee: string | null
  currency: string
  is_published: boolean
  created_at: string
}

interface University {
  id: string
  name: string
  country: string
  city: string
}

interface Stats {
  total: number
  published: number
  disciplines: number
  degrees: number
}

export default function UniversityProgramsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [university, setUniversity] = useState<University | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, disciplines: 0, degrees: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      const [uniResponse, progResponse] = await Promise.all([
        fetch(`/api/admin/universities/${params.id}`),
        fetch(`/api/admin/programs?universityId=${params.id}`)
      ])

      if (uniResponse.ok) {
        const uniData = await uniResponse.json()
        setUniversity(uniData.university)
      }

      if (progResponse.ok) {
        const progData = await progResponse.json()
        setPrograms(progData.programs)
        setStats(progData.stats)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/programs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete program')

      toast({
        title: "Success",
        description: "Program deleted successfully",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete program",
        variant: "destructive"
      })
    }
  }

  const filteredPrograms = programs.filter(prog =>
    prog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prog.discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prog.degree_type.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/universities')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{university?.name} - Programs</h1>
          <p className="text-gray-600 mt-1">{university?.city}, {university?.country}</p>
        </div>
        <Button onClick={() => router.push(`/admin/programs/new?universityId=${params.id}`)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Program
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplines</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disciplines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Degree Types</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.degrees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program Name</TableHead>
              <TableHead>Degree Type</TableHead>
              <TableHead>Discipline</TableHead>
              <TableHead>Tuition Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No programs found matching your search' : 'No programs yet. Click "Add Program" to create one.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{program.name}</div>
                      <div className="text-sm text-gray-500">{program.slug}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{program.degree_type}</Badge>
                  </TableCell>
                  <TableCell>{program.discipline}</TableCell>
                  <TableCell>
                    {program.tuition_fee ? (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {Number(program.tuition_fee).toLocaleString()} {program.currency}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {program.is_published ? (
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
                        onClick={() => router.push(`/admin/programs/edit/${program.id}`)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(program.id, program.name)}
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
