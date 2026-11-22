'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Waves,
  ShieldCheck,
  UserCheck,
  Radio,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserRole } from '@/lib/types'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(roleToUse?: UserRole, emailToUse?: string) {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: roleToUse,
          email: emailToUse || email,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      if (roleToUse === 'receptionist') {
        router.push('/reception/scan')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleLogin(undefined, email)
  }

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center p-4 select-none relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 -left-20 size-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 size-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-teal-900/40 mx-auto mb-3">
            <Waves size={28} className="stroke-[2.2]" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-wide">
            RORA RESORT
          </h1>
          <p className="text-xs text-teal-300 font-mono tracking-widest uppercase mt-0.5">
            NFC Guest Identification & Access Suite
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-stone-200/80">
          <div className="mb-6">
            <h2 className="text-lg font-serif font-bold text-stone-900">Staff Portal Sign In</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter your credentials or choose a quick evaluation role preset.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="receptionist@roraresort.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-md gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
              <ArrowRight size={14} />
            </Button>
          </form>

          {/* Quick Assessment Role Presets */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Role Assessment Presets (1-Click)
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleLogin('receptionist')}
                className="w-full p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/80 text-left transition-colors flex items-center justify-between text-xs group"
              >
                <div>
                  <div className="font-bold text-teal-950 flex items-center gap-1.5">
                    <Radio size={13} className="text-teal-700" />
                    <span>Receptionist (Marco Valerio)</span>
                  </div>
                  <span className="text-[10px] text-teal-700">
                    NFC Wristband Scanner & Front Desk Check-in
                  </span>
                </div>
                <span className="text-[10px] bg-teal-700 text-white px-2 py-0.5 rounded-md font-semibold">
                  Launch
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin('admin')}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-amber-600" />
                    <span>Administrator (Elena Rostova)</span>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Full Operations, Settings, Staff Accounts & Reports
                  </span>
                </div>
                <span className="text-[10px] bg-stone-800 text-white px-2 py-0.5 rounded-md font-semibold">
                  Launch
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin('management')}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <UserCheck size={13} className="text-blue-600" />
                    <span>Management (Sofia Alcantara)</span>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Occupancy Telemetry & Analytical Reports
                  </span>
                </div>
                <span className="text-[10px] bg-stone-800 text-white px-2 py-0.5 rounded-md font-semibold">
                  Launch
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-stone-400 text-center mt-4">
          Rora Resort & Spa • Enterprise NFC Access Management
        </p>
      </div>
    </div>
  )
}
