'use client'

import React, { useEffect, useState } from 'react'
import { SidebarNav } from './SidebarNav'
import { TopNav } from './TopNav'
import { MobileBottomNav } from './MobileBottomNav'
import { Profile } from '@/lib/types'

interface AppShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row text-stone-900 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <SidebarNav currentUser={currentUser} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <TopNav currentUser={currentUser} title={title} subtitle={subtitle} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
