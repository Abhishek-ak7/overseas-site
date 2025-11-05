"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  showBackToHome?: boolean
}

export function AuthLayout({ children, title, subtitle, showBackToHome = false }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {showBackToHome && (
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          )}

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">BN</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <h2 className="text-4xl font-bold">Your Study Abroad Journey Starts Here</h2>
            <p className="text-xl opacity-90">
              Join over 50,000 students who achieved their dreams with our comprehensive preparation programs.
            </p>
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold">95%</div>
                <div className="text-sm opacity-80">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm opacity-80">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm opacity-80">Support</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 translate-y-32" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full transform -translate-x-16 -translate-y-16" />
      </div>
    </div>
  )
}
