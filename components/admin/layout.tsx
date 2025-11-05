'use client'

import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-dashboard min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 z-10">
        <AdminSidebar />
      </div>

      {/* Main content area */}
      <div className="admin-main-content flex-1 ml-64">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <AdminHeader />
        </div>

        {/* Page content */}
        <main className="admin-content-area p-6 pb-20 min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}