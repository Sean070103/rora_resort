import React from 'react'
import { DashboardSidebar } from '@/components/dashboard/Sidebar'

export const metadata = {
  title: "Queen Aurora's Garden Resort | Resort Management Dashboard",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f6ef] flex">
      {/* Minimal Neo-Brutalist Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
