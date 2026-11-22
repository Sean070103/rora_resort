'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Radio,
  ScanLine,
  UserCheck,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Sparkles,
  Wifi,
  Search,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Profile, UserRole } from '@/lib/types'

interface TopNavProps {
  currentUser: Profile | null
  title?: string
  subtitle?: string
}

export function TopNav({ currentUser, title, subtitle }: TopNavProps) {
  const router = useRouter()
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  async function handleSwitchRole(role: UserRole) {
    setSwitching(true)
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      setRoleMenuOpen(false)
      router.refresh()
      window.location.reload()
    } catch (err) {
      console.error(err)
    } finally {
      setSwitching(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const role = currentUser?.role || 'admin'

  return (
    <header className="h-16 px-4 md:px-8 bg-white border-b border-stone-200 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="font-serif text-lg md:text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          {title || 'Rora Resort Management'}
        </h1>
        {subtitle && <p className="text-xs text-stone-500 hidden sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Realtime Live Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
          <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Realtime Active</span>
        </div>

        {/* Quick NFC Scanner Button */}
        <Link href="/reception/scan">
          <Button
            size="sm"
            className="bg-[#0f4c5c] hover:bg-[#0c3b47] text-white text-xs gap-1.5 px-3 py-1.5 shadow-xs font-medium"
          >
            <ScanLine size={14} className="text-teal-300 animate-pulse" />
            <span className="hidden sm:inline">NFC Scanner</span>
            <span className="sm:hidden">Scan</span>
          </Button>
        </Link>

        {/* Quick QR & Manual Search */}
        <Link href="/reception/manual-verification">
          <Button
            size="sm"
            variant="outline"
            className="border-stone-200 text-stone-700 text-xs gap-1.5 px-2.5"
            title="Manual & QR Backup Search"
          >
            <Search size={14} />
            <span className="hidden md:inline">Manual / QR</span>
          </Button>
        </Link>

        {/* Role Selector & User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-colors text-xs text-stone-700"
          >
            <div className="size-6 rounded-full bg-teal-800 text-white font-bold text-[11px] flex items-center justify-center">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-semibold block leading-tight">{currentUser?.full_name || 'Staff'}</span>
              <span className="text-[10px] text-teal-700 font-mono uppercase tracking-wider block">
                {role}
              </span>
            </div>
            <ChevronDown size={14} className="text-stone-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-stone-100">
                <p className="font-semibold text-stone-900">{currentUser?.full_name}</p>
                <p className="text-[11px] text-stone-500">{currentUser?.email}</p>
                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-mono uppercase">
                  Current Role: {role}
                </div>
              </div>

              {/* Quick Role Switcher for Testing (TEST 7) */}
              <div className="p-2 border-b border-stone-100 bg-stone-50/50">
                <p className="px-2 text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Switch Active Role (Testing)
                </p>
                <div className="space-y-1">
                  <button
                    disabled={switching}
                    onClick={() => handleSwitchRole('admin')}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                      role === 'admin' ? 'bg-teal-700 text-white font-medium' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <span>Elena Rostova (Administrator)</span>
                    {role === 'admin' && <CheckCircle2 size={13} />}
                  </button>

                  <button
                    disabled={switching}
                    onClick={() => handleSwitchRole('receptionist')}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                      role === 'receptionist'
                        ? 'bg-teal-700 text-white font-medium'
                        : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <span>Marco Valerio (Receptionist)</span>
                    {role === 'receptionist' && <CheckCircle2 size={13} />}
                  </button>

                  <button
                    disabled={switching}
                    onClick={() => handleSwitchRole('management')}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                      role === 'management'
                        ? 'bg-teal-700 text-white font-medium'
                        : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <span>Sofia Alcantara (Management)</span>
                    {role === 'management' && <CheckCircle2 size={13} />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
