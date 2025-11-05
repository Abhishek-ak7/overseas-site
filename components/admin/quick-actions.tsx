"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, BookOpen, Calendar, MessageSquare, FileText } from "lucide-react"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      label: "Add New Course",
      icon: BookOpen,
      href: "/admin/courses/new",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Create Test",
      icon: Plus,
      href: "/admin/tests/new",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      label: "Manage Users",
      icon: Users,
      href: "/admin/users",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      label: "View Schedule",
      icon: Calendar,
      href: "/admin/appointments/schedule",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      label: "Send Message",
      icon: MessageSquare,
      href: "/admin/communications/messages",
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      label: "Create Blog Post",
      icon: FileText,
      href: "/admin/content/blog/new",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow bg-transparent"
              onClick={() => router.push(action.href)}
            >
              <div className={`p-2 rounded-lg text-white ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-xs text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
