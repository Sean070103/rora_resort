'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { Guest, GuestCategory } from '@/lib/types'

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  // New Guest Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState<GuestCategory>('Regular')
  const [notes, setNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadGuests()
  }, [categoryFilter])

  async function loadGuests() {
    setLoading(true)
    try {
      const catParam = categoryFilter !== 'ALL' ? `?category=${categoryFilter}` : ''
      const res = await fetch(`/api/guests${catParam}`)
      const data = await res.json()
      if (data.guests) setGuests(data.guests)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const q = encodeURIComponent(searchQuery.trim())
      const res = await fetch(`/api/guests?q=${q}`)
      const data = await res.json()
      if (data.guests) setGuests(data.guests)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateGuest(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          address,
          category,
          notes,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to register guest')
        return
      }

      setModalOpen(false)
      setFullName('')
      setEmail('')
      setPhone('')
      setAddress('')
      setNotes('')
      loadGuests()
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppShell title="Guest Management" subtitle="Directory of registered guests, VIP categories, and wristband access records">
      <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
            Guest Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Directory of registered guests, VIP categories, and wristband access records
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} /> Register New Guest
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search guests by name, email, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-teal-600"
            />
          </div>
          <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs px-4">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-stone-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-2.5 py-1.5 bg-stone-50 text-stone-700 focus:outline-teal-600"
          >
            <option value="ALL">All Categories</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Day Guest">Day Guest</option>
            <option value="Overnight Guest">Overnight Guest</option>
          </select>
        </div>
      </div>

      {/* Guest Directory Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Guest Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4 hidden md:table-cell">City / Address</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Registered</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-stone-400">
                    No guests match your criteria.
                  </td>
                </tr>
              ) : (
                guests.map((g) => (
                  <tr key={g.id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                        {g.category === 'VIP' && <Award size={14} className="text-amber-500 shrink-0" />}
                        <span>{g.full_name}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">{g.id}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        className={
                          g.category === 'VIP'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                            : g.category === 'Day Guest'
                            ? 'bg-cyan-100 text-cyan-900 border-cyan-200'
                            : 'bg-stone-100 text-stone-700'
                        }
                      >
                        {g.category}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="text-stone-700 flex items-center gap-1">
                          <Phone size={11} className="text-stone-400" /> {g.phone}
                        </p>
                        <p className="text-stone-500 flex items-center gap-1">
                          <Mail size={11} className="text-stone-400" /> {g.email}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 hidden md:table-cell text-stone-600">
                      {g.address || '—'}
                    </td>

                    <td className="py-3.5 px-4 hidden sm:table-cell text-stone-500 font-mono text-[11px]">
                      {new Date(g.registration_date).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/guests/${g.id}`}>
                        <Button size="sm" variant="outline" className="border-stone-200 text-stone-700 hover:text-teal-800 text-xs gap-1">
                          Profile <ChevronRight size={13} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD GUEST MODAL */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Resort Guest"
        description="Add a new guest record to the resort database."
      >
        <form onSubmit={handleCreateGuest} className="space-y-3 pt-2">
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
              placeholder="e.g. Maria Santos"
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
                placeholder="guest@example.com"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 917 000 0000"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Guest Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GuestCategory)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Day Guest">Day Guest</option>
                <option value="Overnight Guest">Overnight Guest</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Address / City</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, Country"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Staff Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Guest preferences, dietary needs, or VIP perks..."
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold">
              {isSaving ? 'Registering...' : 'Save Guest'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
    </AppShell>
  )
}
