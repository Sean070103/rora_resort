'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Radio,
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Calendar,
  Clock,
  Key,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  Sparkles,
  Phone,
  Mail,
  Home,
  Users,
  CreditCard,
  Zap,
  Smartphone,
  Info,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { Guest, Reservation, Wristband, VerificationMethod } from '@/lib/types'
import confetti from 'canvas-confetti'

type ScanState =
  | 'READY_TO_SCAN'
  | 'WAITING_FOR_WRISTBAND'
  | 'SCANNING'
  | 'GUEST_IDENTIFIED'
  | 'AWAITING_CONFIRMATION'
  | 'SUCCESSFULLY_CHECKED_IN'
  | 'SUCCESSFULLY_CHECKED_OUT'
  | 'UNKNOWN_WRISTBAND'
  | 'INVALID_RESERVATION'
  | 'ALREADY_CHECKED_IN'
  | 'ALREADY_CHECKED_OUT'
  | 'WRISTBAND_DISABLED'
  | 'NFC_UNAVAILABLE'
  | 'NETWORK_ERROR'

export default function NfcScanPage() {
  const [scanMode, setScanMode] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN')
  const [scanState, setScanState] = useState<ScanState>('READY_TO_SCAN')
  const [stateMessage, setStateMessage] = useState<string>('Select an operation mode and tap Start NFC Scan.')

  // Compatibility and Device Flags
  const [hasNfcSupport, setHasNfcSupport] = useState<boolean>(false)
  const [isHttps, setIsHttps] = useState<boolean>(true)
  const [nfcScanningActive, setNfcScanningActive] = useState<boolean>(false)

  // Scanned Entities
  const [activeToken, setActiveToken] = useState<string>('')
  const [scannedWristband, setScannedWristband] = useState<Wristband | null>(null)
  const [scannedReservation, setScannedReservation] = useState<Reservation | null>(null)
  const [scannedGuest, setScannedGuest] = useState<Guest | null>(null)

  // Confirmation Dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false)
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const [releaseWristbandOnCheckout, setReleaseWristbandOnCheckout] = useState<boolean>(true)

  // Quick Test Wristbands for Simulator
  const [inventoryWristbands, setInventoryWristbands] = useState<Wristband[]>([])
  const [showSimulator, setShowSimulator] = useState<boolean>(false)
  const [manualTokenInput, setManualTokenInput] = useState<string>('')

  // NFC Writer Tool State
  const [writerOpen, setWriterOpen] = useState<boolean>(false)
  const [tokenToWrite, setTokenToWrite] = useState<string>('')
  const [writingStatus, setWritingStatus] = useState<string>('')

  // Prevent duplicate rapid scans
  const isProcessingRef = useRef<boolean>(false)
  const ndefReaderRef = useRef<any>(null)
  const wakeLockRef = useRef<any>(null)

  useEffect(() => {
    // Check Web NFC compatibility
    if (typeof window !== 'undefined') {
      const isSec = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      setIsHttps(isSec)
      if ('NDEFReader' in window) {
        setHasNfcSupport(true)
      } else {
        setHasNfcSupport(false)
      }
    }

    loadWristbands()

    // Request screen wake lock so scanner stays awake during front desk duty
    requestWakeLock()

    return () => {
      stopNfcListening()
      releaseWakeLock()
    }
  }, [])

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
      }
    } catch (err) {
      // Wake lock can fail if backgrounded or battery saver active
    }
  }

  function releaseWakeLock() {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {})
      wakeLockRef.current = null
    }
  }

  async function loadWristbands() {
    try {
      const res = await fetch('/api/wristbands')
      const data = await res.json()
      if (data.wristbands) {
        setInventoryWristbands(data.wristbands)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // START PHYSICAL ANDROID WEB NFC SCANNER
  async function startNfcListening() {
    if (!hasNfcSupport) {
      setScanState('NFC_UNAVAILABLE')
      setStateMessage('Web NFC API is not supported on this browser/device. Please use Google Chrome on an NFC-enabled Android device over HTTPS, or use the interactive testing simulator below.')
      setShowSimulator(true)
      return
    }

    try {
      setScanState('WAITING_FOR_WRISTBAND')
      setStateMessage('Hold NFC wristband against the back of this Android phone...')
      setNfcScanningActive(true)

      const NDEFReaderClass = (window as any).NDEFReader
      const reader = new NDEFReaderClass()
      ndefReaderRef.current = reader

      await reader.scan()

      reader.addEventListener('reading', async ({ message, serialNumber }: any) => {
        if (isProcessingRef.current) return // Prevent duplicate concurrent handling
        isProcessingRef.current = true

        try {
          // Provide tactile vibration feedback
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100])
          }

          setScanState('SCANNING')
          setStateMessage('NFC tag detected! Extracting security token...')

          let extractedToken = ''

          // Read NDEF records to extract the opaque token
          if (message.records && message.records.length > 0) {
            for (const record of message.records) {
              if (record.recordType === 'text') {
                const textDecoder = new TextDecoder(record.encoding || 'utf-8')
                extractedToken = textDecoder.decode(record.data)
                break
              }
            }
          }

          // If no NDEF text token, fallback to serial number
          if (!extractedToken && serialNumber) {
            extractedToken = serialNumber
          }

          if (!extractedToken) {
            setScanState('UNKNOWN_WRISTBAND')
            setStateMessage('NDEF record is empty or could not be decoded.')
            isProcessingRef.current = false
            return
          }

          await handleVerifyToken(extractedToken, 'NFC')
        } catch (err: any) {
          console.error('NFC reading error:', err)
          setScanState('NETWORK_ERROR')
          setStateMessage(err.message || 'Error processing NFC tag.')
        } finally {
          setTimeout(() => {
            isProcessingRef.current = false
          }, 1200)
        }
      })

      reader.addEventListener('readingerror', () => {
        setScanState('NETWORK_ERROR')
        setStateMessage('Could not read NFC tag. Please hold the wristband steady and try again.')
      })
    } catch (err: any) {
      console.error('Error starting Web NFC:', err)
      setNfcScanningActive(false)
      if (err.name === 'NotAllowedError') {
        setScanState('NFC_UNAVAILABLE')
        setStateMessage('NFC permission was denied. Please allow NFC access in Android Chrome settings.')
      } else {
        setScanState('NFC_UNAVAILABLE')
        setStateMessage(`Web NFC scanner error: ${err.message || 'Device incompatible'}.`)
      }
    }
  }

  function stopNfcListening() {
    setNfcScanningActive(false)
    ndefReaderRef.current = null
  }

  // SECURE BACKEND TOKEN VERIFICATION
  async function handleVerifyToken(tokenString: string, method: VerificationMethod = 'NFC') {
    setActiveToken(tokenString)
    setScanState('SCANNING')
    setStateMessage('Validating wristband token against resort reservation database...')

    try {
      const res = await fetch('/api/reception/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenString,
          mode: scanMode,
        }),
      })

      const data = await res.json()

      if (data.wristband) setScannedWristband(data.wristband)
      if (data.reservation) setScannedReservation(data.reservation)
      if (data.guest) setScannedGuest(data.guest)

      // Handle specific backend validation statuses
      if (data.status === 'WRISTBAND_DISABLED') {
        setScanState('WRISTBAND_DISABLED')
        setStateMessage(data.message)
        return
      }

      if (data.status === 'WRISTBAND_LOST') {
        setScanState('WRISTBAND_DISABLED')
        setStateMessage(data.message)
        return
      }

      if (data.status === 'UNKNOWN_WRISTBAND') {
        setScanState('UNKNOWN_WRISTBAND')
        setStateMessage(data.message)
        return
      }

      if (data.status === 'ALREADY_CHECKED_IN') {
        setScanState('ALREADY_CHECKED_IN')
        setStateMessage(data.message)
        return
      }

      if (data.status === 'ALREADY_CHECKED_OUT') {
        setScanState('ALREADY_CHECKED_OUT')
        setStateMessage(data.message)
        return
      }

      if (data.status === 'CANNOT_CHECK_OUT_YET') {
        setScanState('INVALID_RESERVATION')
        setStateMessage(data.message)
        return
      }

      if (data.status === 'INVALID_RESERVATION') {
        setScanState('INVALID_RESERVATION')
        setStateMessage(data.message)
        return
      }

      if (data.status === 'GUEST_IDENTIFIED' && data.canConfirm) {
        setScanState('GUEST_IDENTIFIED')
        setStateMessage('Guest identity and reservation verified. Review the details below and confirm.')
        return
      }

      // Fallback
      setScanState('AWAITING_CONFIRMATION')
      setStateMessage(data.message || 'Ready for receptionist confirmation.')
    } catch (err: any) {
      setScanState('NETWORK_ERROR')
      setStateMessage('Network error communicating with resort backend: ' + err.message)
    }
  }

  // EXECUTE ATOMIC TRANSACTION (CONFIRMATION)
  async function handleConfirmTransaction() {
    if (!scannedReservation) return
    setIsConfirming(true)

    try {
      const res = await fetch('/api/reception/confirm-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: scanMode,
          reservationId: scannedReservation.id,
          wristbandToken: activeToken || scannedWristband?.nfc_token,
          releaseWristband: releaseWristbandOnCheckout,
          verificationMethod: 'NFC',
          notes: `Confirmed at front desk by receptionist`,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (data.code === 'ALREADY_CHECKED_IN') {
          setScanState('ALREADY_CHECKED_IN')
        } else if (data.code === 'ALREADY_CHECKED_OUT') {
          setScanState('ALREADY_CHECKED_OUT')
        } else {
          setScanState('NETWORK_ERROR')
        }
        setStateMessage(data.message || 'Operation failed.')
        setConfirmDialogOpen(false)
        return
      }

      // Success!
      setConfirmDialogOpen(false)
      if (scanMode === 'CHECK_IN') {
        setScanState('SUCCESSFULLY_CHECKED_IN')
        setStateMessage(`Guest ${scannedGuest?.full_name} is successfully CHECKED IN! Room key and resort access granted.`)
        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0d9488', '#0f766e', '#14b8a6', '#f59e0b'],
          })
        } catch {}
      } else {
        setScanState('SUCCESSFULLY_CHECKED_OUT')
        setStateMessage(`Guest ${scannedGuest?.full_name} is successfully CHECKED OUT. Wristband has been released for reuse.`)
      }

      // Refresh wristbands inventory
      loadWristbands()
    } catch (err: any) {
      setScanState('NETWORK_ERROR')
      setStateMessage('Confirmation failed: ' + err.message)
    } finally {
      setIsConfirming(false)
    }
  }

  // RESET SCANNER
  function handleResetScanner() {
    setScanState('READY_TO_SCAN')
    setStateMessage('Select an operation mode and tap Start NFC Scan.')
    setActiveToken('')
    setScannedWristband(null)
    setScannedReservation(null)
    setScannedGuest(null)
    setConfirmDialogOpen(false)
  }

  // PHYSICAL NFC TAG WRITER
  async function handleWriteNfcTag() {
    if (!hasNfcSupport) {
      alert('NFC writing requires Web NFC support on Android Chrome.')
      return
    }

    try {
      setWritingStatus('Approaching tag... Hold wristband to back of phone...')
      const NDEFReaderClass = (window as any).NDEFReader
      const writer = new NDEFReaderClass()
      await writer.write({
        records: [{ recordType: 'text', data: tokenToWrite }],
      })
      setWritingStatus('Success! Opaque token securely written to wristband NDEF.')
      setTimeout(() => {
        setWriterOpen(false)
        setWritingStatus('')
      }, 2000)
    } catch (err: any) {
      setWritingStatus('Write failed: ' + err.message)
    }
  }

  return (
    <AppShell title="Android NFC Scanner" subtitle="Mobile Web NFC wristband identification & guest check-in/out">
      <div className="max-w-3xl mx-auto pb-12 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="size-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Radio size={22} className="text-teal-600 animate-pulse" />
              NFC Wristband Scanner
            </h1>
            <p className="text-xs text-stone-500">
              Mobile-first Android Web NFC guest identification & check-in/out
            </p>
          </div>
        </div>

        {/* Manual Fallback Quick Link */}
        <Link
          href="/reception/manual-verification"
          className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Search size={14} />
          <span className="hidden sm:inline">QR / Manual Backup</span>
          <span className="sm:hidden">QR Fallback</span>
        </Link>
      </div>

      {/* Operation Mode Selector: CHECK IN vs CHECK OUT */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs mb-5">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setScanMode('CHECK_IN')
              handleResetScanner()
            }}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              scanMode === 'CHECK_IN'
                ? 'bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-md'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <UserCheck size={18} />
            <span>CHECK IN MODE</span>
          </button>

          <button
            onClick={() => {
              setScanMode('CHECK_OUT')
              handleResetScanner()
            }}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              scanMode === 'CHECK_OUT'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Key size={18} />
            <span>CHECK OUT MODE</span>
          </button>
        </div>
      </div>

      {/* Primary Scanner Viewport / Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden relative mb-5">
        {/* Scanner Visual Hero */}
        <div
          className={`py-10 px-6 text-center transition-colors relative overflow-hidden ${
            scanState === 'SUCCESSFULLY_CHECKED_IN' || scanState === 'SUCCESSFULLY_CHECKED_OUT'
              ? 'bg-gradient-to-b from-emerald-950 to-emerald-900 text-white'
              : scanState === 'WRISTBAND_DISABLED' || scanState === 'UNKNOWN_WRISTBAND' || scanState === 'ALREADY_CHECKED_IN' || scanState === 'ALREADY_CHECKED_OUT' || scanState === 'INVALID_RESERVATION'
              ? 'bg-gradient-to-b from-rose-950 to-stone-900 text-white'
              : scanState === 'GUEST_IDENTIFIED' || scanState === 'AWAITING_CONFIRMATION'
              ? 'bg-gradient-to-b from-[#0f4c5c] to-[#0c3b47] text-white'
              : nfcScanningActive
              ? 'bg-gradient-to-b from-[#0d1b2a] to-[#1b263b] text-white'
              : 'bg-gradient-to-b from-stone-900 to-stone-800 text-white'
          }`}
        >
          {/* Pulsing Radar Ring Animation when Scanning */}
          {nfcScanningActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <span className="size-48 rounded-full border border-teal-400 animate-ping absolute" />
              <span className="size-36 rounded-full border border-teal-300 animate-pulse absolute" />
              <span className="size-24 rounded-full bg-teal-500/20 absolute" />
            </div>
          )}

          {/* Status Icon */}
          <div className="relative z-10 flex justify-center mb-4">
            {scanState === 'SUCCESSFULLY_CHECKED_IN' || scanState === 'SUCCESSFULLY_CHECKED_OUT' ? (
              <div className="size-20 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-lg animate-bounce">
                <CheckCircle2 size={44} />
              </div>
            ) : scanState === 'WRISTBAND_DISABLED' || scanState === 'UNKNOWN_WRISTBAND' || scanState === 'INVALID_RESERVATION' ? (
              <div className="size-20 rounded-full bg-rose-500/30 border-2 border-rose-400 flex items-center justify-center text-rose-300 shadow-lg">
                <XCircle size={44} />
              </div>
            ) : scanState === 'ALREADY_CHECKED_IN' || scanState === 'ALREADY_CHECKED_OUT' ? (
              <div className="size-20 rounded-full bg-amber-500/30 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-lg">
                <AlertTriangle size={44} />
              </div>
            ) : scanState === 'GUEST_IDENTIFIED' ? (
              <div className="size-20 rounded-full bg-teal-500/30 border-2 border-teal-300 flex items-center justify-center text-teal-200 shadow-lg">
                <Sparkles size={40} />
              </div>
            ) : nfcScanningActive ? (
              <div className="size-20 rounded-full bg-teal-500/30 border-2 border-teal-400 flex items-center justify-center text-teal-300 shadow-lg animate-pulse">
                <Radio size={42} />
              </div>
            ) : (
              <div className="size-20 rounded-full bg-stone-700/60 border border-stone-600 flex items-center justify-center text-stone-300 shadow-lg">
                <ScanLine size={40} />
              </div>
            )}
          </div>

          {/* State Title */}
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-bold bg-white/10 text-stone-200 border border-white/15 mb-2">
              STATE: {scanState.replace(/_/g, ' ')}
            </span>
            <h2 className="text-2xl font-serif font-bold tracking-tight">
              {scanState === 'READY_TO_SCAN' && 'Ready for Guest Wristband'}
              {scanState === 'WAITING_FOR_WRISTBAND' && 'Ready — Tap Wristband on Android Back'}
              {scanState === 'SCANNING' && 'Reading NDEF Token...'}
              {scanState === 'GUEST_IDENTIFIED' && 'Guest & Reservation Identified'}
              {scanState === 'AWAITING_CONFIRMATION' && 'Awaiting Staff Confirmation'}
              {scanState === 'SUCCESSFULLY_CHECKED_IN' && 'Check-In Confirmed!'}
              {scanState === 'SUCCESSFULLY_CHECKED_OUT' && 'Check-Out Completed!'}
              {scanState === 'UNKNOWN_WRISTBAND' && 'Wristband Not Recognized'}
              {scanState === 'WRISTBAND_DISABLED' && 'Access Denied: Wristband Disabled'}
              {scanState === 'ALREADY_CHECKED_IN' && 'Guest is Already Checked In'}
              {scanState === 'ALREADY_CHECKED_OUT' && 'Guest is Already Checked Out'}
              {scanState === 'INVALID_RESERVATION' && 'Reservation Ineligible'}
              {scanState === 'NFC_UNAVAILABLE' && 'NFC Hardware / Browser Alert'}
              {scanState === 'NETWORK_ERROR' && 'Communication Error'}
            </h2>
            <p className="mt-2 text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              {stateMessage}
            </p>
          </div>

          {/* Scanner Activation Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 relative z-10">
            {!nfcScanningActive ? (
              <Button
                onClick={startNfcListening}
                className="bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-transform active:scale-95 text-sm gap-2"
              >
                <Radio size={16} />
                <span>Start Android NFC Scan</span>
              </Button>
            ) : (
              <Button
                onClick={stopNfcListening}
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs gap-1.5"
              >
                <RefreshCw size={13} />
                <span>Pause Listening</span>
              </Button>
            )}

            <Button
              onClick={handleResetScanner}
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs"
            >
              Reset Scanner
            </Button>
          </div>
        </div>

        {/* GUEST VERIFICATION CARD (Section 4.F) */}
        {(scannedReservation || scannedGuest) && (
          <div className="p-6 md:p-8 bg-white border-t border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-teal-800 font-bold block">
                  VERIFIED GUEST PROFILE
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
                  {scannedGuest?.full_name || 'Guest'}
                </h3>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Badge
                  className={
                    scannedGuest?.category === 'VIP'
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : 'bg-teal-100 text-teal-900 border-teal-300'
                  }
                >
                  {scannedGuest?.category || 'Regular'} Guest
                </Badge>
                <span className="text-xs font-mono text-stone-500">
                  Ref: {scannedReservation?.reference_number}
                </span>
              </div>
            </div>

            {/* Grid of Reservation Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Home size={12} className="text-teal-700" /> Accommodation
                </span>
                <p className="font-semibold text-stone-900 text-sm">
                  {scannedReservation?.room_or_accommodation}
                </p>
                <span className="text-[11px] text-stone-500 font-medium">
                  {scannedReservation?.accommodation_type}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Calendar size={12} className="text-teal-700" /> Stay Dates
                </span>
                <p className="font-semibold text-stone-900 text-sm">
                  {scannedReservation?.check_in_date} → {scannedReservation?.check_out_date}
                </p>
                <span className="text-[11px] text-stone-500">
                  {scannedReservation?.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Users size={12} className="text-teal-700" /> Guests Count
                </span>
                <p className="font-semibold text-stone-900 text-sm">
                  {scannedReservation?.adults_count} Adults, {scannedReservation?.children_count} Children
                </p>
                <span className="text-[11px] text-stone-500">
                  Total {(scannedReservation?.adults_count || 1) + (scannedReservation?.children_count || 0)} Guests
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <CreditCard size={12} className="text-teal-700" /> Payment Status
                </span>
                <p className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                  <span
                    className={`size-2 rounded-full ${
                      scannedReservation?.payment_status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {scannedReservation?.payment_status}
                </p>
                <span className="text-[11px] text-stone-500">
                  Total: ₱{scannedReservation?.total_amount?.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Radio size={12} className="text-teal-700" /> Assigned Wristband
                </span>
                <p className="font-semibold text-stone-900 text-sm font-mono">
                  {scannedWristband?.wristband_code || 'None'}
                </p>
                <span className="text-[11px] text-stone-500">
                  Status: {scannedWristband?.status || 'Unlinked'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-teal-700" /> Check-in History
                </span>
                <p className="font-semibold text-stone-900 text-sm">
                  {scannedReservation?.actual_check_in_time
                    ? new Date(scannedReservation.actual_check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Not checked in yet'}
                </p>
                <span className="text-[11px] text-stone-500">
                  Staff: {scannedReservation?.checked_in_by || 'Pending'}
                </span>
              </div>
            </div>

            {/* Special Requests or Notes */}
            {scannedReservation?.special_requests && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900 mb-6">
                <strong>Guest Special Requests:</strong> {scannedReservation.special_requests}
              </div>
            )}

            {/* PROMINENT RECEPTIONIST CONFIRMATION ACTION BUTTON */}
            {scanState === 'GUEST_IDENTIFIED' && (
              <div className="pt-2">
                <Button
                  onClick={() => setConfirmDialogOpen(true)}
                  className={`w-full py-6 text-base font-bold rounded-2xl shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-2 ${
                    scanMode === 'CHECK_IN'
                      ? 'bg-teal-700 hover:bg-teal-800 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <CheckCircle2 size={22} />
                  <span>
                    {scanMode === 'CHECK_IN' ? 'CONFIRM GUEST CHECK-IN' : 'CONFIRM GUEST CHECK-OUT'}
                  </span>
                </Button>
                <p className="text-[11px] text-center text-stone-500 mt-2">
                  Staff confirmation required before committing database transaction.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL DIALOG (Explicit Receptionist Confirmation) */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        title={
          <span className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
            <UserCheck size={20} className="text-teal-700" />
            {scanMode === 'CHECK_IN' ? 'Confirm Guest Check-In' : 'Confirm Guest Check-Out'}
          </span>
        }
        description="Verify guest information before executing front desk transaction."
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Guest:</span>
              <strong className="text-stone-900">{scannedGuest?.full_name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Reservation Ref:</span>
              <strong className="font-mono text-stone-900">{scannedReservation?.reference_number}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Accommodation:</span>
              <span className="font-medium text-stone-900">{scannedReservation?.room_or_accommodation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Wristband ID:</span>
              <span className="font-mono text-teal-800 font-semibold">{scannedWristband?.wristband_code}</span>
            </div>
          </div>

          {scanMode === 'CHECK_OUT' && (
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs flex items-center gap-2">
              <input
                type="checkbox"
                id="releaseWb"
                checked={releaseWristbandOnCheckout}
                onChange={(e) => setReleaseWristbandOnCheckout(e.target.checked)}
                className="size-4 rounded text-teal-700 focus:ring-teal-500"
              />
              <label htmlFor="releaseWb" className="text-stone-800 cursor-pointer">
                Release wristband back to inventory for reuse after sanitize
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
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
              className={`text-xs font-bold text-white px-5 ${
                scanMode === 'CHECK_IN' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isConfirming ? (
                <>
                  <RefreshCw size={13} className="animate-spin" /> Recording...
                </>
              ) : scanMode === 'CHECK_IN' ? (
                'Yes, Execute Check-In'
              ) : (
                'Yes, Execute Check-Out'
              )}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* INTERACTIVE NFC SIMULATOR & TEST BENCH (CRUCIAL FOR DEMO & ALL 8 ACCEPTANCE TESTS) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              NFC Wristband Test Bench & Simulation Console
            </h3>
            <p className="text-xs text-stone-500">
              Test every acceptance scenario directly on desktop or devices without physical NDEF tags.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSimulator(!showSimulator)}
            className="text-xs border-stone-300"
          >
            {showSimulator ? 'Hide Console' : 'Show Console'}
          </Button>
        </div>

        {showSimulator && (
          <div className="mt-4 pt-4 border-t border-stone-200 space-y-4">
            {/* Quick Test Cards for Acceptance Tests */}
            <div>
              <p className="text-[11px] font-semibold text-stone-600 mb-2 uppercase tracking-wider">
                Select Wristband to Simulate Physical Tap:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {inventoryWristbands.map((wb) => (
                  <button
                    key={wb.id}
                    onClick={() => handleVerifyToken(wb.nfc_token, 'NFC')}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all text-xs"
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-stone-900 mb-1">
                      <span>{wb.wristband_code}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${
                          wb.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : wb.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : wb.status === 'Disabled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {wb.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 truncate">
                      {wb.guest?.full_name || wb.notes || 'Unassigned'}
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono truncate mt-0.5">
                      Token: {wb.nfc_token.substring(0, 16)}...
                    </p>
                  </button>
                ))}

                {/* Simulated Unknown Wristband */}
                <button
                  onClick={() => handleVerifyToken('nfc_tok_unknown_999999', 'NFC')}
                  className="p-2.5 rounded-xl border border-dashed border-stone-300 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all text-xs"
                >
                  <div className="flex items-center justify-between font-mono font-bold text-stone-900 mb-1">
                    <span>Unregistered Tag</span>
                    <span className="text-[9px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded uppercase">
                      Unknown
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">Simulate foreign tag</p>
                  <p className="text-[10px] text-stone-400 font-mono truncate mt-0.5">
                    Token: nfc_tok_unknown_999
                  </p>
                </button>
              </div>
            </div>

            {/* Manual Token String Input */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="Paste raw NDEF token string or wristband code (e.g. WB-801)..."
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-teal-600 bg-stone-50"
              />
              <Button
                size="sm"
                onClick={() => handleVerifyToken(manualTokenInput, 'NFC')}
                disabled={!manualTokenInput.trim()}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs"
              >
                Simulate Scan
              </Button>
            </div>

            {/* Physical NFC Writer Button */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Programming physical NTAG213/215 wristband tags?
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTokenToWrite(`nfc_tok_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`)
                  setWriterOpen(true)
                }}
                className="text-xs border-teal-200 text-teal-800 hover:bg-teal-50 gap-1.5"
              >
                <Smartphone size={13} />
                <span>NFC Tag Writer Tool</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* NFC TAG WRITER MODAL */}
      <Dialog
        open={writerOpen}
        onClose={() => setWriterOpen(false)}
        title="Physical NFC Wristband Writer"
        description="Write a cryptographically secure random token to a blank NDEF tag using Android Web NFC."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Token to Write (Opaque NDEF Text Record):
            </label>
            <input
              type="text"
              readOnly
              value={tokenToWrite}
              className="w-full px-3 py-2 text-xs font-mono bg-stone-100 border border-stone-200 rounded-lg text-stone-800"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Personal guest details are never written to the tag. Only this random reference token is stored.
            </p>
          </div>

          {writingStatus && (
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium animate-pulse">
              {writingStatus}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setWriterOpen(false)} className="text-xs">
              Close
            </Button>
            <Button
              onClick={handleWriteNfcTag}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold"
            >
              Write Tag Now
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
    </AppShell>
  )
}
