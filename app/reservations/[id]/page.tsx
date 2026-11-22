'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  CalendarDays,
  UserCheck,
  Radio,
  Clock,
  Home,
  Users,
  CreditCard,
  ChevronLeft,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { Dialog } from '@/components/ui/dialog'
import { Reservation, GuestAccessLog } from '@/lib/types'
import QRCode from 'qrcode'

export default function ReservationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reservationId = params.id as string

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [logs, setLogs] = useState<GuestAccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [qrModalOpen, setQrModalOpen] = useState(false)

  // Direct confirmation
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (reservationId) loadReservation()
  }, [reservationId])

  async function loadReservation() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reservations/${reservationId}`)
      const data = await res.json()
      if (data.reservation) {
        setReservation(data.reservation)
        // Generate QR code representation
        const qrContent = data.reservation.reference_number
        const dataUrl = await QRCode.toDataURL(qrContent, { width: 300, margin: 2 })
        setQrDataUrl(dataUrl)
      }
      if (data.logs) setLogs(data.logs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmAction() {
    if (!reservation) return
    setIsProcessing(true)

    try {
      const res = await fetch('/api/reception/confirm-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          reservationId: reservation.id,
          wristbandToken: reservation.wristband?.nfc_token,
          verificationMethod: 'MANUAL',
          notes: `Confirmed on reservation details page`,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setConfirmModalOpen(false)
        loadReservation()
      } else {
        alert(data.message || 'Operation failed')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-xs text-stone-400">Loading booking...</div>
  }

  if (!reservation) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm font-semibold text-stone-800">Reservation not found</p>
        <Link href="/reservations">
          <Button variant="outline" size="sm" className="text-xs">
            Return to Reservations
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <AppShell title="Reservation Details" subtitle="Guest booking summary, assigned wristband, and check-in confirmation">
      <div className="space-y-6 max-w-4xl mx-auto pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/reservations"
            className="size-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {reservation.reference_number}
              </span>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                {reservation.room_or_accommodation}
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Guest: <strong className="text-stone-800">{reservation.guest?.full_name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Digital QR Pass Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setQrModalOpen(true)}
            className="border-stone-200 text-stone-700 text-xs gap-1.5"
          >
            <QrCode size={14} />
            <span className="hidden sm:inline">Guest QR Pass</span>
          </Button>

          {/* Action Button */}
          {reservation.status === 'Confirmed' && (
            <Button
              size="sm"
              onClick={() => {
                setActionType('CHECK_IN')
                setConfirmModalOpen(true)
              }}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1"
            >
              <UserCheck size={14} /> Check In Guest
            </Button>
          )}

          {reservation.status === 'Checked In' && (
            <Button
              size="sm"
              onClick={() => {
                setActionType('CHECK_OUT')
                setConfirmModalOpen(true)
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1"
            >
              <Clock size={14} /> Check Out Guest
            </Button>
          )}
        </div>
      </div>

      {/* Main Verification Card (Section 4.F) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-teal-800 font-bold uppercase block">
              BOOKING & STAY RECORD
            </span>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              {reservation.room_or_accommodation}
            </h2>
          </div>
          <Badge
            className={
              reservation.status === 'Checked In'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : reservation.status === 'Confirmed'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-stone-100 text-stone-700'
            }
          >
            {reservation.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-1">
              Guest Name
            </span>
            <p className="font-semibold text-stone-900 text-sm">
              {reservation.guest?.full_name}
            </p>
            <span className="text-[11px] text-stone-500">
              {reservation.guest?.category} • {reservation.guest?.phone}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-1">
              Stay Dates
            </span>
            <p className="font-semibold text-stone-900 text-sm">
              {reservation.check_in_date} → {reservation.check_out_date}
            </p>
            <span className="text-[11px] text-stone-500">{reservation.accommodation_type}</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-1">
              Guest Occupancy
            </span>
            <p className="font-semibold text-stone-900 text-sm">
              {reservation.adults_count} Adults, {reservation.children_count} Children
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-1">
              Payment Status
            </span>
            <p className="font-semibold text-stone-900 text-sm">
              {reservation.payment_status} (₱{reservation.total_amount?.toLocaleString()})
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-1">
              Paired Wristband
            </span>
            {reservation.wristband ? (
              <p className="font-mono font-bold text-teal-800 text-sm flex items-center gap-1">
                <Radio size={13} className="text-teal-600" />
                {reservation.wristband.wristband_code}
              </p>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-stone-400 italic text-xs">Unassigned</span>
                <Link href={`/wristbands/assign?reservationId=${reservation.id}`}>
                  <span className="text-[11px] text-teal-700 font-bold hover:underline">
                    Assign Now →
                  </span>
                </Link>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-1">
              Actual Check-In Time
            </span>
            <p className="font-semibold text-stone-900 text-sm">
              {reservation.actual_check_in_time
                ? new Date(reservation.actual_check_in_time).toLocaleString()
                : 'Pending'}
            </p>
            {reservation.checked_in_by && (
              <span className="text-[11px] text-stone-500">By {reservation.checked_in_by}</span>
            )}
          </div>
        </div>

        {reservation.special_requests && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900">
            <strong>Guest Requests:</strong> {reservation.special_requests}
          </div>
        )}
      </div>

      {/* Access Activity for this Reservation */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 px-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-teal-700" />
            <h3 className="font-bold text-sm text-stone-900">Access & Front Desk History</h3>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {logs.length === 0 ? (
            <p className="p-6 text-xs text-stone-400 text-center">No transactions recorded for this reservation.</p>
          ) : (
            logs.map((l) => (
              <div key={l.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-stone-900">{l.action_type}</span>
                  <Badge className="ml-2 text-[9px] py-0 px-1 font-mono">{l.verification_method}</Badge>
                  <p className="text-[11px] text-stone-400">{l.notes} • Staff: {l.receptionist_name}</p>
                </div>
                <span className="text-[11px] font-mono text-stone-500">
                  {new Date(l.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QR PASS MODAL */}
      <Dialog
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Digital Guest Booking Pass"
        description="Can be presented on guest phone or printed for QR camera check-in."
      >
        <div className="space-y-4 pt-2 text-center">
          {qrDataUrl && (
            <div className="p-4 bg-white rounded-2xl border border-stone-200 inline-block shadow-inner">
              <img src={qrDataUrl} alt="Guest QR Pass" className="size-48 mx-auto" />
            </div>
          )}

          <div className="text-xs text-stone-600 font-mono">
            Booking Code: <strong>{reservation.reference_number}</strong>
          </div>
          <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
            Scan this code in the Reception QR Scanner if NFC wristband is lost or during arrival.
          </p>

          <Button onClick={() => setQrModalOpen(false)} variant="outline" className="text-xs">
            Done
          </Button>
        </div>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={actionType === 'CHECK_IN' ? 'Confirm Check-In' : 'Confirm Check-Out'}
        description="Verify reservation details before recording transaction."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-500">Guest:</span>
              <strong className="text-stone-900">{reservation.guest?.full_name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Accommodation:</span>
              <span className="font-semibold text-stone-900">{reservation.room_or_accommodation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Wristband:</span>
              <span className="font-mono text-teal-800 font-bold">
                {reservation.wristband?.wristband_code || 'None'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              disabled={isProcessing}
              onClick={() => setConfirmModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              disabled={isProcessing}
              onClick={handleConfirmAction}
              className={`text-xs font-bold text-white ${
                actionType === 'CHECK_IN' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Yes, Confirm'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
    </AppShell>
  )
}
