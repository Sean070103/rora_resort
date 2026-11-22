'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Radio, Search, UserCheck, CalendarDays, CreditCard, LogOut,
  CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Zap,
  Shield, Clock, Users, BedDouble
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { NfcScannerModal } from '@/components/nfc/NfcScannerModal'
import { Dialog } from '@/components/ui/dialog'

export default function ReceptionistPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)
  const [nfcModalOpen, setNfcModalOpen] = useState(false)
  const [nfcScanResult, setNfcScanResult] = useState<any>(null)
  const [checkInModalOpen, setCheckInModalOpen] = useState(false)
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [todayActivity, setTodayActivity] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [wristbandToAssign, setWristbandToAssign] = useState<any>(null)

  // Payment form
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('CASH')
  const [payType, setPayType] = useState('BALANCE')
  const [payRef, setPayRef] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    try {
      const [userRes, resRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/reservations'),
      ])
      const userData = await userRes.json()
      const resData = await resRes.json()
      if (userData.user) setCurrentUser(userData.user)
      if (resData.reservations) {
        setReservations(resData.reservations)
        // Today's activity
        const today = '2026-11-21'
        setTodayActivity(
          resData.reservations.filter(
            (r: any) => r.checkInDate === today || r.checkOutDate === today
          )
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchError('')
    setSearchResult(null)
    try {
      const res = await fetch(`/api/reservations/lookup?query=${encodeURIComponent(searchQuery.trim())}`)
      const data = await res.json()
      if (data.reservation) {
        setSearchResult(data.reservation)
        setSelectedReservation(data.reservation)
      } else {
        setSearchError('No active reservation found matching your query')
      }
    } catch (err: any) {
      setSearchError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  async function handleCheckIn() {
    if (!selectedReservation) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/reception/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: selectedReservation.id,
          wristbandUid: wristbandToAssign?.uid,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedReservation(data.reservation)
        setSearchResult(data.reservation)
        setCheckInModalOpen(false)
        setWristbandToAssign(null)
        await loadInitialData()
      } else {
        alert(data.error || 'Check-in failed')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!selectedReservation) return
    if (!confirm(`Confirm checkout for ${selectedReservation.guestName}? This will mark their wristband as AVAILABLE FOR REUSE.`)) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/reception/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: selectedReservation.id }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedReservation(data.reservation)
        setSearchResult(data.reservation)
        setCheckOutModalOpen(false)
        await loadInitialData()
      } else { alert(data.error || 'Check-out failed') }
    } catch (err: any) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  async function handlePayment() {
    if (!selectedReservation || !payAmount) { alert('Amount required'); return }
    setActionLoading(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: selectedReservation.id,
          amount: Number(payAmount),
          paymentMethod: payMethod,
          paymentType: payType,
          transactionRef: payRef,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedReservation(data.reservation)
        setSearchResult(data.reservation)
        setPaymentModalOpen(false)
        setPayAmount('')
        setPayRef('')
        await loadInitialData()
      } else { alert(data.error || 'Payment failed') }
    } catch (err: any) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  function handleNfcResult(wristband: any, reservation?: any) {
    if (wristband) {
      setWristbandToAssign(wristband)
      if (reservation) {
        setSelectedReservation(reservation)
        setSearchResult(reservation)
      }
    }
  }

  const statusVariant: Record<string, any> = {
    PENDING: 'warning', CONFIRMED: 'success', CHECKED_IN: 'forest', COMPLETED: 'default', CANCELLED: 'danger'
  }

  return (
    <div className="min-h-screen bg-[#f7f6ef] flex flex-col">
      {/* Receptionist Header */}
      <header className="h-16 bg-[#14261d] text-white px-6 flex items-center justify-between border-b-2 border-black sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="size-7 bg-[#f7f6ef] text-[#14261d] border-2 border-black flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_#000]">
            ✳
          </div>
          <div>
            <div className="font-serif text-sm font-bold tracking-wide">Reception Desk Terminal</div>
            <div className="text-[9px] text-[#a4b49c] uppercase tracking-widest font-semibold">Queen Aurora&apos;s Garden Resort</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setNfcModalOpen(true)}
            className="bg-[#f7f6ef] hover:bg-white text-[#14261d] text-xs font-bold px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 transition-all">
            <Radio size={13} className="animate-pulse text-emerald-700" /> Scan NFC Wristband
          </button>
          <div className="text-xs text-stone-200 flex items-center gap-2 border-l border-white/20 pl-3">
            <Shield size={13} className="text-emerald-400" />
            <span className="font-bold">{currentUser?.name || 'Reception Staff'}</span>
            <span className="text-stone-400">· {currentUser?.role || 'RECEPTIONIST'}</span>
          </div>
          <Link href="/admin" className="text-xs text-stone-300 font-bold hover:text-white transition-colors underline ml-2">Admin Dashboard →</Link>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Search & Guest Card */}
        <div className="lg:col-span-2 space-y-5">

          {/* Quick Search */}
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-2 mb-4">
              <Search size={16} className="text-[#14261d]" />
              <h2 className="font-serif text-base font-bold text-stone-900">Quick Guest &amp; Reservation Lookup</h2>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Ref# (QA-89214), phone, or guest name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                className="flex-1 px-4 py-2 text-xs bg-white border-2 border-black font-mono focus:outline-none"
              />
              <button onClick={handleSearch} disabled={searching}
                className="bg-[#14261d] hover:bg-[#1f382b] text-white px-5 py-2 text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]">
                {searching ? 'Searching...' : 'Look Up'}
              </button>
            </div>
            {searchError && (
              <div className="mt-3 flex items-center gap-2 text-rose-700 font-bold text-xs">
                <AlertTriangle size={13} /> {searchError}
              </div>
            )}
          </div>

          {/* NFC Scan Result Card */}
          {wristbandToAssign && !searchResult && (
            <div className="border-2 border-black bg-emerald-100 p-5 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center gap-2 text-emerald-950 font-bold mb-2">
                <Radio size={16} className="animate-pulse" />
                <span className="text-sm">NFC Wristband Detected</span>
              </div>
              <div className="font-mono text-stone-900 text-sm font-bold">{wristbandToAssign.uid}</div>
              <div className="text-xs text-stone-700 font-medium mt-1">Label: {wristbandToAssign.label} · Status: {wristbandToAssign.status}</div>
              <div className="text-xs text-stone-800 font-bold mt-2">Search a reservation above to link this wristband to a guest.</div>
            </div>
          )}

          {/* Guest Reservation Card */}
          {searchResult && (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000]">
              <div className="p-5 border-b-2 border-black bg-[#f7f6ef] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-[#14261d] text-white border-2 border-black flex items-center justify-center font-serif text-lg font-bold shadow-[2px_2px_0px_#000]">
                    {searchResult.guestName[0]}
                  </div>
                  <div>
                    <div className="font-serif text-lg font-bold text-stone-900">{searchResult.guestName}</div>
                    <div className="text-xs text-stone-600 font-medium">{searchResult.guestPhone} · {searchResult.guestEmail}</div>
                  </div>
                </div>
                <Badge variant={statusVariant[searchResult.status]}>{searchResult.status}</Badge>
              </div>

              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-stone-500 uppercase text-[9px] font-bold tracking-wider mb-1">Ref Number</div>
                  <div className="font-mono font-bold text-stone-900 text-sm">{searchResult.referenceNumber}</div>
                </div>
                <div>
                  <div className="text-stone-500 uppercase text-[9px] font-bold tracking-wider mb-1">Accommodation</div>
                  <div className="font-bold text-stone-900">{searchResult.roomName}</div>
                  <div className="text-stone-600">{searchResult.guestsCount} guests</div>
                </div>
                <div>
                  <div className="text-stone-500 uppercase text-[9px] font-bold tracking-wider mb-1">Stay Schedule</div>
                  <div className="font-bold text-stone-900">{searchResult.checkInDate}</div>
                  <div className="text-stone-600 font-medium">12-hr ({searchResult.nights} slot)</div>
                </div>
                <div>
                  <div className="text-stone-500 uppercase text-[9px] font-bold tracking-wider mb-1">NFC Wristband</div>
                  {searchResult.assignedWristbandUid
                    ? <div className="font-mono text-xs text-emerald-800 font-bold flex items-center gap-1">
                        <Radio size={11} className="animate-pulse" /> {searchResult.assignedWristbandUid.slice(0,11)}...
                      </div>
                    : <div className="text-stone-400 italic">Not assigned</div>}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="px-5 pb-4">
                <div className="p-3 bg-[#f7f6ef] border-2 border-black grid grid-cols-3 gap-3 text-xs text-center shadow-[2px_2px_0px_#000]">
                  <div>
                    <div className="text-stone-500 uppercase text-[9px] font-bold">Total Amount</div>
                    <div className="font-serif font-bold text-stone-900 text-sm">₱{searchResult.totalAmount?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-stone-500 uppercase text-[9px] font-bold">Amount Paid</div>
                    <div className="font-serif font-bold text-emerald-800 text-sm">₱{searchResult.amountPaid?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-stone-500 uppercase text-[9px] font-bold">Balance Due</div>
                    <div className={`font-serif font-bold text-sm ${searchResult.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-800'}`}>
                      {searchResult.balanceDue > 0 ? `₱${searchResult.balanceDue.toLocaleString()}` : 'PAID'}
                    </div>
                  </div>
                </div>

                {searchResult.discountAmount > 0 && (
                  <div className="mt-2 text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    Loyalty Discount Applied: {searchResult.loyaltyTierApplied} ({searchResult.discountPercentage}% off) = -₱{searchResult.discountAmount?.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t-2 border-black bg-[#f7f6ef] flex flex-wrap gap-2">
                {/* Assign NFC */}
                <button onClick={() => setNfcModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5">
                  <Radio size={12} />
                  {searchResult.assignedWristbandUid ? 'Reassign Wristband' : '+ Assign NFC Wristband'}
                </button>

                {/* Check In */}
                {(searchResult.status === 'PENDING' || searchResult.status === 'CONFIRMED') && (
                  <button onClick={() => setCheckInModalOpen(true)}
                    className="px-3 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5">
                    <UserCheck size={13} /> Check In Guest
                  </button>
                )}

                {/* Check Out */}
                {searchResult.status === 'CHECKED_IN' && (
                  <button onClick={() => setCheckOutModalOpen(true)}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5">
                    <LogOut size={13} /> Check Out &amp; Release Wristband
                  </button>
                )}

                {/* Collect Payment */}
                {searchResult.balanceDue > 0 && searchResult.status !== 'CANCELLED' && (
                  <button onClick={() => { setPayAmount(String(searchResult.balanceDue)); setPaymentModalOpen(true) }}
                    className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5">
                    <CreditCard size={13} /> Collect ₱{searchResult.balanceDue?.toLocaleString()}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Today's Dashboard */}
        <div className="space-y-5">

          {/* Quick NFC Scan Card */}
          <div className="bg-[#14261d] border-2 border-black p-5 text-white shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-2 mb-3">
              <Radio size={18} className="text-emerald-300 animate-pulse" />
              <h3 className="font-serif text-base font-bold text-white">NFC Fast-Track</h3>
              <span className="ml-auto text-[9px] bg-emerald-400 text-stone-950 px-2 py-0.5 border border-black font-extrabold uppercase">LIVE</span>
            </div>
            <p className="text-xs text-stone-300 mb-4 leading-relaxed font-medium">
              Tap a physical wristband on the USB contactless reader to instantly fetch guest data, check reservations, or settle remaining balances.
            </p>
            <button onClick={() => setNfcModalOpen(true)}
              className="w-full py-2 bg-[#f7f6ef] hover:bg-white text-[#14261d] font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-1.5 transition-all">
              <Zap size={13} /> Launch NFC Scanner Modal
            </button>
          </div>

          {/* Today's Arrivals */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000]">
            <div className="p-4 border-b-2 border-black bg-[#f7f6ef]">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-[#14261d]" />
                <h3 className="font-serif text-sm font-bold text-stone-900">Today&apos;s Arrivals &amp; Departures</h3>
              </div>
            </div>
            <div className="divide-y divide-black/10 max-h-80 overflow-y-auto">
              {todayActivity.length === 0 ? (
                <div className="p-4 text-xs text-stone-500 text-center italic font-medium">No arrivals or departures today.</div>
              ) : todayActivity.map(res => (
                <div key={res.id}
                  className="p-3 hover:bg-[#f7f6ef] cursor-pointer transition-colors"
                  onClick={() => { setSelectedReservation(res); setSearchResult(res); setSearchQuery(res.referenceNumber) }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-stone-900">{res.referenceNumber}</span>
                    <Badge variant={statusVariant[res.status]} className="text-[9px]">{res.status}</Badge>
                  </div>
                  <div className="text-xs font-bold text-stone-900">{res.guestName}</div>
                  <div className="text-[10px] text-stone-600 flex items-center gap-2 mt-0.5 font-medium">
                    <span>{res.checkInDate === '2026-11-21' ? '📥 Arrival' : '📤 Departure'}</span>
                    <span>·</span>
                    <span>{res.roomName}</span>
                  </div>
                  {res.balanceDue > 0 && (
                    <div className="text-[10px] text-rose-700 font-bold mt-1">⚠ Balance: ₱{res.balanceDue.toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Checked In', value: reservations.filter(r => r.status === 'CHECKED_IN').length, icon: Users, color: 'text-emerald-800' },
              { label: 'Pending Today', value: reservations.filter(r => r.status === 'PENDING').length, icon: Clock, color: 'text-amber-800' },
            ].map(s => (
              <div key={s.label} className="bg-white border-2 border-black p-3 text-center shadow-[3px_3px_0px_#000]">
                <s.icon size={18} className={`mx-auto mb-1 ${s.color}`} />
                <div className={`text-xl font-serif font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-stone-600 font-bold uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NFC Scanner Modal */}
      <NfcScannerModal isOpen={nfcModalOpen} onClose={() => { setNfcModalOpen(false); loadInitialData() }}
        onSelectWristband={handleNfcResult} actionLabel="Use This Wristband" />

      {/* Check-in Confirmation */}
      {selectedReservation && (
        <Dialog open={checkInModalOpen} onClose={() => setCheckInModalOpen(false)}
          title="Confirm Guest Check-In" description={`Reservation ${selectedReservation.referenceNumber}`}>
          <div className="space-y-4 text-xs">
            <div className="bg-[#f7f6ef] border-2 border-black p-4 shadow-[2px_2px_0px_#000]">
              <div className="font-serif font-bold text-stone-900 text-base">{selectedReservation.guestName}</div>
              <div className="text-stone-700 mt-1 font-medium">{selectedReservation.roomName} · 12-Hour Stay</div>
              {selectedReservation.assignedWristbandUid
                ? <div className="mt-2 flex items-center gap-1.5 text-emerald-800 font-mono font-bold"><Radio size={12} className="animate-pulse" /> NFC Wristband: {selectedReservation.assignedWristbandUid}</div>
                : wristbandToAssign
                  ? <div className="mt-2 flex items-center gap-1.5 text-emerald-800 font-mono font-bold"><Radio size={12} /> Will assign: {wristbandToAssign.uid}</div>
                  : <div className="mt-2 text-amber-800 font-bold flex items-center gap-1.5"><AlertTriangle size={12} /> No NFC wristband assigned. Check-in without wristband or scan one first.</div>}
            </div>
            {selectedReservation.balanceDue > 0 && (
              <div className="bg-amber-100 border-2 border-black p-3 text-amber-950 flex items-center gap-2 font-bold shadow-[2px_2px_0px_#000]">
                <AlertTriangle size={14} className="shrink-0" />
                <span>Outstanding balance of <strong>₱{selectedReservation.balanceDue.toLocaleString()}</strong> must be settled.</span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t-2 border-black">
              <button onClick={() => setCheckInModalOpen(false)} className="px-3 py-1.5 bg-white text-stone-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">Cancel</button>
              <button onClick={handleCheckIn} disabled={actionLoading}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">
                {actionLoading ? 'Checking In...' : 'Confirm Check-In'}
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Check-out Confirmation */}
      {selectedReservation && (
        <Dialog open={checkOutModalOpen} onClose={() => setCheckOutModalOpen(false)}
          title="Process Guest Check-Out" description={`Reservation ${selectedReservation.referenceNumber}`}>
          <div className="space-y-4 text-xs">
            <div className="bg-[#f7f6ef] border-2 border-black p-4 space-y-2 shadow-[2px_2px_0px_#000]">
              <div className="font-serif font-bold text-stone-900 text-base">{selectedReservation.guestName}</div>
              <div className="text-stone-700 font-medium">{selectedReservation.roomName}</div>
              {selectedReservation.assignedWristbandUid && (
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold font-mono">
                  <Radio size={12} /> Wristband {selectedReservation.assignedWristbandUid} will be <strong>released for reuse</strong>
                </div>
              )}
              <div className="text-[11px] text-stone-600 pt-1 font-medium">Guest loyalty visit count will be automatically incremented upon checkout.</div>
            </div>
            {selectedReservation.balanceDue > 0 && (
              <div className="bg-rose-100 border-2 border-black p-3 text-rose-950 flex items-center gap-2 font-bold shadow-[2px_2px_0px_#000]">
                <AlertTriangle size={14} className="shrink-0" />
                <span>UNSETTLED BALANCE: ₱{selectedReservation.balanceDue.toLocaleString()} — Please collect before completing checkout.</span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t-2 border-black">
              <button onClick={() => setCheckOutModalOpen(false)} className="px-3 py-1.5 bg-white text-stone-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">Cancel</button>
              <button onClick={handleCheckOut} disabled={actionLoading}
                className="px-4 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">
                {actionLoading ? 'Processing...' : 'Complete Check-Out & Release Wristband'}
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Quick Payment */}
      {selectedReservation && (
        <Dialog open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)}
          title="Collect Payment" description={`${selectedReservation.referenceNumber} · ${selectedReservation.guestName}`}>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Amount (₱)</label>
                <input type="number" min={1} value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  className="w-full p-2 border-2 border-black bg-white text-xs font-mono font-bold focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Reference #</label>
                <input type="text" placeholder="GCash/bank ref..." value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full p-2 border-2 border-black bg-white text-xs font-mono focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Method</label>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                  className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none">
                  <option value="CASH">Cash</option>
                  <option value="GCASH">GCash</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Type</label>
                <select value={payType} onChange={e => setPayType(e.target.value)}
                  className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none">
                  <option value="DEPOSIT">Deposit</option>
                  <option value="BALANCE">Balance Payment</option>
                  <option value="FULL_PAYMENT">Full Payment</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t-2 border-black">
              <button onClick={() => setPaymentModalOpen(false)} className="px-3 py-1.5 bg-white text-stone-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">Cancel</button>
              <button onClick={handlePayment} disabled={actionLoading}
                className="px-4 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">
                {actionLoading ? 'Processing...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
