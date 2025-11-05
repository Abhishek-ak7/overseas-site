"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  Clock,
  Target,
  Globe,
  Star,
  Award
} from 'lucide-react'

interface AnalyticsData {
  userGrowth: { month: string; users: number; newUsers: number }[]
  coursePerformance: { course: string; enrollments: number; completions: number; revenue: number }[]
  revenueData: { month: string; revenue: number; subscriptions: number }[]
  userActivity: { hour: string; active: number }[]
  countryDistribution: { country: string; users: number; percentage: number }[]
  testPerformance: { test: string; attempts: number; averageScore: number; completionRate: number }[]
}

export default function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else {
        // Use mock data if API fails
        setData(getMockAnalytics())
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // Use mock data on error
      setData(getMockAnalytics())
    } finally {
      setLoading(false)
    }
  }

  const getMockAnalytics = (): AnalyticsData => ({
    userGrowth: [
      { month: 'Jan', users: 400, newUsers: 80 },
      { month: 'Feb', users: 460, newUsers: 60 },
      { month: 'Mar', users: 520, newUsers: 90 },
      { month: 'Apr', users: 580, newUsers: 100 },
      { month: 'May', users: 650, newUsers: 120 },
      { month: 'Jun', users: 720, newUsers: 110 }
    ],
    coursePerformance: [
      { course: 'IELTS Preparation', enrollments: 245, completions: 187, revenue: 367500 },
      { course: 'TOEFL Mastery', enrollments: 189, completions: 142, revenue: 378000 },
      { course: 'PTE Academic', enrollments: 167, completions: 134, revenue: 250500 },
      { course: 'University Selection', enrollments: 298, completions: 267, revenue: 149000 },
      { course: 'Visa Assistance', enrollments: 342, completions: 298, revenue: 171000 }
    ],
    revenueData: [
      { month: 'Jan', revenue: 45000, subscriptions: 89 },
      { month: 'Feb', revenue: 52000, subscriptions: 104 },
      { month: 'Mar', revenue: 48000, subscriptions: 96 },
      { month: 'Apr', revenue: 61000, subscriptions: 122 },
      { month: 'May', revenue: 55000, subscriptions: 110 },
      { month: 'Jun', revenue: 67000, subscriptions: 134 }
    ],
    userActivity: [
      { hour: '00:00', active: 12 },
      { hour: '06:00', active: 45 },
      { hour: '09:00', active: 189 },
      { hour: '12:00', active: 267 },
      { hour: '15:00', active: 234 },
      { hour: '18:00', active: 298 },
      { hour: '21:00', active: 167 },
      { hour: '23:59', active: 89 }
    ],
    countryDistribution: [
      { country: 'India', users: 1247, percentage: 45 },
      { country: 'Pakistan', users: 678, percentage: 24 },
      { country: 'Bangladesh', users: 456, percentage: 16 },
      { country: 'Nepal', users: 234, percentage: 8 },
      { country: 'Sri Lanka', users: 123, percentage: 4 },
      { country: 'Others', users: 89, percentage: 3 }
    ],
    testPerformance: [
      { test: 'IELTS Mock Test', attempts: 1247, averageScore: 6.5, completionRate: 87 },
      { test: 'TOEFL Practice', attempts: 892, averageScore: 89, completionRate: 91 },
      { test: 'PTE Sample Test', attempts: 567, averageScore: 65, completionRate: 83 },
      { test: 'Free IELTS Sample', attempts: 2340, averageScore: 5.8, completionRate: 95 }
    ]
  })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  const stats = [
    {
      title: 'Total Revenue',
      value: '₹12,45,000',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: '2,847',
      change: '+8.2%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Course Completions',
      value: '1,028',
      change: '+15.3%',
      icon: Award,
      color: 'text-purple-600'
    },
    {
      title: 'Avg. Session Time',
      value: '45m 32s',
      change: '+2.4%',
      icon: Clock,
      color: 'text-orange-600'
    }
  ]

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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="text-gray-600">Monitor your platform's performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.color}`}>
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Total users and new registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data?.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity by Hour</CardTitle>
                <CardDescription>Peak usage times</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data?.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="active" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>User distribution by country</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.countryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {data?.countryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {data?.countryDistribution.map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{country.country}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{country.users.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{country.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user behavior and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data?.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>Enrollments and completion rates by course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data?.coursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#8884d8" />
                  <Bar dataKey="completions" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Monthly revenue and subscription trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data?.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Performance</CardTitle>
              <CardDescription>Test attempts and average scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.testPerformance.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{test.test}</div>
                        <div className="text-sm text-gray-600">{test.attempts} attempts</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Avg Score</div>
                          <div className="font-bold">{test.averageScore}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Completion</div>
                          <div className="font-bold">{test.completionRate}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}