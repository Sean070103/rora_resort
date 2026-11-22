'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Search,
  QrCode,
  Camera,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Home,
  Calendar,
  Users,
  CreditCard,
  Radio,
  Clock,
  Sparkles,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { Guest, Reservation, Wristband } from '@/lib/types'
import confetti from 'canvas-confetti'

export default function ManualVerificationPage() {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'QR_SCANNER'>('SEARCH')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [scanMode, setScanMode] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN')

  // Search Results & Selected Reservation
  const [searchResults, setSearchResults] = useState<Reservation[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [selectedWristband, setSelectedWristband] = useState<Wristband | null>(null)

  // Status message and UI state
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [statusType, setStatusType] = useState<'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING'>('INFO')

  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false)
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const [releaseWristband, setReleaseWristband] = useState<boolean>(true)
  const [staffNotes, setStaffNotes] = useState<string>('Manual guest identity verified by front desk receptionist')

  // QR Camera Scanner refs
  const qrReaderRef = useRef<any>(null)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string>('')

  useEffect(() => {
    // Initial fetch of today's reservations for quick lookup
    handleSearch()
    return () => {
      stopCameraScanner()
    }
  }, [])

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setIsSearching(true)
    try {
      const url = searchQuery.trim()
        ? `/api/reservations?q=${encodeURIComponent(searchQuery.trim())}`
        : '/api/reservations'
      const res = await fetch(url)
      const data = await res.json()
      if (data.reservations) {
        setSearchResults(data.reservations)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  function handleSelectReservation(res: Reservation) {
    setSelectedReservation(res)
    setSelectedGuest(res.guest || null)
    setSelectedWristband(res.wristband || null)

    // Evaluate eligibility based on mode
    if (scanMode === 'CHECK_IN') {
      if (res.status === 'Checked In') {
        setStatusType('WARNING')
        setStatusMessage(`Guest is already checked in (Checked in on ${res.actual_check_in_time ? new Date(res.actual_check_in_time).toLocaleTimeString() : 'today'}).`)
      } else if (res.status === 'Checked Out') {
        setStatusType('ERROR')
        setStatusMessage('Reservation is already completed and checked out.')
      } else if (res.status === 'Cancelled') {
        setStatusType('ERROR')
        setStatusMessage('Cannot check in a cancelled reservation.')
      } else {
        setStatusType('INFO')
        setStatusMessage('Reservation verified. Review details and confirm check-in.')
      }
    } else {
      // CHECK OUT MODE
      if (res.status === 'Checked Out') {
        setStatusType('WARNING')
        setStatusMessage('Guest is already checked out.')
      } else if (res.status !== 'Checked In') {
        setStatusType('ERROR')
        setStatusMessage('Guest cannot check out before checking in.')
      } else {
        setStatusType('INFO')
        setStatusMessage('Guest is currently checked in. Ready for check-out confirmation.')
      }
    }
  }

  // QR SCANNER CONTROLS
  async function startCameraScanner() {
    setCameraError('')
    setCameraActive(true)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const qrScanner = new Html5Qrcode('qr-reader-container')
      qrReaderRef.current = qrScanner

      await qrScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Scanned QR code
          console.log('Decoded QR Text:', decodedText)
          stopCameraScanner()
          await handleQrCodeDecoded(decodedText)
        },
        () => {}
      )
    } catch (err: any) {
      console.error('Camera QR error:', err)
      setCameraError('Camera access denied or unavailable: ' + (err.message || err))
      setCameraActive(false)
    }
  }

  function stopCameraScanner() {
    if (qrReaderRef.current) {
      qrReaderRef.current.stop().then(() => {
        qrReaderRef.current.clear()
        qrReaderRef.current = null
      }).catch(() => {})
    }
    setCameraActive(false)
  }

  async function handleQrCodeDecoded(code: string) {
    setIsSearching(true)
    try {
      const res = await fetch('/api/reception/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code, mode: scanMode }),
      })
      const data = await res.json()
      if (data.reservation) {
        handleSelectReservation(data.reservation)
      } else {
        setStatusType('ERROR')
        setStatusMessage('QR code does not match any valid resort reservation.')
      }
    } catch (err: any) {
      setStatusType('ERROR')
      setStatusMessage('Verification failed: ' + err.message)
    } finally {
      setIsSearching(false)
    }
  }

  // EXECUTE CONFIRMATION
  async function handleConfirmTransaction() {
    if (!selectedReservation) return
    setIsConfirming(true)

    try {
      const res = await fetch('/api/reception/confirm-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: scanMode,
          reservationId: selectedReservation.id,
          wristbandToken: selectedWristband?.nfc_token,
          releaseWristband,
          verificationMethod: activeTab === 'QR_SCANNER' ? 'QR_CODE' : 'MANUAL',
          notes: staffNotes,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setStatusType('ERROR')
        setStatusMessage(data.message || 'Operation failed.')
        setConfirmDialogOpen(false)
        return
      }

      setConfirmDialogOpen(false)
      setStatusType('SUCCESS')

      if (scanMode === 'CHECK_IN') {
        setStatusMessage(`Successfully checked in ${selectedGuest?.full_name}! (Verified via ${activeTab === 'QR_SCANNER' ? 'QR Code' : 'Manual Search'}).`)
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
        } catch {}
      } else {
        setStatusMessage(`Successfully checked out ${selectedGuest?.full_name}! Wristband released.`)
      }

      // Refresh list
      handleSearch()
      if (data.reservation) {
        setSelectedReservation(data.reservation)
      }
    } catch (err: any) {
      setStatusType('ERROR')
      setStatusMessage('Error executing transaction: ' + err.message)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <AppShell title="QR & Manual Verification" subtitle="Camera QR scan and reservation search fallback for front desk check-in">
      <div className="max-w-4xl mx-auto pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/reception"
            className="size-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Search size={22} className="text-teal-700" />
              QR Code Backup & Manual Verification
            </h1>
            <p className="text-xs text-stone-500">
              Front desk backup when NFC is damaged, forgotten, or device is incompatible
            </p>
          </div>
        </div>

        <Link
          href="/reception/scan"
          className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Radio size={14} className="text-teal-700" />
          <span>Switch to NFC</span>
        </Link>
      </div>

      {/* Mode Selector */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs mb-5 grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setScanMode('CHECK_IN')
            setSelectedReservation(null)
            setStatusMessage('')
          }}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            scanMode === 'CHECK_IN'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <UserCheck size={16} />
          <span>CHECK IN MODE</span>
        </button>

        <button
          onClick={() => {
            setScanMode('CHECK_OUT')
            setSelectedReservation(null)
            setStatusMessage('')
          }}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            scanMode === 'CHECK_OUT'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <CreditCard size={16} />
          <span>CHECK OUT MODE</span>
        </button>
      </div>

      {/* Tabs: Manual Search vs Camera QR */}
      <div className="flex border-b border-stone-200 mb-5">
        <button
          onClick={() => {
            setActiveTab('SEARCH')
            stopCameraScanner()
          }}
          className={`py-2.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'SEARCH'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Search size={15} />
          <span>Reservation Search</span>
        </button>

        <button
          onClick={() => setActiveTab('QR_SCANNER')}
          className={`py-2.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'QR_SCANNER'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <QrCode size={15} />
          <span>Camera QR Scanner</span>
        </button>
      </div>

      {/* Search Input View */}
      {activeTab === 'SEARCH' && (
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search by Reference (e.g. RR-84910), Guest Name, Phone number, or Room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-teal-600"
              />
            </div>
            <Button type="submit" disabled={isSearching} className="bg-teal-700 hover:bg-teal-800 text-white text-xs px-4">
              {isSearching ? <RefreshCw size={13} className="animate-spin" /> : 'Search'}
            </Button>
          </form>

          {/* Quick Filter Badges */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-stone-500 items-center">
            <span>Quick test picks:</span>
            {searchResults.slice(0, 4).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectReservation(r)}
                className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-teal-50 hover:text-teal-800 text-stone-700 border border-stone-200 transition-colors"
              >
                {r.reference_number} ({r.guest?.full_name?.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QR Camera View */}
      {activeTab === 'QR_SCANNER' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs mb-6 text-center">
          <div className="max-w-sm mx-auto">
            <div
              id="qr-reader-container"
              className="w-full min-h-[260px] rounded-xl overflow-hidden bg-stone-900 border border-stone-300 flex items-center justify-center text-white mb-3"
            >
              {!cameraActive && (
                <div className="p-6 text-center">
                  <Camera size={44} className="mx-auto mb-2 text-stone-400 opacity-60" />
                  <p className="text-xs text-stone-300">
                    Scan resort booking voucher or guest digital pass QR code.
                  </p>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 text-xs mb-3">
                {cameraError}
              </div>
            )}

            {!cameraActive ? (
              <Button
                onClick={startCameraScanner}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-2 px-6"
              >
                <Camera size={15} />
                <span>Start Camera QR Scan</span>
              </Button>
            ) : (
              <Button
                onClick={stopCameraScanner}
                variant="outline"
                className="text-xs text-stone-700 border-stone-300"
              >
                Stop Camera
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium mb-5 flex items-start gap-2.5 ${
            statusType === 'SUCCESS'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : statusType === 'WARNING'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : statusType === 'ERROR'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-teal-50 text-teal-900 border-teal-200'
          }`}
        >
          {statusType === 'SUCCESS' ? (
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          ) : statusType === 'WARNING' ? (
            <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
          ) : statusType === 'ERROR' ? (
            <XCircle size={16} className="text-rose-700 shrink-0 mt-0.5" />
          ) : (
            <Sparkles size={16} className="text-teal-700 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Selected Reservation Verification Card (Section 4.F) */}
      {selectedReservation && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
            <div>
              <span className="text-[11px] font-mono tracking-wider uppercase text-teal-800 font-bold block">
                GUEST IDENTITY & BOOKING CARD
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
                {selectedGuest?.full_name || 'Guest'}
              </h3>
            </div>
            <div className="text-right">
              <Badge
                className={
                  selectedGuest?.category === 'VIP'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : 'bg-teal-100 text-teal-900'
                }
              >
                {selectedGuest?.category || 'Regular'} Guest
              </Badge>
              <p className="text-xs font-mono text-stone-500 mt-1">
                Ref: {selectedReservation.reference_number}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                Accommodation
              </span>
              <p className="font-semibold text-stone-900 text-sm">
                {selectedReservation.room_or_accommodation}
              </p>
              <span className="text-[11px] text-stone-500">{selectedReservation.accommodation_type}</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                Stay Dates
              </span>
              <p className="font-semibold text-stone-900 text-sm">
                {selectedReservation.check_in_date} → {selectedReservation.check_out_date}
              </p>
              <span className="text-[11px] text-stone-500 font-medium">Status: {selectedReservation.status}</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                Guests
              </span>
              <p className="font-semibold text-stone-900 text-sm">
                {selectedReservation.adults_count} Adults, {selectedReservation.children_count} Children
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                Payment Status
              </span>
              <p className="font-semibold text-stone-900 text-sm">
                {selectedReservation.payment_status} (₱{selectedReservation.total_amount?.toLocaleString()})
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                Paired Wristband
              </span>
              <p className="font-semibold text-stone-900 text-sm font-mono">
                {selectedWristband?.wristband_code || 'None Assigned'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                Actual Check-in Time
              </span>
              <p className="font-semibold text-stone-900 text-sm">
                {selectedReservation.actual_check_in_time
                  ? new Date(selectedReservation.actual_check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Pending'}
              </p>
            </div>
          </div>

          {/* Action Confirmation Button */}
          {((scanMode === 'CHECK_IN' && selectedReservation.status === 'Confirmed') ||
            (scanMode === 'CHECK_OUT' && selectedReservation.status === 'Checked In')) && (
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              className={`w-full py-5 text-sm font-bold text-white rounded-xl shadow-md ${
                scanMode === 'CHECK_IN'
                  ? 'bg-teal-700 hover:bg-teal-800'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <CheckCircle2 size={18} />
              <span>
                {scanMode === 'CHECK_IN'
                  ? 'CONFIRM CHECK-IN (MANUAL / QR VERIFIED)'
                  : 'CONFIRM CHECK-OUT (MANUAL / QR VERIFIED)'}
              </span>
            </Button>
          )}
        </div>
      )}

      {/* Results List if search query entered */}
      {searchResults.length > 0 && !selectedReservation && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">
              Reservations Found ({searchResults.length})
            </span>
            <span className="text-[11px] text-stone-500">Tap to review & confirm</span>
          </div>

          <div className="divide-y divide-stone-100">
            {searchResults.map((r) => (
              <div
                key={r.id}
                onClick={() => handleSelectReservation(r)}
                className="p-4 hover:bg-teal-50/40 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs text-teal-800">{r.reference_number}</span>
                    <strong className="text-sm text-stone-900">{r.guest?.full_name}</strong>
                    <Badge className="text-[10px] py-0 px-1.5">{r.status}</Badge>
                  </div>
                  <p className="text-xs text-stone-500">
                    {r.room_or_accommodation} • {r.check_in_date} to {r.check_out_date}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs border-stone-200">
                  Select
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        title={scanMode === 'CHECK_IN' ? 'Confirm Manual Check-In' : 'Confirm Manual Check-Out'}
        description="Explicit staff confirmation required. This action is logged with your staff ID."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-500">Guest:</span>
              <strong className="text-stone-900">{selectedGuest?.full_name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Reservation:</span>
              <span className="font-mono text-stone-900">{selectedReservation?.reference_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Verification Method:</span>
              <span className="font-mono font-semibold text-teal-800">
                {activeTab === 'QR_SCANNER' ? 'QR_CODE' : 'MANUAL'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Staff Verification Notes:
            </label>
            <input
              type="text"
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              disabled={isConfirming}
              onClick={() => setConfirmDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              disabled={isConfirming}
              onClick={handleConfirmTransaction}
              className={`text-xs font-bold text-white ${
                scanMode === 'CHECK_IN' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isConfirming ? 'Confirming...' : 'Yes, Confirm Operation'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
    </AppShell>
  )
}
