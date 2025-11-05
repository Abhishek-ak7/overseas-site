"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function AnalyticsCharts() {
  const enrollmentData = [
    { month: "Jan", students: 120, revenue: 12000 },
    { month: "Feb", students: 150, revenue: 15000 },
    { month: "Mar", students: 180, revenue: 18000 },
    { month: "Apr", students: 220, revenue: 22000 },
    { month: "May", students: 280, revenue: 28000 },
    { month: "Jun", students: 320, revenue: 32000 },
  ]

  const courseData = [
    { name: "IELTS Prep", students: 450, color: "#E31E24" },
    { name: "TOEFL Prep", students: 320, color: "#FF6B35" },
    { name: "PTE Prep", students: 280, color: "#F7931E" },
    { name: "General English", students: 180, color: "#FFD23F" },
    { name: "Business English", students: 120, color: "#06D6A0" },
  ]

  const testPerformanceData = [
    { test: "IELTS", avgScore: 7.2, attempts: 1200 },
    { test: "TOEFL", avgScore: 85, attempts: 800 },
    { test: "PTE", avgScore: 68, attempts: 600 },
    { test: "General", avgScore: 78, attempts: 400 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="enrollment" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollment" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="students" stroke="#E31E24" fill="#E31E24" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E31E24"
                    strokeWidth={3}
                    dot={{ fill: "#E31E24", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="students"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {courseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={testPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="test" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#E31E24" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
