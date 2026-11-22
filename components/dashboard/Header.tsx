'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Radio, ShieldCheck, UserCircle2, LogOut, ChevronDown, ScanLine } from 'lucide-react'
import { NfcScannerModal } from '@/components/nfc/NfcScannerModal'

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [nfcModalOpen, setNfcModalOpen] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user)
      })
      .catch(console.error)
  }, [])

  async function switchRole(role: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (data.user) {
        setCurrentUser(data.user)
        setRoleDropdownOpen(false)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <>
      <header className="h-18 px-8 bg-white border-b-2 border-black flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="font-serif text-xl font-bold text-stone-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Quick NFC Scan Button */}
          <button
            onClick={() => setNfcModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <ScanLine size={14} className="text-emerald-400" />
            <span>NFC Scan</span>
          </button>

          {/* User profile & Role switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-[#f7f6ef] border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-white text-xs font-semibold text-stone-800 transition-colors"
            >
              <div className="size-6 bg-[#14261d] text-white flex items-center justify-center font-bold text-xs border border-black">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="leading-tight">{currentUser?.name || 'Admin User'}</div>
                <div className="text-[9px] font-mono font-bold text-stone-500 uppercase">
                  {currentUser?.role || 'ADMIN'}
                </div>
              </div>
              <ChevronDown size={13} className="text-stone-500" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-2 z-50 text-xs">
                <div className="p-2 border-b border-stone-200 mb-1">
                  <div className="font-bold text-stone-900">{currentUser?.name}</div>
                  <div className="text-[10px] text-stone-500">{currentUser?.email}</div>
                </div>

                <div className="py-1">
                  <div className="px-2 py-1 text-[9px] font-mono uppercase font-bold text-stone-400">
                    Switch Active Role
                  </div>
                  {['ADMIN', 'RECEPTIONIST', 'CASHIER'].map((r) => (
                    <button
                      key={r}
                      onClick={() => switchRole(r)}
                      className={`w-full text-left px-2 py-1.5 rounded-none font-medium flex items-center justify-between transition-colors ${
                        currentUser?.role === r
                          ? 'bg-[#14261d] text-white'
                          : 'hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <span>{r}</span>
                      {currentUser?.role === r && <span className="text-[10px]">●</span>}
                    </button>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 font-semibold"
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* NFC Scanner Modal */}
      {nfcModalOpen && (
        <NfcScannerModal
          isOpen={nfcModalOpen}
          onClose={() => setNfcModalOpen(false)}
          onScanSuccess={(uid) => {
            setNfcModalOpen(false)
            router.push(`/admin/wristbands?scannedUid=${encodeURIComponent(uid)}`)
          }}
        />
      )}
    </>
  )
}
