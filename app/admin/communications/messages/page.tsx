"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MessageSquare, User, Phone, Mail, Calendar, Filter, Subject } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  fullName: string
  email: string
  phone?: string
  subject?: string
  message: string
  source: string
  status: string
  priority: string
  assignedTo?: string
  adminNotes?: string
  repliedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  read: "bg-yellow-500",
  replied: "bg-green-500",
  closed: "bg-gray-500"
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-500",
  medium: "bg-yellow-500",
  high: "bg-red-500"
}

const sourceLabels: Record<string, string> = {
  contact_form: "Contact Form",
  homepage_message: "Homepage",
  contact_page: "Contact Page"
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isUpdating, setIsUpdating] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [pagination.page, statusFilter, priorityFilter])

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter && priorityFilter !== 'all') params.append('priority', priorityFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/admin/messages?${params}`)
      const data = await response.json()

      console.log('Messages API Response:', data)
      if (data.success) {
        console.log('Messages received:', data.messages)
        setMessages(data.messages)
        setPagination(data.pagination)
      } else {
        throw new Error(data.message || 'Failed to fetch messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchMessages()
  }

  const updateMessageStatus = async (messageId: string, updates: Record<string, any>) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (result.success) {
        // Update the message in the list
        setMessages(prev => prev.map(message =>
          message.id === messageId ? result.data : message
        ))

        toast({
          title: "Success",
          description: "Message updated successfully"
        })
      } else {
        throw new Error(result.message || 'Failed to update message')
      }
    } catch (error) {
      console.error('Error updating message:', error)
      toast({
        title: "Error",
        description: "Failed to update message",
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
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Manage customer messages and communications</p>
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
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, subject, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold">{message.fullName}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${statusColors[message.status]} text-white`}>
                        {message.status}
                      </Badge>
                      <Badge className={`${priorityColors[message.priority]} text-white`}>
                        {message.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {sourceLabels[message.source] || message.source}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {message.email}
                    </div>
                    {message.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {message.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(message.createdAt)}
                    </div>
                  </div>

                  {message.subject && (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Subject className="h-4 w-4" />
                      Subject: {message.subject}
                    </div>
                  )}

                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {message.message}
                  </div>

                  {message.adminNotes && (
                    <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                      <strong>Admin Notes:</strong> {message.adminNotes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Select
                    value={message.status}
                    onValueChange={(value) => updateMessageStatus(message.id, { status: value })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={message.priority}
                    onValueChange={(value) => updateMessageStatus(message.id, { priority: value })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[100px]">
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
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} messages
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