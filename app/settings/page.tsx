'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Settings,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Radio,
  Building2,
  Save,
  CheckCircle2,
  Mail,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResortSettings, Profile } from '@/lib/types'
import { AppShell } from '@/components/layout/AppShell'

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [settings, setSettings] = useState<ResortSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Form State
  const [resortName, setResortName] = useState('')
  const [timezone, setTimezone] = useState('Asia/Manila')
  const [checkInTime, setCheckInTime] = useState('14:00')
  const [checkOutTime, setCheckOutTime] = useState('12:00')
  const [maxCapacity, setMaxCapacity] = useState(350)
  const [nfcEncryption, setNfcEncryption] = useState(true)
  const [requireDeposit, setRequireDeposit] = useState(true)
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const [uRes, sRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ])

      if (uRes.user) setCurrentUser(uRes.user)
      if (sRes.settings) {
        setSettings(sRes.settings)
        setResortName(sRes.settings.resort_name)
        setTimezone(sRes.settings.timezone || 'Asia/Manila')
        setCheckInTime(sRes.settings.default_check_in_time)
        setCheckOutTime(sRes.settings.default_check_out_time)
        setMaxCapacity(sRes.settings.max_resort_capacity)
        setNfcEncryption(sRes.settings.nfc_encryption_enabled)
        setRequireDeposit(sRes.settings.require_deposit)
        setContactEmail(sRes.settings.contact_email)
        setContactPhone(sRes.settings.contact_phone)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resort_name: resortName,
          timezone,
          default_check_in_time: checkInTime,
          default_check_out_time: checkOutTime,
          max_resort_capacity: Number(maxCapacity),
          nfc_encryption_enabled: nfcEncryption,
          require_deposit: requireDeposit,
          contact_email: contactEmail,
          contact_phone: contactPhone,
        }),
      })

      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // Role Access Control (TEST 7)
  if (!loading && currentUser && currentUser.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 select-none">
        <div className="size-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Access Restricted: Administrator Only
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
            Resort configuration and token security policies can only be modified by an Administrator.
            Your active role is <strong className="uppercase font-mono text-teal-800">{currentUser.role}</strong>.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs">
              Return to Operations Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Settings size={24} className="text-teal-700" />
            Resort Settings & Policies
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure resort timezone, check-in schedules, and NFC token security parameters
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-pulse">
            <CheckCircle2 size={15} /> Settings Saved
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Property Identity */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <Building2 size={15} /> Property Identity & Capacity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Resort Name</label>
                <input
                  type="text"
                  value={resortName}
                  onChange={(e) => setResortName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Maximum Resort Capacity (Guests)
                </label>
                <input
                  type="number"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Timezone & Check-In Schedule */}
          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <Clock size={15} /> Local Timezone & Standard Hours
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Local Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
                >
                  <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
                <p className="text-[10px] text-stone-400 mt-1">Timestamps stored in UTC; displayed in local time.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Standard Check-in Time
                </label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Standard Check-out Time
                </label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: NFC Token Security & Access Control */}
          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <Radio size={15} /> NFC Token & Access Security Rules
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/60 border border-teal-200/80">
                <input
                  type="checkbox"
                  id="nfcSec"
                  checked={nfcEncryption}
                  onChange={(e) => setNfcEncryption(e.target.checked)}
                  className="size-4 rounded text-teal-700 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <label htmlFor="nfcSec" className="text-xs font-bold text-teal-950 cursor-pointer">
                    Enforce Opaque Random Token Architecture
                  </label>
                  <p className="text-[11px] text-teal-800 leading-relaxed mt-0.5">
                    Never store personal guest credentials or phone numbers on NFC wristband tags. Only random 128-bit NDEF tokens are written and resolved server-side.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <input
                  type="checkbox"
                  id="reqDep"
                  checked={requireDeposit}
                  onChange={(e) => setRequireDeposit(e.target.checked)}
                  className="size-4 rounded text-teal-700 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <label htmlFor="reqDep" className="text-xs font-bold text-stone-900 cursor-pointer">
                    Require Wristband Return Verification on Check-Out
                  </label>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                    Ensures receptionists inspect wristbands during departure and release them back to Available inventory for reuse.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Contact Information */}
          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3">
              Front Desk Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-2 px-6 py-2.5 shadow-sm"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving Settings...' : 'Save Resort Configuration'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
