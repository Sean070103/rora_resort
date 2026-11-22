'use client'

import React, { useState, useEffect } from 'react'
import { Radio, RefreshCw, CheckCircle2, AlertTriangle, UserCheck, KeyRound, Zap, Sparkles, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ScannedWristbandResult {
  found: boolean
  registered: boolean
  uid: string
  wristband?: {
    id: string
    uid: string
    label: string
    status: 'AVAILABLE' | 'ACTIVE' | 'DEACTIVATED' | 'LOST' | 'DAMAGED'
    currentGuestName?: string
    currentReservationId?: string
    lastScannedAt?: string
    lastAssignedAt?: string
  }
  activeReservation?: {
    id: string
    referenceNumber: string
    guestName: string
    guestPhone: string
    roomName: string
    checkInDate: string
    checkOutDate: string
    status: string
    totalAmount: number
    amountPaid: number
    balanceDue: number
    loyaltyTierApplied: string
  }
  guestLoyalty?: {
    completedVisits: number
    tier: {
      tier: string
      discountPercentage: number
      badgeColor: string
      perks: string[]
    }
  }
  message?: string
}

interface NfcScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectWristband?: (wristband: any, reservation?: any) => void
  actionLabel?: string
  targetReservationId?: string
}

export function NfcScannerModal({
  isOpen,
  onClose,
  onSelectWristband,
  actionLabel = 'Select Wristband',
  targetReservationId,
}: NfcScannerModalProps) {
  const [hardwareDetected, setHardwareDetected] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedResult, setScannedResult] = useState<ScannedWristbandResult | null>(null)
  const [customUid, setCustomUid] = useState('')
  const [availableWristbands, setAvailableWristbands] = useState<any[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [newLabel, setNewLabel] = useState('')
  const [registering, setRegistering] = useState(false)

  // Fetch available wristbands for the simulation picker
  useEffect(() => {
    if (isOpen) {
      loadWristbands()
      checkWebNfc()
    }
  }, [isOpen])

  async function checkWebNfc() {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setHardwareDetected(true)
    } else {
      setHardwareDetected(false)
    }
  }

  async function loadWristbands() {
    setLoadingList(true)
    try {
      const res = await fetch('/api/wristbands')
      const data = await res.json()
      if (data.wristbands) {
        setAvailableWristbands(data.wristbands)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingList(false)
    }
  }

  async function handleScan(uid: string) {
    if (!uid) return
    setIsScanning(true)
    setStatusMessage('Reading NFC chip...')
    try {
      const res = await fetch('/api/nfc/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      })
      const data: ScannedWristbandResult = await res.json()
      setScannedResult(data)
      setStatusMessage('')
    } catch (err: any) {
      setStatusMessage(`Scan failed: ${err.message}`)
    } finally {
      setIsScanning(false)
    }
  }

  function generateRandomUid() {
    const bytes = Array.from({ length: 7 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase()
    )
    const uid = bytes.join(':')
    setCustomUid(uid)
    handleScan(uid)
  }

  async function handleQuickRegister() {
    if (!scannedResult?.uid || !newLabel) return
    setRegistering(true)
    try {
      const res = await fetch('/api/wristbands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: scannedResult.uid,
          label: newLabel,
          notes: 'Registered via NFC scanner desk',
        }),
      })
      const data = await res.json()
      if (data.wristband) {
        setNewLabel('')
        await handleScan(scannedResult.uid)
        await loadWristbands()
      } else {
        alert(data.error || 'Failed to register')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setRegistering(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#14261d]/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card (Minimal Neo-Brutalist) */}
      <div className="relative w-full max-w-xl rounded-none bg-white shadow-[6px_6px_0px_#000] border-2 border-black z-10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#14261d] text-white border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 border border-white/20">
              <Radio className="size-5 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white tracking-wide">
                NFC Wristband Scanner
              </h2>
              <p className="text-xs text-stone-300">
                13.56 MHz ISO 14443A Contactless Reader
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white hover:bg-white/20 p-1.5 border border-white/30 transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Device Status Bar */}
        <div className="px-6 py-2.5 bg-[#f7f6ef] border-b-2 border-black flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`size-2.5 ${
                hardwareDetected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`}
            />
            <span className="font-bold text-stone-900">
              {hardwareDetected
                ? 'USB NFC Reader Connected'
                : 'Development Simulation Mode Active'}
            </span>
          </div>
          <span className="text-stone-600 font-mono text-[10px] font-bold">
            {hardwareDetected ? 'Web NFC Ready' : 'Virtual Hardware Bridge'}
          </span>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          {/* Quick Simulation Taps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Simulate Wristband Tap (Development Mode)
              </span>
              <button
                onClick={loadWristbands}
                disabled={loadingList}
                className="text-xs text-[#14261d] font-bold flex items-center gap-1 hover:underline"
              >
                <RefreshCw size={12} className={loadingList ? 'animate-spin' : ''} /> Refresh inventory
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableWristbands.map((wb) => (
                <button
                  key={wb.id}
                  onClick={() => {
                    setCustomUid(wb.uid)
                    handleScan(wb.uid)
                  }}
                  className={`text-left p-2.5 border-2 text-xs transition-all ${
                    scannedResult?.wristband?.uid === wb.uid
                      ? 'border-black bg-emerald-100 shadow-[2px_2px_0px_#000] font-bold'
                      : 'border-black/30 hover:border-black bg-[#f7f6ef] shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 font-mono">{wb.label}</span>
                    <Badge
                      variant={
                        wb.status === 'AVAILABLE'
                          ? 'success'
                          : wb.status === 'ACTIVE'
                          ? 'forest'
                          : 'outline'
                      }
                      className="text-[9px] px-1 py-0"
                    >
                      {wb.status}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono truncate">{wb.uid}</div>
                  {wb.currentGuestName && (
                    <div className="text-[11px] text-[#14261d] truncate mt-0.5 font-bold">
                      👤 {wb.currentGuestName}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Manual / USB UID Scanner input */}
          <div className="bg-[#f7f6ef] p-4 border-2 border-black shadow-[3px_3px_0px_#000]">
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
              USB Reader Emulation / Manual UID Input:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 04:A3:8C:F2:10:5B:80"
                value={customUid}
                onChange={(e) => setCustomUid(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleScan(customUid)
                }}
                className="flex-1 px-3 py-2 text-xs font-mono bg-white border-2 border-black focus:outline-none"
              />
              <button
                onClick={generateRandomUid}
                className="px-3 py-2 text-xs font-bold bg-white text-stone-900 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5"
                title="Generate simulated random unprogrammed NFC UID"
              >
                <Sparkles size={13} className="text-amber-600" /> New UID
              </button>
              <button
                onClick={() => handleScan(customUid)}
                disabled={isScanning || !customUid}
                className="bg-[#14261d] hover:bg-[#1f382b] text-white text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
              >
                {isScanning ? 'Reading...' : 'Tap & Scan'}
              </button>
            </div>
          </div>

          {/* Scanning Status */}
          {statusMessage && (
            <p className="text-xs text-stone-700 italic font-medium text-center">{statusMessage}</p>
          )}

          {/* Scanned Card Details */}
          {scannedResult && (
            <div className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_#000] space-y-4 animate-in fade-in">
              {scannedResult.registered ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-700" />
                        <h3 className="font-bold text-stone-900 text-sm font-mono">
                          {scannedResult.wristband?.label}
                        </h3>
                        <Badge
                          variant={
                            scannedResult.wristband?.status === 'AVAILABLE'
                              ? 'success'
                              : scannedResult.wristband?.status === 'ACTIVE'
                              ? 'forest'
                              : 'danger'
                          }
                        >
                          {scannedResult.wristband?.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-stone-600 font-mono mt-1 font-bold">
                        UID: {scannedResult.wristband?.uid}
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-stone-500 font-mono">
                      <div>Scanned: Just now</div>
                      {scannedResult.wristband?.lastAssignedAt && (
                        <div>
                          Assigned:{' '}
                          {new Date(
                            scannedResult.wristband.lastAssignedAt
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Reservation / Guest info */}
                  {scannedResult.activeReservation ? (
                    <div className="bg-[#f7f6ef] p-3 border-2 border-black text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-black/20 pb-1.5">
                        <span className="font-bold text-[#14261d] flex items-center gap-1.5 uppercase text-[10px]">
                          <UserCheck size={14} /> Linked Reservation:
                        </span>
                        <span className="font-mono font-bold text-stone-900">
                          {scannedResult.activeReservation.referenceNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-stone-800">
                        <div>
                          Guest:{' '}
                          <strong>{scannedResult.activeReservation.guestName}</strong>
                        </div>
                        <div>
                          Room: <strong>{scannedResult.activeReservation.roomName}</strong>
                        </div>
                        <div>
                          Dates: {scannedResult.activeReservation.checkInDate} to{' '}
                          {scannedResult.activeReservation.checkOutDate}
                        </div>
                        <div>
                          Status:{' '}
                          <span className="uppercase font-bold">
                            {scannedResult.activeReservation.status}
                          </span>
                        </div>
                      </div>

                      {scannedResult.guestLoyalty && (
                        <div className="mt-2 pt-2 border-t border-black/20 flex items-center justify-between text-[11px]">
                          <span className="text-[#14261d] font-bold">
                            Loyalty: {scannedResult.guestLoyalty.tier.tier} (
                            {scannedResult.guestLoyalty.completedVisits} completed visits)
                          </span>
                          <span className="text-emerald-800 font-semibold">
                            Eligible discount: {scannedResult.guestLoyalty.tier.discountPercentage}%
                          </span>
                        </div>
                      )}

                      <div className="mt-1 flex items-center justify-between font-bold pt-1.5 border-t border-black/20">
                        <span className="text-stone-700">Balance:</span>
                        <span
                          className={
                            scannedResult.activeReservation.balanceDue > 0
                              ? 'text-rose-700 font-bold'
                              : 'text-emerald-800 font-bold'
                          }
                        >
                          ₱{scannedResult.activeReservation.balanceDue.toLocaleString()}{' '}
                          {scannedResult.activeReservation.balanceDue > 0
                            ? 'DUE'
                            : '(FULLY PAID)'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#f7f6ef] p-3 text-xs text-stone-700 flex items-center gap-2 border border-black/20 font-medium">
                      <KeyRound size={14} className="text-stone-500" />
                      <span>
                        This wristband is currently <strong>AVAILABLE</strong> and not assigned to any ongoing reservation.
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end pt-2">
                    {onSelectWristband && (
                      <button
                        onClick={() => {
                          onSelectWristband(
                            scannedResult.wristband,
                            scannedResult.activeReservation
                          )
                          onClose()
                        }}
                        className="bg-[#14261d] hover:bg-[#1f382b] text-white text-xs font-bold px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5"
                      >
                        <Zap size={13} /> {actionLabel}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <AlertTriangle size={18} />
                    <span className="text-xs uppercase">
                      Unregistered Wristband (UID: {scannedResult.uid})
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    This NFC wristband is new to Queen Aurora Resort. Enter a label (e.g. WB-0107) to register it into the inventory tray.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Label (e.g. WB-0107)"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="px-3 py-1.5 text-xs border-2 border-black bg-white flex-1 font-mono"
                    />
                    <button
                      onClick={handleQuickRegister}
                      disabled={registering || !newLabel}
                      className="bg-[#14261d] text-white text-xs font-bold px-4 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000]"
                    >
                      {registering ? 'Registering...' : 'Register Wristband'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f7f6ef] border-t-2 border-black flex items-center justify-between text-xs text-stone-600 font-medium">
          <span>Security: PII is never stored on the physical chip.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-bold bg-white text-stone-900 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-stone-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
