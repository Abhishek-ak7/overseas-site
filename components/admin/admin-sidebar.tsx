"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  MessageSquare,
  CreditCard,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Palette,
  Building2,
  CalendarDays,
  Cloud,
  Wallet,
  Mail,
} from "lucide-react"

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(["dashboard"])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: true,
    },
    {
      id: "content",
      label: "Content Management",
      icon: FileText,
      children: [
        { label: "Overview", href: "/admin/content" },
        { label: "Page Management", href: "/admin/content/pages-management" },
        { label: "Blog Posts", href: "/admin/content/blog-posts" },
        { label: "Services", href: "/admin/content/services" },
        { label: "Features", href: "/admin/content/features" },
        { label: "Statistics", href: "/admin/content/statistics" },
        { label: "Testimonials", href: "/admin/content/testimonials" },
        { label: "Partners", href: "/admin/content/partners" },
        { label: "Journey Steps", href: "/admin/content/journey-steps" },
        { label: "Countries", href: "/admin/content/countries" },
      ],
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      children: [
        { label: "Overview", href: "/admin/appearance" },
        { label: "Hero Slides", href: "/admin/appearance/hero-slides" },
        { label: "Navigation Menus", href: "/admin/appearance/menus" },
      ],
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      href: "/admin/users",
    },
    {
      id: "courses",
      label: "Courses",
      icon: BookOpen,
      children: [
        { label: "All Courses", href: "/admin/courses" },
        { label: "Add New Course", href: "/admin/courses/new" },
      ],
    },
    {
      id: "tests",
      label: "Test Prep",
      icon: GraduationCap,
      children: [
        { label: "All Tests", href: "/admin/tests" },
        { label: "Create Test", href: "/admin/tests/new" },
      ],
    },
    {
      id: "universities",
      label: "Universities & Programs",
      icon: Building2,
      children: [
        { label: "All Universities", href: "/admin/universities" },
        { label: "Add University", href: "/admin/universities/new" },
      ],
    },
    {
      id: "events",
      label: "Events",
      icon: CalendarDays,
      href: "/admin/events",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      children: [
        { label: "All Appointments", href: "/admin/appointments" },
        { label: "Appointment Types", href: "/admin/appointments/types" },
        { label: "Consultants", href: "/admin/appointments/consultants" },
      ],
    },
    {
      id: "payments",
      label: "Payments",
      icon: CreditCard,
      href: "/admin/payments",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics",
    },
    {
      id: "communications",
      label: "Communications",
      icon: MessageSquare,
      children: [
        { label: "Contact Inquiries", href: "/admin/inquiries" },
        { label: "Consultation Requests", href: "/admin/consultations" },
        { label: "Messages", href: "/admin/communications/messages" },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      children: [
        { label: "General Settings", href: "/admin/settings" },
        { label: "Site Settings", href: "/admin/settings/site" },
        { label: "Email Settings", href: "/admin/settings/email" },
        { label: "Payment Settings", href: "/admin/settings/payments" },
        { label: "Storage Settings", href: "/admin/settings/storage" },
      ],
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BN</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">BnOverseas</h1>
            <p className="text-xs text-gray-600">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            <Button
              variant={pathname === item.href ? "default" : "ghost"}
              className={`w-full justify-start ${pathname === item.href ? "bg-primary text-white" : ""}`}
              onClick={() => {
                if (item.href) {
                  handleNavigation(item.href)
                } else if (item.children) {
                  toggleSection(item.id)
                }
              }}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
              {item.children &&
                (expandedSections.includes(item.id) ? (
                  <ChevronDown className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-2" />
                ))}
            </Button>

            {item.children && expandedSections.includes(item.id) && (
              <div className="ml-4 mt-2 space-y-1">
                {item.children.map((child, index) => (
                  <Button
                    key={index}
                    variant={pathname === child.href ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start text-sm ${
                      pathname === child.href
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => handleNavigation(child.href)}
                  >
                    {child.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
