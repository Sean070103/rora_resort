'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Radio,
  Users,
  ClipboardList,
  BarChart3,
  UserCog,
  Settings,
  ScanLine,
  Search,
  Sparkles,
  ShieldAlert,
  Waves,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Profile } from '@/lib/types'

interface SidebarNavProps {
  currentUser: Profile | null
}

export function SidebarNav({ currentUser }: SidebarNavProps) {
  const pathname = usePathname()
  const role = currentUser?.role || 'admin'

  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Reception Hub', href: '/reception', icon: Sparkles },
        { name: 'NFC Wristband Scanner', href: '/reception/scan', icon: ScanLine, highlight: true },
        { name: 'QR & Manual Verification', href: '/reception/manual-verification', icon: Search },
      ],
    },
    {
      title: 'HOSPITALITY',
      items: [
        { name: 'Reservations', href: '/reservations', icon: CalendarDays },
        { name: 'Guest Directory', href: '/guests', icon: Users },
      ],
    },
    {
      title: 'NFC ACCESS',
      items: [
        { name: 'Wristband Inventory', href: '/wristbands', icon: Radio },
        { name: 'Assign Wristband', href: '/wristbands/assign', icon: Radio },
        { name: 'Activity & Audit Logs', href: '/activity-logs', icon: ClipboardList },
      ],
    },
    {
      title: 'MANAGEMENT & ADMIN',
      items: [
        { name: 'Operational Reports', href: '/reports', icon: BarChart3 },
        ...(role === 'admin'
          ? [
              { name: 'Staff Accounts', href: '/staff', icon: UserCog, adminOnly: true },
              { name: 'Resort Settings', href: '/settings', icon: Settings, adminOnly: true },
            ]
          : []),
      ],
    },
  ]

  return (
    <aside className="w-64 bg-[#0d1b2a] text-stone-100 flex flex-col shrink-0 min-h-screen border-r border-[#1b263b] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1b263b] flex items-center gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-teal-900/30">
          <Waves size={20} className="stroke-[2.2]" />
        </div>
        <div>
          <span className="font-serif tracking-wider text-sm font-bold text-white block">
            RORA RESORT
          </span>
          <span className="text-[10px] tracking-[0.2em] text-teal-300 font-medium block uppercase">
            NFC Guest Suite
          </span>
        </div>
      </div>

      {/* Speed Scanner CTA */}
      <div className="p-3 mx-4 my-3.5 rounded-xl bg-gradient-to-br from-[#1b263b] to-[#14213d] border border-teal-500/30 shadow-inner">
        <div className="flex items-center justify-between text-teal-300 text-xs font-semibold mb-1">
          <span className="flex items-center gap-1.5">
            <ScanLine size={14} className="text-teal-400 animate-pulse" /> Android NFC Tap
          </span>
          <span className="text-[9px] bg-teal-500/20 text-teal-200 px-1.5 py-0.5 rounded font-mono font-bold">
            FAST
          </span>
        </div>
        <p className="text-[11px] text-stone-400 mb-2 leading-relaxed">
          High-speed guest identification, check-in & checkout.
        </p>
        <Link
          href="/reception/scan"
          className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition-colors shadow-sm"
        >
          <Radio size={13} className="text-white" /> Open NFC Scanner
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
        {navSections.map((sec) => (
          <div key={sec.title}>
            <p className="px-3 text-[10px] tracking-wider font-semibold text-stone-400 uppercase mb-1.5">
              {sec.title}
            </p>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all',
                      isActive
                        ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30'
                        : 'text-stone-300 hover:bg-[#1b263b]/70 hover:text-white',
                      item.highlight && !isActive && 'text-teal-400'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={16}
                        className={cn(
                          isActive ? 'text-teal-400' : 'text-stone-400',
                          item.highlight && 'text-teal-400'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.adminOnly && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded">
                        Admin
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-[#1b263b] bg-[#091422] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {currentUser?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {currentUser?.full_name || 'Front Desk'}
            </p>
            <p className="text-[10px] text-teal-400 uppercase font-mono tracking-wider">
              {role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
