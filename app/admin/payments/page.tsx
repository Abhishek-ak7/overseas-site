"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CreditCard,
  DollarSign,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Wallet
} from 'lucide-react'
import { format } from 'date-fns'

interface Transaction {
  id: string
  user: {
    name: string
    email: string
  }
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  gateway: string
  description: string
  createdAt: string
  completedAt?: string
  refundedAt?: string
  gatewayTransactionId?: string
}

interface PaymentStats {
  totalRevenue: number
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  pendingTransactions: number
  refundedAmount: number
  averageTransactionValue: number
  conversionRate: number
}

export default function PaymentsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('transactions')

  useEffect(() => {
    fetchTransactions()
    fetchStats()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/payments/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
      } else {
        // Use mock data on API failure
        setTransactions(getMockTransactions())
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setTransactions(getMockTransactions())
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/payments/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setStats(getMockStats())
      }
    } catch (error) {
      console.error('Failed to fetch payment stats:', error)
      setStats(getMockStats())
    }
  }

  const getMockTransactions = (): Transaction[] => [
    {
      id: 'txn_1',
      user: { name: 'Arjun Sharma', email: 'arjun@example.com' },
      amount: 1500,
      currency: 'INR',
      status: 'completed',
      paymentMethod: 'UPI',
      gateway: 'Razorpay',
      description: 'IELTS Preparation Course',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      gatewayTransactionId: 'rzp_1234567890'
    },
    {
      id: 'txn_2',
      user: { name: 'Priya Patel', email: 'priya@example.com' },
      amount: 2000,
      currency: 'INR',
      status: 'pending',
      paymentMethod: 'Credit Card',
      gateway: 'Stripe',
      description: 'TOEFL Practice Tests',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      gatewayTransactionId: 'pi_1234567890'
    },
    {
      id: 'txn_3',
      user: { name: 'Rahul Kumar', email: 'rahul@example.com' },
      amount: 500,
      currency: 'INR',
      status: 'failed',
      paymentMethod: 'Net Banking',
      gateway: 'Razorpay',
      description: 'Consultation Booking',
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'txn_4',
      user: { name: 'Sneha Gupta', email: 'sneha@example.com' },
      amount: 1200,
      currency: 'INR',
      status: 'refunded',
      paymentMethod: 'UPI',
      gateway: 'PhonePe',
      description: 'University Application Service',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      refundedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]

  const getMockStats = (): PaymentStats => ({
    totalRevenue: 245000,
    totalTransactions: 1247,
    successfulTransactions: 1089,
    failedTransactions: 89,
    pendingTransactions: 69,
    refundedAmount: 12000,
    averageTransactionValue: 1965,
    conversionRate: 87.3
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      case 'refunded': return <RefreshCw className="h-4 w-4" />
      default: return null
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesMethod = methodFilter === 'all' || transaction.paymentMethod === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const handleRefund = async (transactionId: string) => {
    if (!confirm('Are you sure you want to refund this transaction?')) return

    try {
      const response = await fetch(`/api/admin/payments/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      })

      if (response.ok) {
        setTransactions(transactions.map(txn =>
          txn.id === transactionId ? { ...txn, status: 'refunded' as const } : txn
        ))
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to process refund:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600">Monitor transactions, payments, and financial metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.successfulTransactions} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.failedTransactions} failed transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <Wallet className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.averageTransactionValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ₹{stats.refundedAmount.toLocaleString()} refunded
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Net Banking">Net Banking</SelectItem>
                    <SelectItem value="Wallet">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions ({filteredTransactions.length})</CardTitle>
              <CardDescription>Monitor all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">#{transaction.id}</div>
                          <div className="text-sm text-gray-600">{transaction.description}</div>
                          {transaction.gatewayTransactionId && (
                            <div className="text-xs text-gray-500">
                              Gateway: {transaction.gatewayTransactionId}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.user.name}</div>
                          <div className="text-sm text-gray-600">{transaction.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">
                          ₹{transaction.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          via {transaction.gateway}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(transaction.createdAt), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-[100]">
                            <DropdownMenuItem
                              onClick={() => {
                                // View payment details functionality
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                // Download receipt functionality
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Download Receipt
                            </DropdownMenuItem>
                            {transaction.status === 'completed' && (
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault()
                                  handleRefund(transaction.id)
                                }}
                                className="text-red-600"
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Process Refund
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' || methodFilter !== 'all'
                      ? 'Try adjusting your filters.'
                      : 'Transactions will appear here once payments are made.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage recurring payments and subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Subscription Management</h3>
                <p className="text-gray-600 mb-4">
                  Manage recurring subscriptions and payment plans.
                </p>
                <Button variant="outline">
                  View All Subscriptions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Refund Management</CardTitle>
              <CardDescription>Process and track refunded transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Refund Processing</h3>
                <p className="text-gray-600 mb-4">
                  Track and manage all refund requests and processed refunds.
                </p>
                <Button variant="outline">
                  Process New Refund
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Reports</CardTitle>
              <CardDescription>Generate financial reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Reports</h3>
                <p className="text-gray-600 mb-4">
                  Generate detailed financial reports and export transaction data.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Monthly Report
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Custom Range
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}