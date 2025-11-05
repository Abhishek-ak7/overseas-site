"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MessageSquare, User, Phone, Mail, MapPin, Calendar, Filter } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface ContactInquiry {
  id: string
  fullName: string
  email: string
  phone?: string
  studyDestination?: string
  message?: string
  source: string
  status: string
  priority: string
  assignedTo?: string
  adminNotes?: string
  respondedAt?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  in_progress: "bg-orange-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500"
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-500",
  medium: "bg-yellow-500",
  high: "bg-red-500"
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    fetchInquiries()
  }, [pagination.page, statusFilter, priorityFilter])

  const fetchInquiries = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter && priorityFilter !== 'all') params.append('priority', priorityFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/admin/contact-inquiries?${params}`)
      const data = await response.json()

      if (data.success) {
        setInquiries(data.inquiries)
        setPagination(data.pagination)
      } else {
        throw new Error(data.message || 'Failed to fetch inquiries')
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast({
        title: "Error",
        description: "Failed to load contact inquiries",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchInquiries()
  }

  const updateInquiryStatus = async (inquiryId: string, updates: Record<string, any>) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/contact-inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (result.success) {
        // Update the inquiry in the list
        setInquiries(prev => prev.map(inquiry =>
          inquiry.id === inquiryId ? result.inquiry : inquiry
        ))

        if (selectedInquiry?.id === inquiryId) {
          setSelectedInquiry(result.inquiry)
        }

        toast({
          title: "Success",
          description: "Inquiry updated successfully"
        })
      } else {
        throw new Error(result.message || 'Failed to update inquiry')
      }
    } catch (error) {
      console.error('Error updating inquiry:', error)
      toast({
        title: "Error",
        description: "Failed to update inquiry",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage and respond to customer inquiries</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold">{inquiry.fullName}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${statusColors[inquiry.status]} text-white`}>
                        {inquiry.status}
                      </Badge>
                      <Badge className={`${priorityColors[inquiry.priority]} text-white`}>
                        {inquiry.priority} priority
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {inquiry.email}
                    </div>
                    {inquiry.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {inquiry.phone}
                      </div>
                    )}
                    {inquiry.studyDestination && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {inquiry.studyDestination}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(inquiry.createdAt)}
                    </div>
                  </div>

                  {inquiry.message && (
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {inquiry.message}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Select
                    value={inquiry.status}
                    onValueChange={(value) => updateInquiryStatus(inquiry.id, { status: value })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={inquiry.priority}
                    onValueChange={(value) => updateInquiryStatus(inquiry.id, { priority: value })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} inquiries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}