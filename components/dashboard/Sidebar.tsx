'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Radio,
  Users,
  CreditCard,
  Award,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react'

const navigationItems = [
  { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Reservations', href: '/admin/reservations', icon: CalendarDays },
  { name: 'Rooms & Cottages', href: '/admin/rooms', icon: BedDouble },
  { name: 'NFC Wristbands', href: '/admin/wristbands', icon: Radio },
  { name: 'Guest Management', href: '/admin/guests', icon: Users },
  { name: 'Payments & Ledger', href: '/admin/payments', icon: CreditCard },
  { name: 'Loyalty Program', href: '/admin/loyalty', icon: Award },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#14261d] text-white flex flex-col shrink-0 min-h-screen border-r-2 border-black select-none">
      {/* Brand */}
      <div className="p-5 border-b-2 border-black/60 flex items-center gap-3 bg-[#0f1d16]">
        <div className="size-8 rounded-none bg-[#f7f6ef] text-[#14261d] border-2 border-black flex items-center justify-center font-serif text-base font-bold shadow-[2px_2px_0px_#000]">
          ✳
        </div>
        <div>
          <span className="font-serif tracking-widest text-xs font-bold block text-stone-100">
            QUEEN AURORA&apos;S
          </span>
          <span className="text-[9px] tracking-[0.2em] text-[#a4b49c] block uppercase">
            Operations Suite
          </span>
        </div>
      </div>

      {/* Reception Desk Quick Launcher */}
      <div className="p-3 mx-3 my-3 bg-[#1c382a] border-2 border-black shadow-[3px_3px_0px_#000] text-xs">
        <div className="flex items-center justify-between text-emerald-300 font-semibold mb-1">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles size={12} /> Front Desk Fast-Track
          </span>
          <span className="text-[8px] bg-emerald-400 text-stone-950 font-extrabold px-1.5 py-0.2 border border-black uppercase">
            LIVE
          </span>
        </div>
        <p className="text-[10px] text-stone-300 mb-2 leading-relaxed">
          High-speed check-in, NFC tap scanner &amp; wristband assignment.
        </p>
        <Link
          href="/receptionist"
          className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-[#f7f6ef] hover:bg-white text-[#14261d] font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Open Reception Desk <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[9px] font-bold text-[#86967f] uppercase tracking-wider">
          Resort Operations
        </div>

        {navigationItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#f7f6ef] text-[#14261d] border-2 border-black shadow-[2px_2px_0px_#000]'
                  : 'text-stone-300 hover:text-white hover:bg-[#1c382a] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} className={isActive ? 'text-[#14261d]' : 'text-stone-400'} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight size={13} className="text-[#14261d]" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer link to public website */}
      <div className="p-3 border-t-2 border-black/60 bg-[#0f1d16] flex items-center justify-between text-[11px]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors"
        >
          <ExternalLink size={12} /> View Public Website
        </Link>
        <span className="text-[10px] text-stone-400 font-mono">v2.0</span>
      </div>
    </aside>
  )
}
