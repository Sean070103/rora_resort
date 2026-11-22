'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ScanLine,
  Search,
  CalendarDays,
  Radio,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const pathname = usePathname()

  const tabs = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Reservations', href: '/reservations', icon: CalendarDays },
    { name: 'Scan NFC', href: '/reception/scan', icon: ScanLine, isPrimary: true },
    { name: 'Verify', href: '/reception/manual-verification', icon: Search },
    { name: 'Logs', href: '/activity-logs', icon: ClipboardList },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0d1b2a] border-t border-[#1b263b] flex items-center justify-around px-2 z-40 select-none shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = pathname === tab.href

        if (tab.isPrimary) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative -top-3 flex flex-col items-center justify-center"
            >
              <div
                className={cn(
                  'size-13 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95',
                  isActive
                    ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 ring-4 ring-teal-500/30'
                    : 'bg-gradient-to-tr from-teal-600 to-cyan-700'
                )}
              >
                <Icon size={24} className="stroke-[2.2] animate-pulse" />
              </div>
              <span className="text-[10px] font-semibold text-teal-300 mt-1">
                {tab.name}
              </span>
            </Link>
          )
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors',
              isActive ? 'text-teal-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
            )}
          >
            <Icon size={18} className={cn(isActive && 'stroke-[2.2]')} />
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
