'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Palette,
  Navigation,
  Image,
  Layout,
  Type,
  Monitor,
  Smartphone,
  ArrowRight,
  Eye,
  Edit
} from 'lucide-react'

interface StatsData {
  heroSlides: number
  menus: number
  activeThemes: number
  customizations: number
}

export default function AppearanceDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData>({
    heroSlides: 0,
    menus: 0,
    activeThemes: 1,
    customizations: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch hero slides count
      const heroResponse = await fetch('/api/hero-slides')
      const heroData = await heroResponse.json()

      // Fetch menus count
      const menusResponse = await fetch('/api/menus')
      const menusData = await menusResponse.json()

      setStats({
        heroSlides: heroData.slides?.length || 0,
        menus: menusData.menus?.length || 0,
        activeThemes: 1, // We have one active theme system
        customizations: 5 // Site settings customizations available
      })
    } catch (error) {
      console.error('Failed to fetch appearance stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const appearanceAreas = [
    {
      title: 'Site Identity',
      description: 'Manage your site name, logo, colors, and overall branding',
      icon: Palette,
      path: '/admin/settings/site',
      stats: `${stats.customizations} settings`,
      color: 'bg-blue-500',
      features: ['Logo & Favicon', 'Site Colors', 'Typography', 'Branding']
    },
    {
      title: 'Hero Slides',
      description: 'Manage homepage hero carousel slides and content',
      icon: Image,
      path: '/admin/appearance/hero-slides',
      stats: `${stats.heroSlides} slides`,
      color: 'bg-green-500',
      features: ['Background Images', 'Headlines', 'Call-to-Actions', 'Animations']
    },
    {
      title: 'Navigation Menus',
      description: 'Create and customize navigation menus for different locations',
      icon: Navigation,
      path: '/admin/appearance/menus',
      stats: `${stats.menus} menus`,
      color: 'bg-purple-500',
      features: ['Header Menu', 'Footer Menu', 'Mobile Menu', 'Custom Menus']
    },
    {
      title: 'Theme Customization',
      description: 'Customize colors, fonts, layout, and visual appearance',
      icon: Layout,
      path: '/admin/settings/site',
      stats: 'Active theme',
      color: 'bg-orange-500',
      features: ['Color Schemes', 'Font Families', 'Layout Options', 'CSS Variables']
    },
    {
      title: 'Typography',
      description: 'Manage fonts, text sizes, and typography across the site',
      icon: Type,
      path: '/admin/settings/site',
      stats: 'Font settings',
      color: 'bg-indigo-500',
      features: ['Heading Fonts', 'Body Text', 'Font Sizes', 'Text Colors']
    },
    {
      title: 'Responsive Design',
      description: 'Preview and adjust how your site looks on different devices',
      icon: Monitor,
      path: '/admin/settings/site',
      stats: 'All devices',
      color: 'bg-pink-500',
      features: ['Desktop View', 'Tablet View', 'Mobile View', 'Responsive Settings']
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appearance</h1>
          <p className="text-gray-600">Customize the look and feel of your website</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
          </Button>
          <Button onClick={() => router.push('/admin/settings/site')}>
            <Settings className="h-4 w-4 mr-2" />
            Site Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.heroSlides}</p>
                <p className="text-sm text-gray-600">Hero Slides</p>
              </div>
              <Image className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.menus}</p>
                <p className="text-sm text-gray-600">Navigation Menus</p>
              </div>
              <Navigation className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.activeThemes}</p>
                <p className="text-sm text-gray-600">Active Theme</p>
              </div>
              <Palette className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.customizations}</p>
                <p className="text-sm text-gray-600">Customizations</p>
              </div>
              <Settings className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appearance Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appearanceAreas.map((area, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(area.path)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg ${area.color} flex items-center justify-center`}>
                  <area.icon className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline">{area.stats}</Badge>
              </div>
              <CardTitle className="text-xl">{area.title}</CardTitle>
              <CardDescription>{area.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {area.features.map((feature, idx) => (
                    <div key={idx} className="text-sm text-gray-600 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full group">
                  <span>Customize</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Theme Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Theme</CardTitle>
          <CardDescription>Your active theme and customization options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">BnOverseas Default Theme</h3>
              <p className="text-gray-600 text-sm mb-4">
                A modern, responsive theme designed for educational consultancy websites.
                Features clean typography, flexible layouts, and extensive customization options.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => router.push('/admin/settings/site')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Theme Version:</span>
                <Badge variant="outline">1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Responsive:</span>
                <Badge className="bg-green-100 text-green-800">Yes</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Customizable:</span>
                <Badge className="bg-blue-100 text-blue-800">Fully</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Device Support:</span>
                <div className="flex gap-1">
                  <Monitor className="h-4 w-4 text-gray-600" />
                  <Smartphone className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appearance Changes</CardTitle>
          <CardDescription>Latest modifications to your site's appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Site settings updated</p>
                  <p className="text-xs text-gray-500">Updated logo and primary colors</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Image className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Hero slide added</p>
                  <p className="text-xs text-gray-500">New slide for summer campaign</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">1 day ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Navigation className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Menu structure updated</p>
                  <p className="text-xs text-gray-500">Added new footer menu items</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}