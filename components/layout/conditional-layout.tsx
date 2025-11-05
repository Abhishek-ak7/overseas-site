'use client'

import { usePathname } from 'next/navigation'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // Check if we're on an admin route
  const isAdminRoute = pathname?.startsWith('/admin')

  // For admin routes, return children without header/footer
  if (isAdminRoute) {
    return <>{children}</>
  }

  // For regular routes, include header and footer
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}