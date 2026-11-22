'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Radio,
  UserCheck,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { Reservation, Wristband, Guest } from '@/lib/types'

function AssignWristbandContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedResId = searchParams.get('reservationId')

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [availableBands, setAvailableBands] = useState<Wristband[]>([])
  const [selectedResId, setSelectedResId] = useState<string>(preselectedResId || '')
  const [selectedBandId, setSelectedBandId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [rRes, wRes] = await Promise.all([
        fetch('/api/reservations').then((r) => r.json()),
        fetch('/api/wristbands?status=Available').then((r) => r.json()),
      ])

      if (rRes.reservations) {
        setReservations(rRes.reservations)
        if (!selectedResId && rRes.reservations.length > 0) {
          setSelectedResId(rRes.reservations[0].id)
        }
      }
      if (wRes.wristbands) {
        setAvailableBands(wRes.wristbands)
        if (wRes.wristbands.length > 0) {
          setSelectedBandId(wRes.wristbands[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectedRes = reservations.find((r) => r.id === selectedResId)
  const selectedBand = availableBands.find((b) => b.id === selectedBandId)

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRes || !selectedBand) return
    setIsAssigning(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/wristbands/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wristbandId: selectedBand.id,
          guestId: selectedRes.guest_id,
          reservationId: selectedRes.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || 'Assignment failed')
        return
      }

      setSuccessMessage(
        `Wristband ${selectedBand.wristband_code} paired with ${selectedRes.guest?.full_name} (${selectedRes.reference_number})!`
      )
      loadData()
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <AppShell title="Assign Wristband" subtitle="Pair an available NFC wristband with a verified reservation">
      <div className="max-w-2xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href="/wristbands"
          className="size-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Radio size={22} className="text-teal-700" />
            Assign NFC Wristband
          </h1>
          <p className="text-xs text-stone-500">
            Pair an available wristband with a verified guest booking
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs">
        <form onSubmit={handleAssign} className="space-y-5">
          {/* Step 1: Select Reservation */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1.5 uppercase tracking-wider">
              1. Select Confirmed Reservation
            </label>
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-teal-600"
            >
              {reservations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reference_number} — {r.guest?.full_name} ({r.room_or_accommodation} | {r.status})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Reservation Preview */}
          {selectedRes && (
            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-teal-900">
                <span>Guest: {selectedRes.guest?.full_name}</span>
                <span className="font-mono">{selectedRes.reference_number}</span>
              </div>
              <p className="text-teal-700">
                Accommodation: {selectedRes.room_or_accommodation} • Dates: {selectedRes.check_in_date} to {selectedRes.check_out_date}
              </p>
              {selectedRes.wristband && (
                <p className="text-amber-800 text-[11px] pt-1">
                  Note: Currently assigned to {selectedRes.wristband.wristband_code}. Assigning a new wristband will update the assignment.
                </p>
              )}
            </div>
          )}

          {/* Step 2: Select Available Wristband */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1.5 uppercase tracking-wider">
              2. Select Available Wristband
            </label>
            {availableBands.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                No wristbands are currently Available. Register a new wristband or release a checked-out wristband first.
              </p>
            ) : (
              <select
                value={selectedBandId}
                onChange={(e) => setSelectedBandId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-teal-600"
              >
                {availableBands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.wristband_code} (Condition: {b.condition} | Token: {b.nfc_token.substring(0, 12)}...)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isAssigning || availableBands.length === 0}
              className="w-full py-4 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-md gap-2"
            >
              <Radio size={16} />
              <span>{isAssigning ? 'Pairing...' : 'Assign Wristband to Guest'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
    </AppShell>
  )
}

export default function AssignWristbandPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="Assign Wristband" subtitle="Pair an available NFC wristband with a verified reservation">
          <div className="max-w-2xl mx-auto p-8 text-center text-stone-500 text-sm">
            Loading assignment form...
          </div>
        </AppShell>
      }
    >
      <AssignWristbandContent />
    </Suspense>
  )
}
