'use client'

import React, { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { NfcScannerModal } from '@/components/nfc/NfcScannerModal'
import {
  CalendarDays,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Radio,
  Clock,
  ArrowRight,
  UserCheck,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [nfcModalOpen, setNfcModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [assignRoomModalOpen, setAssignRoomModalOpen] = useState(false)
  const [targetRoomId, setTargetRoomId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [resRes, roomsRes] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/rooms'),
      ])
      const resData = await resRes.json()
      const roomsData = await roomsRes.json()
      if (resData.reservations) setReservations(resData.reservations)
      if (roomsData.rooms) setRooms(roomsData.rooms)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        await loadData()
        if (selectedReservation?.id === id) {
          setSelectedReservation(data.reservation)
        }
      } else {
        alert(data.error || 'Failed to update reservation')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCheckIn(reservationId: string, wristbandUid?: string) {
    setActionLoading(true)
    try {
      const res = await fetch('/api/reception/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, wristbandUid }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`Guest successfully checked in! Wristband status: ACTIVE`)
        await loadData()
        setDetailsModalOpen(false)
      } else {
        alert(data.error || 'Check-in failed')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCheckOut(reservationId: string) {
    if (!confirm('Confirm check-out? This will mark the reservation completed and release the NFC wristband for reuse.')) {
      return
    }
    setActionLoading(true)
    try {
      const res = await fetch('/api/reception/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`Guest checked out! Wristband is now AVAILABLE FOR REUSE. Loyalty visit count updated.`)
        await loadData()
        setDetailsModalOpen(false)
      } else {
        alert(data.error || 'Check-out failed')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAssignRoom() {
    if (!selectedReservation || !targetRoomId) return
    setActionLoading(true)
    try {
      const room = rooms.find((r) => r.id === targetRoomId)
      const res = await fetch(`/api/reservations/${selectedReservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          roomName: room.name,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setAssignRoomModalOpen(false)
        await loadData()
      } else {
        alert(data.error || 'Failed to assign room')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleWristbandAssigned(wristband: any) {
    if (!selectedReservation || !wristband) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/wristbands/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wristbandUid: wristband.uid,
          reservationId: selectedReservation.id,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`Wristband ${wristband.label} (${wristband.uid}) linked to ${selectedReservation.guestName}!`)
        await loadData()
        setNfcModalOpen(false)
      } else {
        alert(data.error || 'Failed to assign wristband')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      r.referenceNumber.toLowerCase().includes(q) ||
      r.guestName.toLowerCase().includes(q) ||
      r.guestPhone.includes(q) ||
      r.roomName.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="flex-1 flex flex-col bg-[#f7f6ef]">
      <DashboardHeader
        title="Reservations & Bookings Management"
        subtitle="Manage accommodation reservations, status changes, room assignments, and check-ins"
      />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
            {['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all border-2 border-black rounded-none shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] ${
                    statusFilter === st
                      ? 'bg-[#14261d] text-white'
                      : 'bg-white text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Search guest, ref, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border-2 border-black rounded-none shadow-[2px_2px_0px_#000] focus:outline-none"
              />
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-white text-stone-900 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] hover:bg-stone-100 transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f6ef] text-stone-800 uppercase tracking-wider text-[10px] font-bold border-b-2 border-black">
                <tr>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Guest Details</th>
                  <th className="py-3 px-4">Accommodation</th>
                  <th className="py-3 px-4">Dates &amp; Schedule</th>
                  <th className="py-3 px-4">Financials</th>
                  <th className="py-3 px-4">NFC Wristband</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-[#f7f6ef]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {res.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{res.guestName}</div>
                      <div className="text-[10px] text-stone-600 font-mono">{res.guestPhone}</div>
                      <div className="text-[10px] text-stone-500">{res.guestEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{res.roomName}</div>
                      <div className="text-[10px] text-stone-600 font-medium">{res.guestsCount} guests</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-stone-900">
                        {res.checkInDate} → {res.checkOutDate}
                      </div>
                      <div className="text-[10px] text-stone-600 font-medium">12-hr / {res.nights} stay</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-serif font-bold text-stone-900 text-sm">
                        ₱{res.totalAmount.toLocaleString()}
                      </div>
                      {res.discountAmount > 0 && (
                        <div className="text-[10px] text-emerald-800 font-bold">
                          {res.loyaltyTierApplied} ({res.discountPercentage}% off)
                        </div>
                      )}
                      <div className="text-[10px] font-bold">
                        {res.balanceDue > 0 ? (
                          <span className="text-rose-700">
                            Due: ₱{res.balanceDue.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-800">Fully Paid</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {res.assignedWristbandUid ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="forest" className="font-mono text-[10px]">
                            <Radio size={10} className="animate-pulse" />
                            {res.assignedWristbandUid.slice(0, 8)}...
                          </Badge>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReservation(res)
                            setNfcModalOpen(true)
                          }}
                          className="text-[10px] px-2 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-black shadow-[1px_1px_0px_#000] font-bold uppercase tracking-wider"
                        >
                          + Assign NFC
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          res.status === 'CHECKED_IN'
                            ? 'forest'
                            : res.status === 'CONFIRMED'
                            ? 'success'
                            : res.status === 'PENDING'
                            ? 'warning'
                            : res.status === 'COMPLETED'
                            ? 'default'
                            : 'danger'
                        }
                      >
                        {res.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedReservation(res)
                            setDetailsModalOpen(true)
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-white text-stone-900 border border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-stone-100 active:translate-x-[1px] active:translate-y-[1px]"
                        >
                          Details
                        </button>

                        {res.status === 'PENDING' && (
                          <button
                            onClick={() => updateStatus(res.id, 'CONFIRMED')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-700 hover:bg-emerald-600 text-white border border-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                          >
                            Approve
                          </button>
                        )}

                        {res.status === 'CONFIRMED' && (
                          <button
                            onClick={() => {
                              setSelectedReservation(res)
                              if (!res.assignedWristbandUid) {
                                setNfcModalOpen(true)
                              } else {
                                handleCheckIn(res.id, res.assignedWristbandUid)
                              }
                            }}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-[11px] font-bold bg-[#14261d] hover:bg-[#1f382b] text-white border border-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                          >
                            Check In
                          </button>
                        )}

                        {res.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => handleCheckOut(res.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-[11px] font-bold bg-[#f7f6ef] text-stone-900 border border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-white active:translate-x-[1px] active:translate-y-[1px]"
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && !loading && (
              <div className="p-8 text-center text-stone-500 text-xs font-medium">
                No reservations found matching your filters.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reservation Details Dialog */}
      {selectedReservation && (
        <Dialog
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Reservation ${selectedReservation.referenceNumber}`}
          description={`Booked on ${new Date(selectedReservation.createdAt).toLocaleString()}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-[#f7f6ef] p-4 border-2 border-black shadow-[2px_2px_0px_#000]">
              <div>
                <span className="text-stone-500 uppercase text-[10px] font-bold block">Guest Name</span>
                <span className="font-serif font-bold text-stone-900 text-base">
                  {selectedReservation.guestName}
                </span>
                <div className="text-stone-700 mt-0.5 font-mono">{selectedReservation.guestPhone}</div>
                <div className="text-stone-600">{selectedReservation.guestEmail}</div>
              </div>
              <div>
                <span className="text-stone-500 uppercase text-[10px] font-bold block">Accommodation</span>
                <span className="font-serif font-bold text-stone-900 text-base">
                  {selectedReservation.roomName}
                </span>
                <div className="text-stone-700 mt-0.5 font-medium">
                  Party size: {selectedReservation.guestsCount} guests
                </div>
                <button
                  onClick={() => {
                    setTargetRoomId(selectedReservation.roomId)
                    setAssignRoomModalOpen(true)
                  }}
                  className="text-[#14261d] underline text-[11px] font-bold mt-1 inline-block"
                >
                  Change Accommodation →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 border-2 border-black bg-white shadow-[2px_2px_0px_#000]">
                <span className="text-stone-500 uppercase text-[9px] font-bold block">Check-in</span>
                <span className="font-bold text-stone-900">
                  {selectedReservation.checkInDate}
                </span>
              </div>
              <div className="p-3 border-2 border-black bg-white shadow-[2px_2px_0px_#000]">
                <span className="text-stone-500 uppercase text-[9px] font-bold block">Check-out</span>
                <span className="font-bold text-stone-900">
                  {selectedReservation.checkOutDate}
                </span>
              </div>
              <div className="p-3 border-2 border-black bg-white shadow-[2px_2px_0px_#000]">
                <span className="text-stone-500 uppercase text-[9px] font-bold block">Duration</span>
                <span className="font-bold text-stone-900">
                  12 Hours ({selectedReservation.nights} slot)
                </span>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="bg-[#f7f6ef] p-4 border-2 border-black shadow-[3px_3px_0px_#000] space-y-1.5">
              <div className="font-serif font-bold text-stone-900 text-sm mb-1">Financial Breakdown</div>
              <div className="flex justify-between text-stone-700">
                <span>Subtotal ({selectedReservation.nights} slot(s) @ ₱{selectedReservation.baseRate?.toLocaleString()}):</span>
                <span className="font-mono">₱{selectedReservation.subtotal?.toLocaleString()}</span>
              </div>
              {selectedReservation.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Loyalty Discount ({selectedReservation.loyaltyTierApplied} - {selectedReservation.discountPercentage}%):</span>
                  <span className="font-mono">-₱{selectedReservation.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-serif font-bold text-stone-900 pt-1.5 border-t border-black text-sm">
                <span>Total Amount:</span>
                <span className="font-mono">₱{selectedReservation.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Amount Paid:</span>
                <span className="font-mono">₱{selectedReservation.amountPaid?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-stone-900">Balance Due:</span>
                <span className={`font-mono ${selectedReservation.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-800'}`}>
                  ₱{selectedReservation.balanceDue?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Wristband status */}
            <div className="p-3 border-2 border-black bg-white shadow-[2px_2px_0px_#000] flex items-center justify-between">
              <div>
                <span className="text-stone-500 uppercase text-[9px] font-bold block">NFC Wristband</span>
                <div className="font-mono font-bold text-stone-900 mt-0.5">
                  {selectedReservation.assignedWristbandUid || 'No wristband assigned yet'}
                </div>
              </div>
              <button
                onClick={() => setNfcModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold bg-[#f7f6ef] hover:bg-white text-stone-900 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
              >
                <Radio size={13} />
                {selectedReservation.assignedWristbandUid ? 'Reassign NFC' : 'Scan & Assign NFC'}
              </button>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t-2 border-black flex items-center justify-between">
              <div className="flex gap-2">
                {selectedReservation.status === 'PENDING' && (
                  <button
                    onClick={() => updateStatus(selectedReservation.id, 'CONFIRMED')}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]"
                  >
                    Confirm Booking
                  </button>
                )}
                {selectedReservation.status !== 'CANCELLED' && selectedReservation.status !== 'COMPLETED' && (
                  <button
                    onClick={() => updateStatus(selectedReservation.id, 'CANCELLED')}
                    className="px-3 py-1.5 bg-rose-100 text-rose-900 hover:bg-rose-200 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {selectedReservation.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCheckIn(selectedReservation.id, selectedReservation.assignedWristbandUid)}
                    className="px-4 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]"
                  >
                    Check In Guest
                  </button>
                )}
                {selectedReservation.status === 'CHECKED_IN' && (
                  <button
                    onClick={() => handleCheckOut(selectedReservation.id)}
                    className="px-4 py-1.5 bg-stone-900 text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-stone-800"
                  >
                    Check Out &amp; Release Wristband
                  </button>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Change Accommodation Dialog */}
      <Dialog
        open={assignRoomModalOpen}
        onClose={() => setAssignRoomModalOpen(false)}
        title="Reassign Accommodation"
        description="Select an available unit for this reservation"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1.5">Available Units</label>
            <select
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
              className="w-full p-2.5 border-2 border-black bg-white text-xs font-medium focus:outline-none"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type}) — Up to {r.capacity} pax — ₱{r.basePrice.toLocaleString()} (12 Hours)
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setAssignRoomModalOpen(false)}
              className="px-3 py-1.5 bg-white text-stone-800 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000]"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignRoom}
              disabled={actionLoading}
              className="px-4 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000]"
            >
              Save Assignment
            </button>
          </div>
        </div>
      </Dialog>

      {/* NFC Scanner Modal */}
      <NfcScannerModal
        isOpen={nfcModalOpen}
        onClose={() => setNfcModalOpen(false)}
        actionLabel="Assign to This Reservation"
        onSelectWristband={handleWristbandAssigned}
      />
    </div>
  )
}
