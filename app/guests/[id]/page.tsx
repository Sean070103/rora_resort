'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Users,
  Calendar,
  Radio,
  Clock,
  Phone,
  Mail,
  MapPin,
  Award,
  ChevronLeft,
  Edit,
  Save,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { Guest, Reservation, Wristband, GuestAccessLog, GuestCategory } from '@/lib/types'

export default function GuestDetailPage() {
  const params = useParams()
  const guestId = params.id as string

  const [guest, setGuest] = useState<Guest | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [wristbands, setWristbands] = useState<Wristband[]>([])
  const [logs, setLogs] = useState<GuestAccessLog[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState<GuestCategory>('Regular')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState(false)

  useEffect(() => {
    if (guestId) loadGuest()
  }, [guestId])

  async function loadGuest() {
    setLoading(true)
    try {
      const res = await fetch(`/api/guests/${guestId}`)
      const data = await res.json()
      if (data.guest) {
        setGuest(data.guest)
        setFullName(data.guest.full_name)
        setEmail(data.guest.email)
        setPhone(data.guest.phone)
        setAddress(data.guest.address || '')
        setCategory(data.guest.category)
        setNotes(data.guest.notes || '')
      }
      if (data.reservations) setReservations(data.reservations)
      if (data.wristbands) setWristbands(data.wristbands)
      if (data.logs) setLogs(data.logs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch(`/api/guests/${guestId}`, {
        method: 'PUT',
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
      if (data.guest) {
        setGuest(data.guest)
        setIsEditing(false)
        setSavedFeedback(true)
        setTimeout(() => setSavedFeedback(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-stone-400">
        Loading guest profile...
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm font-semibold text-stone-800">Guest not found</p>
        <Link href="/guests">
          <Button variant="outline" size="sm" className="text-xs">
            Return to Guest Directory
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <AppShell title="Guest Profile" subtitle="Detailed guest history, stay reservations, and wristband access logs">
      <div className="space-y-6 max-w-5xl mx-auto pb-12 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/guests"
            className="size-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
              {guest.full_name}
              {guest.category === 'VIP' && (
                <Award size={20} className="text-amber-500 fill-amber-500" />
              )}
            </h1>
            <p className="text-xs text-stone-500 font-mono">Guest ID: {guest.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedFeedback && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-pulse">
              <CheckCircle2 size={14} /> Profile Saved
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs border-stone-200 gap-1.5"
          >
            <Edit size={13} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* Guest Profile Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>

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
                <label className="text-xs font-semibold text-stone-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-stone-700 block mb-1">Address / City</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-stone-700 block mb-1">Staff Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1">
                <Save size={13} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                Category
              </span>
              <Badge
                className={
                  guest.category === 'VIP'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : 'bg-teal-100 text-teal-900'
                }
              >
                {guest.category}
              </Badge>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                Phone
              </span>
              <p className="text-xs font-medium text-stone-800 flex items-center gap-1">
                <Phone size={12} className="text-stone-400" /> {guest.phone}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                Email
              </span>
              <p className="text-xs font-medium text-stone-800 flex items-center gap-1">
                <Mail size={12} className="text-stone-400" /> {guest.email}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                Registered Since
              </span>
              <p className="text-xs font-medium text-stone-800">
                {new Date(guest.registration_date).toLocaleDateString()}
              </p>
            </div>

            {guest.address && (
              <div className="md:col-span-2">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                  Address
                </span>
                <p className="text-xs text-stone-700 flex items-center gap-1">
                  <MapPin size={12} className="text-stone-400" /> {guest.address}
                </p>
              </div>
            )}

            {guest.notes && (
              <div className="md:col-span-2">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                  Special Notes
                </span>
                <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200/80">
                  {guest.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reservation History */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 px-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-teal-700" />
            <h2 className="font-bold text-sm text-stone-900">Reservation History ({reservations.length})</h2>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {reservations.length === 0 ? (
            <p className="p-6 text-xs text-stone-400 text-center">No reservations found for this guest.</p>
          ) : (
            reservations.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-teal-800">{r.reference_number}</span>
                    <strong className="text-xs text-stone-900">{r.room_or_accommodation}</strong>
                    <Badge className="text-[10px] py-0 px-1.5">{r.status}</Badge>
                  </div>
                  <p className="text-xs text-stone-500">
                    {r.check_in_date} to {r.check_out_date} • ₱{r.total_amount?.toLocaleString()} ({r.payment_status})
                  </p>
                </div>

                <Link href={`/reservations/${r.id}`}>
                  <Button size="sm" variant="outline" className="text-xs border-stone-200">
                    View
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Wristbands Assigned History */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 px-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-teal-700" />
            <h2 className="font-bold text-sm text-stone-900">Assigned NFC Wristbands ({wristbands.length})</h2>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {wristbands.length === 0 ? (
            <p className="p-6 text-xs text-stone-400 text-center">No wristbands assigned to this guest.</p>
          ) : (
            wristbands.map((w) => (
              <div key={w.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-teal-800">{w.wristband_code}</span>
                    <Badge
                      className={
                        w.status === 'Assigned'
                          ? 'bg-blue-100 text-blue-800'
                          : w.status === 'Disabled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-100 text-stone-700'
                      }
                    >
                      {w.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Token: {w.nfc_token.substring(0, 16)}... • Last Scanned:{' '}
                    {w.last_scanned_at ? new Date(w.last_scanned_at).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Access Activity Logs */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 px-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-teal-700" />
            <h2 className="font-bold text-sm text-stone-900">Guest Access & Tap History ({logs.length})</h2>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {logs.length === 0 ? (
            <p className="p-6 text-xs text-stone-400 text-center">No access events recorded yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-stone-900">{log.action_type}</span>
                  <span className="text-stone-500 ml-2">via {log.verification_method}</span>
                  <p className="text-[11px] text-stone-400">{log.notes}</p>
                </div>
                <span className="text-[11px] font-mono text-stone-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </AppShell>
  )
}
