'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  Clock,
  Phone,
  Mail,
  Globe,
  User,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react'

interface Consultant {
  id: string
  name: string
  email: string
  phone: string
  bio: string
  specialties: string[]
  experience: string
  education: string
  certifications: string[]
  languages: string[]
  hourlyRate: number
  currency: string
  avatarUrl: string | null
  isActive: boolean
  rating: number
  totalReviews: number
  availability: any
  timeZone: string
  createdAt?: string
  updatedAt?: string
}

export default function ConsultantsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialties: '',
    experience: '',
    education: '',
    certifications: '',
    languages: '',
    hourlyRate: '',
    timeZone: 'America/Toronto',
    isActive: true
  })

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      const response = await fetch('/api/consultants')
      const data = await response.json()

      if (data.success) {
        setConsultants(data.consultants)
      }
    } catch (error) {
      console.error('Error fetching consultants:', error)
      toast({
        title: "Error",
        description: "Failed to load consultants",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (consultant?: Consultant) => {
    if (consultant) {
      setIsEditing(true)
      setSelectedConsultant(consultant)
      setFormData({
        name: consultant.name,
        email: consultant.email,
        phone: consultant.phone,
        bio: consultant.bio,
        specialties: consultant.specialties.join(', '),
        experience: consultant.experience,
        education: consultant.education,
        certifications: consultant.certifications.join(', '),
        languages: consultant.languages.join(', '),
        hourlyRate: consultant.hourlyRate.toString(),
        timeZone: consultant.timeZone,
        isActive: consultant.isActive
      })
    } else {
      setIsEditing(false)
      setSelectedConsultant(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        bio: '',
        specialties: '',
        experience: '',
        education: '',
        certifications: '',
        languages: '',
        hourlyRate: '',
        timeZone: 'America/Toronto',
        isActive: true
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
      experience: formData.experience,
      education: formData.education,
      certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
      languages: formData.languages.split(',').map(l => l.trim()).filter(l => l),
      hourlyRate: parseFloat(formData.hourlyRate),
      timeZone: formData.timeZone,
      isActive: formData.isActive
    }

    try {
      const url = isEditing ? `/api/consultants/${selectedConsultant?.id}` : '/api/consultants'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `Consultant ${isEditing ? 'updated' : 'created'} successfully`
        })
        setDialogOpen(false)
        fetchConsultants()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (consultantId: string) => {
    if (!confirm('Are you sure you want to delete this consultant?')) {
      return
    }

    try {
      const response = await fetch(`/api/consultants/${consultantId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Consultant deleted successfully"
        })
        fetchConsultants()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete consultant",
        variant: "destructive"
      })
    }
  }

  const filteredConsultants = consultants.filter(consultant =>
    consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultants</h1>
          <p className="text-gray-600">Manage consultation experts and their profiles</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Consultant
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search consultants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Consultants</CardTitle>
          <CardDescription>
            {filteredConsultants.length} consultant{filteredConsultants.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading consultants...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultants.map((consultant) => (
                  <TableRow key={consultant.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {consultant.avatarUrl ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={consultant.avatarUrl}
                              alt={consultant.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{consultant.name}</div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {consultant.email}
                          </div>
                          <div className="text-sm text-gray-600">{consultant.experience}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {consultant.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs mr-1">
                            {specialty}
                          </Badge>
                        ))}
                        {consultant.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{consultant.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{consultant.rating}</span>
                        <span className="text-gray-600 ml-1">({consultant.totalReviews})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${consultant.hourlyRate}/{consultant.currency}
                      </div>
                      <div className="text-sm text-gray-600">per hour</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={consultant.isActive ? 'default' : 'secondary'}>
                        {consultant.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-[100]">
                          <DropdownMenuItem onClick={() => handleOpenDialog(consultant)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/appointments/consultants/${consultant.id}/schedule`)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Manage Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(consultant.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Consultant' : 'Add New Consultant'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the consultant details' : 'Create a new consultant profile'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.smith@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1-555-0123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  placeholder="75.00"
                  required
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief professional summary..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties (comma-separated) *</Label>
                <Textarea
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                  placeholder="e.g., Canada, USA, Engineering, Business Programs"
                  rows={2}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="8+ years"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeZone">Time Zone</Label>
                  <Select value={formData.timeZone} onValueChange={(value) => setFormData(prev => ({ ...prev, timeZone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (Los Angeles)</SelectItem>
                      <SelectItem value="Europe/London">GMT (London)</SelectItem>
                      <SelectItem value="Asia/Kolkata">IST (India)</SelectItem>
                      <SelectItem value="Australia/Sydney">AEST (Sydney)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="PhD from MIT, MS from Stanford"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                  placeholder="e.g., Certified Education Consultant, IECA Member"
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages (comma-separated)</Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => setFormData(prev => ({ ...prev, languages: e.target.value }))}
                    placeholder="English, French, Spanish"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <Select value={formData.isActive.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'true' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update' : 'Create'} Consultant
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}