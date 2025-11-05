"use client"

import { useState, useEffect } from "react"
import * as LucideIcons from "lucide-react"

interface Statistic {
  id: string
  label: string
  value: string
  icon?: string
  iconColor: string
  backgroundColor: string
  isAnimated: boolean
  animationDuration: number
  suffix?: string
  prefix?: string
  orderIndex: number
  isActive: boolean
  category?: string
}

export function StatsSection() {
  const [statistics, setStatistics] = useState<Statistic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics')
      const data = await response.json()
      setStatistics(data.statistics || [])
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      // Fallback to default statistics
      setStatistics([
        {
          id: 'default-1',
          label: 'Years of Experience',
          value: '29',
          icon: 'Users',
          iconColor: '#6B7280',
          backgroundColor: '#F3F4F6',
          isAnimated: true,
          animationDuration: 2000,
          suffix: '+',
          orderIndex: 0,
          isActive: true
        },
        {
          id: 'default-2',
          label: 'University Partners',
          value: '1250',
          icon: 'Building2',
          iconColor: '#6B7280',
          backgroundColor: '#F3F4F6',
          isAnimated: true,
          animationDuration: 2000,
          suffix: '+',
          orderIndex: 1,
          isActive: true
        },
        {
          id: 'default-3',
          label: 'Program Options',
          value: '140000',
          icon: 'GraduationCap',
          iconColor: '#6B7280',
          backgroundColor: '#F3F4F6',
          isAnimated: true,
          animationDuration: 2000,
          suffix: '+',
          orderIndex: 2,
          isActive: true
        },
        {
          id: 'default-4',
          label: 'Students Counselled',
          value: '5000000',
          icon: 'Globe',
          iconColor: '#6B7280',
          backgroundColor: '#F3F4F6',
          isAnimated: true,
          animationDuration: 2000,
          suffix: '+',
          orderIndex: 3,
          isActive: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return LucideIcons.BarChart3
    const Icon = (LucideIcons as any)[iconName]
    return Icon || LucideIcons.BarChart3
  }

  const formatValue = (stat: Statistic) => {
    const prefix = stat.prefix || ''
    const suffix = stat.suffix || ''
    return `${prefix}${stat.value}${suffix}`
  }

  if (loading) {
    return (
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (statistics.length === 0) {
    return null // Don't show empty stats section
  }

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat) => {
            const IconComponent = getIconComponent(stat.icon)
            return (
              <div key={stat.id} className="text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: stat.backgroundColor }}
                  >
                    <IconComponent
                      className="h-6 w-6"
                      style={{ color: stat.iconColor }}
                    />
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {formatValue(stat)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
