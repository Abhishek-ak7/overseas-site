"use client"

import { useState, useEffect } from "react"
import * as LucideIcons from "lucide-react"
import Link from "next/link"

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
          icon: 'Calendar',
          iconColor: '#10B981',
          backgroundColor: '#ECFDF5',
          isAnimated: true,
          animationDuration: 2000,
          suffix: '+',
          orderIndex: 0,
          isActive: true
        },
        {
          id: 'default-2',
          label: 'University Options',
          value: '1250',
          icon: 'GraduationCap',
          iconColor: '#3B82F6',
          backgroundColor: '#EFF6FF',
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
          icon: 'BookOpen',
          iconColor: '#F59E0B',
          backgroundColor: '#FFFBEB',
          isAnimated: true,
          animationDuration: 2000,
          suffix: '+',
          orderIndex: 2,
          isActive: true
        },
        {
          id: 'default-4',
          label: 'Students Counselled',
          value: '5',
          icon: 'Users',
          iconColor: '#EF4444',
          backgroundColor: '#FEF2F2',
          isAnimated: true,
          animationDuration: 2000,
          suffix: ' M+',
          orderIndex: 3,
          isActive: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const activeStatistics = statistics.filter(stat => stat.isActive).sort((a, b) => a.orderIndex - b.orderIndex)

  if (activeStatistics.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header - Optional, can be customized from admin */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6">
            <LucideIcons.TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Trusted by Students Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our proven track record speaks for itself. Join thousands of successful students who achieved their dreams with us.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {activeStatistics.map((stat) => {
            // Get the icon component dynamically
            const IconComponent = stat.icon && stat.icon in LucideIcons
              ? (LucideIcons as any)[stat.icon]
              : LucideIcons.TrendingUp

            return (
              <div
                key={stat.id}
                className="group text-center p-6 lg:p-8 rounded-2xl bg-white shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary/20 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className="relative mb-6">
                  <div 
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: stat.backgroundColor }}
                  >
                    <IconComponent 
                      className="w-8 h-8 lg:w-10 lg:h-10"
                      style={{ color: stat.iconColor }}
                    />
                  </div>
                  
                  {/* Decorative ring */}
                  <div className="absolute inset-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full mx-auto border-2 border-dashed opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                    style={{ borderColor: stat.iconColor }}
                  />
                </div>

                {/* Value */}
                <div className="mb-2">
                  <span className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                    {stat.prefix || ''}{stat.value}{stat.suffix || ''}
                  </span>
                </div>

                {/* Label */}
                <p className="text-gray-600 font-medium text-sm lg:text-base">
                  {stat.label}
                </p>

                {/* Hover effect indicator */}
                <div className="w-0 group-hover:w-12 h-1 bg-primary rounded-full mx-auto mt-4 transition-all duration-300" />
              </div>
            )
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-16 p-8 lg:p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <LucideIcons.Rocket className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to Join Our Success Stories?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
            Start your journey to international education with personalized guidance from our expert counsellors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/contact">
            <button className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-sm hover:shadow-md">
              Get Free Counselling
            </button>
            </Link>
            <Link href="/universities">
            <button className="flex-1 px-6 py-4 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm">
              {/* Check Eligibility */}
              hi class devops
            </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}