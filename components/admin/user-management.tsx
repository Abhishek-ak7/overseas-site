"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminDropdownMenu } from '@/components/admin/admin-dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, UserPlus, Mail, Ban, CheckCircle, Loader2 } from "lucide-react"
import { UserRole } from "@prisma/client"

interface UserData {
  id: string
  email: string
  role: UserRole
  emailVerifiedAt?: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  user_profiles?: {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    country?: string | null
    city?: string | null
    avatar_url?: string | null
  } | null
}

interface UsersResponse {
  users: UserData[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
  statistics: {
    byRole: Array<{ role: UserRole; count: number }>
    byVerification: Array<{ verified: boolean; count: number }>
    total: number
  }
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statistics, setStatistics] = useState<UsersResponse['statistics'] | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const fetchUsers = async (role?: UserRole, search?: string, page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      
      if (role && role !== 'ALL' as any) {
        params.append('role', role)
      }
      
      if (search && search.trim()) {
        params.append('search', search.trim())
      }
      
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.')
        } else {
          throw new Error(`Failed to fetch users: ${response.statusText}`)
        }
      }

      const data: UsersResponse = await response.json()
      setUsers(data.users)
      setStatistics(data.statistics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const roleFilter = activeTab === 'all' ? undefined : activeTab.toUpperCase() as UserRole
    fetchUsers(roleFilter, searchTerm, currentPage)
  }, [activeTab, searchTerm, currentPage])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      const roleFilter = activeTab === 'all' ? undefined : activeTab.toUpperCase() as UserRole
      fetchUsers(roleFilter, searchTerm, 1)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const getStatusColor = (isVerified: boolean) => {
    return isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "bg-purple-100 text-purple-800"
      case UserRole.ADMIN:
        return "bg-purple-100 text-purple-800"
      case UserRole.INSTRUCTOR:
        return "bg-blue-100 text-blue-800"
      case UserRole.STUDENT:
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (user: UserData) => {
    const firstName = user.user_profiles?.first_name || ''
    const lastName = user.user_profiles?.last_name || ''
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return `${first}${last}`.toUpperCase() || '??'
  }

  const getUserName = (user: UserData) => {
    const firstName = user.user_profiles?.first_name || ''
    const lastName = user.user_profiles?.last_name || ''
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }
    return user.email
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all users, roles, and permissions</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">
                All Users ({statistics?.total || 0})
              </TabsTrigger>
              <TabsTrigger value="student">
                Students ({statistics?.byRole.find(r => r.role === 'STUDENT')?.count || 0})
              </TabsTrigger>
              <TabsTrigger value="instructor">
                Instructors ({statistics?.byRole.find(r => r.role === 'INSTRUCTOR')?.count || 0})
              </TabsTrigger>
              <TabsTrigger value="admin">
                Admins ({statistics?.byRole.find(r => r.role === 'ADMIN')?.count || 0})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === 'all' ? 'All Users' : 
                   activeTab === 'student' ? 'Students' :
                   activeTab === 'instructor' ? 'Instructors' : 'Admins'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">{error}</p>
                    <Button 
                      onClick={() => fetchUsers()} 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                )}
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading users...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage 
                                    src={user.user_profiles?.avatar_url || "/placeholder.svg"} 
                                    alt={getUserName(user)} 
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(user)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {getUserName(user)}
                                  </div>
                                  <div className="text-sm text-gray-600">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRoleColor(user.role)}>
                                {user.role.toLowerCase().replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(!!user.emailVerifiedAt)}>
                                {user.emailVerifiedAt ? 'Verified' : 'Unverified'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatDate(user.createdAt)}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              <div className="text-sm text-gray-500">
                                <div>{user.user_profiles?.country || 'N/A'}</div>
                                <div>{user.user_profiles?.phone || 'N/A'}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <AdminDropdownMenu
                                size="md"
                                debugId={`user-${user.id}`}
                                actions={[
                                  {
                                    label: 'View Profile',
                                    icon: CheckCircle,
                                    onClick: () => {
                                      // TODO: Implement view profile functionality
                                      console.log('View profile for user:', user.id)
                                    }
                                  },
                                  {
                                    label: 'Send Message',
                                    icon: Mail,
                                    onClick: () => {
                                      // TODO: Implement send message functionality
                                      console.log('Send message to user:', user.email)
                                    }
                                  },
                                  {
                                    label: user.emailVerifiedAt ? 'Suspend User' : 'Verify User',
                                    icon: Ban,
                                    onClick: () => {
                                      // TODO: Implement suspend/verify user functionality
                                      const action = user.emailVerifiedAt ? 'suspend' : 'verify'
                                      console.log(`${action} user:`, user.id)
                                      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} user functionality coming soon`)
                                    },
                                    className: 'text-red-600',
                                    separator: true
                                  }
                                ]}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
}
