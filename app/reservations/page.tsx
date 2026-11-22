'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  Search,
  Plus,
  Filter,
  Radio,
  UserCheck,
  CheckCircle2,
  Clock,
  Home,
  Users,
  CreditCard,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { Reservation, ReservationStatus, Guest, AccommodationType } from '@/lib/types'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // New Reservation Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuestId, setSelectedGuestId] = useState('')
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0])
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  )
  const [roomName, setRoomName] = useState('')
  const [accommodationType, setAccommodationType] = useState<AccommodationType>('VILLA')
  const [adultsCount, setAdultsCount] = useState(2)
  const [childrenCount, setChildrenCount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(15000)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadReservations()
    fetch('/api/guests')
      .then((r) => r.json())
      .then((d) => {
        if (d.guests) {
          setGuests(d.guests)
          if (d.guests.length > 0) setSelectedGuestId(d.guests[0].id)
        }
      })
      .catch(console.error)
  }, [statusFilter])

  async function loadReservations() {
    setLoading(true)
    try {
      const statusParam = statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''
      const res = await fetch(`/api/reservations${statusParam}`)
      const data = await res.json()
      if (data.reservations) setReservations(data.reservations)
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
      const res = await fetch(`/api/reservations?q=${q}`)
      const data = await res.json()
      if (data.reservations) setReservations(data.reservations)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateReservation(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: selectedGuestId,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          room_or_accommodation: roomName,
          accommodation_type: accommodationType,
          adults_count: adultsCount,
          children_count: childrenCount,
          total_amount: totalAmount,
          amount_paid: totalAmount,
          special_requests: specialRequests,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create reservation')
        return
      }

      setModalOpen(false)
      setRoomName('')
      setSpecialRequests('')
      loadReservations()
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppShell title="Reservations" subtitle="Bookings, stay dates, guest accommodations, and assigned wristband status">
      <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
            Reservation Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Bookings, stay dates, guest accommodations, and assigned wristband status
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} /> New Reservation
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by Reference (e.g. RR-84910), Guest Name, or Room..."
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
          <span className="text-xs text-stone-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-2.5 py-1.5 bg-stone-50 text-stone-700 focus:outline-teal-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Ref Number</th>
                <th className="py-3.5 px-4">Guest</th>
                <th className="py-3.5 px-4">Stay Dates</th>
                <th className="py-3.5 px-4">Accommodation</th>
                <th className="py-3.5 px-4">Wristband</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-stone-400">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-900">
                      {r.reference_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900 text-sm">
                        {r.guest?.full_name || '—'}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {r.guest?.category} • {r.guest?.phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-stone-800 font-medium">
                        {r.check_in_date} → {r.check_out_date}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {r.adults_count} Adults, {r.children_count} Kids
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-800">{r.room_or_accommodation}</div>
                      <span className="text-[10px] text-stone-400">{r.accommodation_type}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {r.wristband ? (
                        <span className="inline-flex items-center gap-1 text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-bold text-[11px] border border-teal-200">
                          <Radio size={11} className="text-teal-600" />
                          {r.wristband.wristband_code}
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">None paired</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        className={
                          r.status === 'Checked In'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : r.status === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : r.status === 'Checked Out'
                            ? 'bg-stone-100 text-stone-700'
                            : 'bg-rose-100 text-rose-800'
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/reservations/${r.id}`}>
                        <Button size="sm" variant="outline" className="border-stone-200 text-stone-700 hover:text-teal-800 text-xs gap-1">
                          Details <ChevronRight size={13} />
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

      {/* CREATE RESERVATION MODAL */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Reservation"
        description="Book guest stay dates, room selection, and payment details."
      >
        <form onSubmit={handleCreateReservation} className="space-y-3 pt-2">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Select Guest *</label>
            <select
              required
              value={selectedGuestId}
              onChange={(e) => setSelectedGuestId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
            >
              {guests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.full_name} ({g.category} - {g.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Check-In Date *</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Check-Out Date *</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Accommodation Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Palm Garden Villa 202"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Type</label>
              <select
                value={accommodationType}
                onChange={(e) => setAccommodationType(e.target.value as AccommodationType)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
              >
                <option value="VILLA">VILLA</option>
                <option value="ROOM">ROOM</option>
                <option value="COTTAGE">COTTAGE</option>
                <option value="CABANA">CABANA</option>
                <option value="PACKAGE">PACKAGE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Adults</label>
              <input
                type="number"
                min={1}
                value={adultsCount}
                onChange={(e) => setAdultsCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Children</label>
              <input
                type="number"
                min={0}
                value={childrenCount}
                onChange={(e) => setChildrenCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Rate (PHP)</label>
              <input
                type="number"
                min={0}
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Special Requests</label>
            <textarea
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Late checkout, ocean view, extra cot..."
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold">
              {isSaving ? 'Saving...' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
    </AppShell>
  )
}
