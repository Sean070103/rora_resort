'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  UserCog,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Profile, UserRole } from '@/lib/types'
import { AppShell } from '@/components/layout/AppShell'

export default function StaffPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  // Add Staff Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('receptionist')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadStaff()
  }, [])

  async function loadStaff() {
    setLoading(true)
    try {
      const [uRes, pRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/staff').then((r) => r.json()),
      ])

      if (uRes.user) setCurrentUser(uRes.user)
      if (pRes.profiles) setProfiles(pRes.profiles)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateStaff(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          role,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create staff member')
        return
      }

      setModalOpen(false)
      setFullName('')
      setEmail('')
      setPhone('')
      loadStaff()
    } catch (err: any) {
      setErrorMessage(err.message)
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
            Staff management and system accounts are restricted to resort Administrators. Your current role is{' '}
            <strong className="uppercase font-mono text-teal-800">{currentUser.role}</strong>.
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
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <UserCog size={24} className="text-teal-700" />
            Staff & Front Desk Accounts
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage resort staff access permissions, receptionist accounts, and administrative roles
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} /> Add Staff Account
        </Button>
      </div>

      {/* Staff List Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-teal-50/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">
                        {p.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <strong className="text-sm text-stone-900">{p.full_name}</strong>
                        <span className="text-[10px] text-stone-400 font-mono block">{p.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      className={
                        p.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                          : p.role === 'management'
                          ? 'bg-blue-100 text-blue-900 border-blue-200'
                          : 'bg-teal-100 text-teal-900 border-teal-200'
                      }
                    >
                      {p.role.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-stone-700 font-mono text-[11px]">
                    {p.email}
                  </td>

                  <td className="py-3.5 px-4 text-stone-600">
                    {p.phone || '—'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-800 text-[11px] font-medium">
                      <span className="size-2 rounded-full bg-emerald-500" /> Active
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Staff Account"
        description="Add a new staff member to the resort management system."
      >
        <form onSubmit={handleCreateStaff} className="space-y-3 pt-2">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Carlo Gomez"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@roraresort.ph"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 917 000 0000"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
            >
              <option value="receptionist">Receptionist (NFC Scanner & Front Desk Check-In)</option>
              <option value="management">Management (Occupancy, Reports, Analytics)</option>
              <option value="admin">Administrator (Full Dashboard, Settings, Staff)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold">
              {isSaving ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
