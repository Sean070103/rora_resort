'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Check,
  AlertTriangle,
  Sparkles,
  Phone,
  MapPin,
  Award,
  Search,
  BookOpen,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

type Step = 'browse' | 'configure' | 'confirm' | 'success'

interface AddonItem {
  id: string
  name: string
  rate: number
  qty: number
}

const EVENT_ADDONS: AddonItem[] = [
  { id: 'tiffany', name: 'Tiffany Chair', rate: 75, qty: 0 },
  { id: 'mono_cover', name: 'Monoblock Chair with Cover', rate: 20, qty: 0 },
  { id: 'mono', name: 'Monoblock Chair', rate: 10, qty: 0 },
  { id: 'table_cover', name: 'Table Round/Long with Cover', rate: 165, qty: 0 },
  { id: 'table', name: 'Table Round/Long', rate: 100, qty: 0 },
]

const TARIFF_ROOMS = [
  { name: 'Deluxe Annex', pax: '2', rate: '₱2,000' },
  { name: 'Deluxe Room (1–11)', pax: '4', rate: '₱2,500' },
  { name: 'Deluxe Room 12', pax: '6', rate: '₱4,000' },
  { name: 'Deluxe Room 13', pax: '6', rate: '₱4,500' },
  { name: 'Family Room 1', pax: '10', rate: '₱6,000' },
  { name: 'Family Room 2', pax: '10', rate: '₱5,000' },
  { name: 'Family Room 3', pax: '15–16', rate: '₱8,000' },
  { name: 'Executive Room', pax: '2–3', rate: '₱4,000' },
  { name: 'Family Executive (1–5)', pax: '5', rate: '₱4,500' },
  { name: 'Dormitory Down', pax: '18', rate: '₱10,000' },
  { name: 'Dormitory Up', pax: '18', rate: '₱10,000' },
  { name: 'Family Package', pax: '30', rate: '₱18,000', highlight: true },
]

const TARIFF_DELUXE = [
  { name: 'Deluxe Annex', pax: '2', rate: '₱2,000' },
  { name: 'Deluxe Room (1–11)', pax: '4', rate: '₱2,500' },
  { name: 'Deluxe Room 12', pax: '6', rate: '₱4,000' },
  { name: 'Deluxe Room 13', pax: '6', rate: '₱4,500' },
  { name: 'Executive Room', pax: '2–3', rate: '₱4,000' },
  { name: 'Family Executive (1–5)', pax: '5', rate: '₱4,500' },
]

const TARIFF_FAMILY = [
  { name: 'Family Room 2', pax: '10', rate: '₱5,000' },
  { name: 'Family Room 1', pax: '10', rate: '₱6,000' },
  { name: 'Family Room 3', pax: '15–16', rate: '₱8,000' },
  { name: 'Dormitory Down', pax: '18', rate: '₱10,000' },
  { name: 'Dormitory Up', pax: '18', rate: '₱10,000' },
  { name: 'Family Package', pax: '30', rate: '₱18,000', highlight: true },
]

export default function BookingPage() {
  const [step, setStep] = useState<Step>('browse')
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'ROOM' | 'COTTAGE' | 'PACKAGE'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Expandable Rates & Info Sheet on Booking
  const [showRatesModal, setShowRatesModal] = useState(false)
  const [showTariffAccordion, setShowTariffAccordion] = useState(false)

  // Dates & Schedule
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [scheduleType, setScheduleType] = useState<'TWELVE_HR' | 'DAY' | 'NIGHT'>('TWELVE_HR')
  const [guestsCount, setGuestsCount] = useState(2)

  // Addons
  const [addons, setAddons] = useState<AddonItem[]>(EVENT_ADDONS)

  // Guest Details
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [policyAgreed, setPolicyAgreed] = useState(false)

  // Loyalty & API Response
  const [loyalty, setLoyalty] = useState<any>(null)
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [availabilityChecked, setAvailabilityChecked] = useState(false)
  const [checkingAvail, setCheckingAvail] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const qCheckIn = urlParams.get('checkIn')
      if (qCheckIn) {
        setCheckIn(qCheckIn)
        setCheckOut(qCheckIn)
      }
    }
    loadRooms()
  }, [])

  async function loadRooms() {
    try {
      const res = await fetch('/api/rooms')
      const data = await res.json()
      if (data.rooms) {
        setRooms(data.rooms.filter((r: any) => r.isActive !== false))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function checkAvailability() {
    if (!selectedRoom || !checkIn) return
    setCheckingAvail(true)
    setError('')
    try {
      const effectiveOut = checkOut || checkIn
      const res = await fetch(`/api/rooms?checkIn=${checkIn}&checkOut=${effectiveOut}`)
      const data = await res.json()
      const roomData = data.rooms?.find((r: any) => r.id === selectedRoom.id)
      if (roomData?.isAvailable === false) {
        setError('Accommodation unavailable for this date. Please pick another date or room.')
        setAvailabilityChecked(false)
      } else {
        setAvailabilityChecked(true)
      }
    } catch (err: any) {
      setError(err.message || 'Availability error')
    } finally {
      setCheckingAvail(false)
    }
  }

  async function fetchLoyalty() {
    if (!guestPhone) return
    try {
      const base = selectedRoom?.basePrice || 0
      const addonTotal = addons.reduce((sum, a) => sum + a.rate * a.qty, 0)
      const subtotal = base * computeNights() + addonTotal
      const res = await fetch('/api/loyalty/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: guestPhone, email: guestEmail, subtotal }),
      })
      const data = await res.json()
      if (data.loyalty) setLoyalty(data)
    } catch (err) {
      console.error(err)
    }
  }

  function computeNights() {
    if (!checkIn || !checkOut || checkIn === checkOut) return 1
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  function updateAddonQty(id: string, delta: number) {
    setAddons((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRoom || !checkIn || !guestName || !guestEmail || !guestPhone) {
      setError('Please provide all required fields.')
      return
    }
    if (!policyAgreed) {
      setError('Please confirm that you agree to all resort policies.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const effectiveOut = checkOut || checkIn
      const addonSummary = addons
        .filter((a) => a.qty > 0)
        .map((a) => `${a.name} x${a.qty}`)
        .join(', ')

      const finalNotes = [
        notes,
        scheduleType === 'DAY' ? 'Schedule: Day Swimming (7 AM–5 PM)' : scheduleType === 'NIGHT' ? 'Schedule: Night Swimming (7 PM–5 AM)' : 'Schedule: 12-Hour Stay',
        addonSummary ? `Event Add-ons: ${addonSummary}` : '',
      ]
        .filter(Boolean)
        .join(' | ')

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkInDate: checkIn,
          checkOutDate: effectiveOut,
          guestsCount,
          guestName,
          guestEmail,
          guestPhone,
          notes: finalNotes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setBooking(data.reservation)
        setStep('success')
      } else {
        setError(data.error || 'Failed to submit reservation.')
      }
    } catch (err: any) {
      setError(err.message || 'Submission error')
    } finally {
      setSubmitting(false)
    }
  }

  const nights = computeNights()
  const baseRate = selectedRoom ? selectedRoom.basePrice * (selectedRoom.seasonalMultiplier || 1) : 0
  const roomSubtotal = baseRate * nights
  const addonsTotal = addons.reduce((sum, a) => sum + a.rate * a.qty, 0)
  const totalBeforeDiscount = roomSubtotal + addonsTotal
  const discountPercent = loyalty?.loyalty?.tier?.discountPercentage || 0
  const discountAmount = Math.round((totalBeforeDiscount * discountPercent) / 100)
  const grandTotal = totalBeforeDiscount - discountAmount

  const filteredRooms = rooms.filter((r) => {
    const matchesCat =
      activeCategory === 'ALL' ||
      (activeCategory === 'ROOM' && r.type === 'ROOM') ||
      (activeCategory === 'COTTAGE' && r.type === 'COTTAGE') ||
      (activeCategory === 'PACKAGE' && r.type === 'PACKAGE')

    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCat && matchesSearch
  })

  return (
    <div className="book-wrap">
      {/* ── Topbar ────────────────────────────────────────────── */}
      <header className="book-topbar">
        <Link href="/" className="wordmark">
          <span className="wordmark-flower">✳</span>
          <div>
            <span>QUEEN AURORA&apos;S</span>
            <small>ONLINE RESERVATION ENGINE</small>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="nb-btn nb-btn-light nb-btn-sm"
            onClick={() => setShowRatesModal(true)}
          >
            <BookOpen size={13} /> Rates &amp; Information
          </button>
          <a href="tel:+639478053279" style={{ fontSize: '11px', fontWeight: 700, color: '#1f382b' }} className="hidden md:inline">
            +63 947 805-3279
          </a>
          <Link href="/" className="nb-btn nb-btn-sm nb-btn-light">
            <ArrowLeft size={12} /> Back
          </Link>
        </div>
      </header>

      {/* ── Stepper ───────────────────────────────────────────── */}
      {step !== 'success' && (
        <div className="book-stepper">
          {[
            { key: 'browse', label: '1. Accommodation', num: 1 },
            { key: 'configure', label: '2. Dates & Schedule', num: 2 },
            { key: 'confirm', label: '3. Details & Review', num: 3 },
          ].map((s, idx) => {
            const stepOrder = ['browse', 'configure', 'confirm']
            const currentIdx = stepOrder.indexOf(step)
            const isDone = idx < currentIdx
            const isActive = step === s.key

            return (
              <React.Fragment key={s.key}>
                <div className={`b-step ${isActive ? 'active' : isDone ? 'done' : ''}`}>
                  <span className="b-step-num">{isDone ? <Check size={12} /> : s.num}</span>
                  <span>{s.label}</span>
                </div>
                {idx < 2 && <span className="b-line" />}
              </React.Fragment>
            )
          })}
        </div>
      )}

      {/* ── Main Container ────────────────────────────────────── */}
      <main style={{ maxWidth: '960px', width: '100%', margin: '0 auto', padding: '32px 5% 70px', flex: 1 }}>
        {/* Collapsible Rates & Information Sheet Banner */}
        <div
          style={{
            border: '2px solid #111',
            boxShadow: '3px 3px 0px #111',
            background: '#ffffff',
            padding: '14px 18px',
            marginBottom: '26px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => setShowTariffAccordion(!showTariffAccordion)}
          >
            <div>
              <span className="nb-pill" style={{ background: '#eaf0e6', marginBottom: '4px' }}>
                OFFICIAL TARIFF CARD
              </span>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1f382b' }}>
                Rates &amp; Accommodations Overview (12 Hours)
              </div>
            </div>
            <button
              type="button"
              className="nb-btn nb-btn-light nb-btn-sm"
              style={{ pointerEvents: 'none' }}
            >
              {showTariffAccordion ? <><ChevronUp size={13} /> Hide Tariff</> : <><ChevronDown size={13} /> View Rates Table</>}
            </button>
          </div>

          {showTariffAccordion && (
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #dcdfd2' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#1f382b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Deluxe &amp; Executive (2–6 Pax)
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>ROOM</th>
                        <th>PAX</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TARIFF_DELUXE.map((r) => (
                        <tr key={r.name}>
                          <td><strong>{r.name}</strong></td>
                          <td>{r.pax}</td>
                          <td className="rate-cell">{r.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#1f382b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Family Suites &amp; Dorms (10–30 Pax)
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>ROOM</th>
                        <th>PAX</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TARIFF_FAMILY.map((r) => (
                        <tr key={r.name} className={r.highlight ? 'highlight' : ''}>
                          <td><strong>{r.name}</strong></td>
                          <td>{r.pax}</td>
                          <td className="rate-cell">{r.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: '14px', padding: '10px 12px', background: '#fbfaf4', border: '1px solid #111', fontSize: '11px', color: '#1f382b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span>🏊 Day Swimming: ₱150/head · Night Swimming: ₱200/head</span>
                <span>🏡 Gazebos / Cottages: ₱1,500 – ₱3,000 (No Cottage, No Entry)</span>
              </div>
            </div>
          )}
        </div>

        {/* ════════════ STEP 1: CHOOSE ACCOMMODATION ════════════ */}
        {step === 'browse' && (
          <div>
            <div style={{ marginBottom: '22px' }}>
              <span className="eyebrow">STEP 1 OF 3 · SELECT ACCOMMODATION</span>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', margin: '4px 0 8px', color: '#1f382b' }}>
                Choose your stay.
              </h1>
              <p style={{ fontSize: '12px', color: '#687367', margin: 0 }}>
                Select from our 12-hour rooms, shaded garden gazebos, or grand event venues.
              </p>

              {/* Minimal Filters */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '18px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    className={`nb-btn nb-btn-sm ${activeCategory === 'ALL' ? '' : 'nb-btn-light'}`}
                    onClick={() => setActiveCategory('ALL')}
                    type="button"
                  >
                    All ({rooms.length})
                  </button>
                  <button
                    className={`nb-btn nb-btn-sm ${activeCategory === 'ROOM' ? '' : 'nb-btn-light'}`}
                    onClick={() => setActiveCategory('ROOM')}
                    type="button"
                  >
                    12-hr Rooms
                  </button>
                  <button
                    className={`nb-btn nb-btn-sm ${activeCategory === 'COTTAGE' ? '' : 'nb-btn-light'}`}
                    onClick={() => setActiveCategory('COTTAGE')}
                    type="button"
                  >
                    Gazebos &amp; Cottages
                  </button>
                  <button
                    className={`nb-btn nb-btn-sm ${activeCategory === 'PACKAGE' ? '' : 'nb-btn-light'}`}
                    onClick={() => setActiveCategory('PACKAGE')}
                    type="button"
                  >
                    Event Venues
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #111', padding: '4px 10px', gap: '6px', width: '220px' }}>
                  <Search size={13} color="#778174" />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 0, outline: 'none', background: 'transparent', fontSize: '11px', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '12px', color: '#687367' }}>
                Loading Queen Aurora accommodations…
              </div>
            ) : filteredRooms.length === 0 ? (
              <div style={{ border: '1.5px solid #111', padding: '24px', textAlign: 'center', background: '#fff' }}>
                <p style={{ fontSize: '12px', margin: '0 0 10px' }}>No accommodations match your filter.</p>
                <button className="nb-btn nb-btn-sm nb-btn-light" onClick={() => { setActiveCategory('ALL'); setSearchQuery('') }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filteredRooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id
                  const isCottage = room.type === 'COTTAGE'
                  const isEvent = room.type === 'PACKAGE' && room.capacity >= 50
                  const timeLabel = isCottage ? 'COTTAGE' : isEvent ? 'VENUE' : '12 HOURS'

                  return (
                    <div
                      key={room.id}
                      style={{
                        background: '#ffffff',
                        border: isSelected ? '2px solid #1f382b' : '1.5px solid #111',
                        boxShadow: isSelected ? '4px 4px 0px #1f382b' : '2px 2px 0px #111',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                      }}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div>
                        <div style={{ height: '140px', border: '1px solid #111', marginBottom: '12px', position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={room.photos?.[0] || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ptJYAW4Nc0nc5uSjXobR2m1gYIIkIx.png'}
                            alt={room.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span className="nb-pill" style={{ position: 'absolute', bottom: '6px', left: '6px' }}>
                            {timeLabel}
                          </span>
                          {isSelected && (
                            <span className="nb-pill" style={{ position: 'absolute', top: '6px', right: '6px', background: '#dce7d6' }}>
                              ✓ SELECTED
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <strong style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1f382b', display: 'block' }}>
                              {room.name}
                            </strong>
                            <div style={{ fontSize: '10px', color: '#687367', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Users size={11} /> Capacity: {room.capacity} pax
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: 700, color: '#1f382b' }}>
                              ₱{room.basePrice.toLocaleString()}
                            </div>
                            <span style={{ fontSize: '9px', color: '#778174' }}>/{timeLabel.toLowerCase()}</span>
                          </div>
                        </div>

                        <p style={{ fontSize: '11px', color: '#556459', lineHeight: 1.5, margin: '6px 0 12px' }}>
                          {room.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        className={`nb-btn nb-btn-sm ${isSelected ? '' : 'nb-btn-light'}`}
                        style={{ width: '100%' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRoom(room)
                          setGuestsCount(Math.min(room.capacity, 4))
                          setStep('configure')
                        }}
                      >
                        {isSelected ? 'Configure Dates →' : 'Select Room →'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {selectedRoom && (
              <div
                style={{
                  marginTop: '24px',
                  padding: '14px 20px',
                  background: '#ffffff',
                  border: '2px solid #111',
                  boxShadow: '3px 3px 0px #111',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <span className="nb-pill" style={{ background: '#dce7d6' }}>READY TO SCHEDULE</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f382b', marginTop: '2px' }}>
                    {selectedRoom.name} — ₱{selectedRoom.basePrice.toLocaleString()}
                  </div>
                </div>
                <button
                  className="nb-btn"
                  onClick={() => {
                    setGuestsCount(Math.min(selectedRoom.capacity, 4))
                    setStep('configure')
                  }}
                  type="button"
                >
                  Configure Dates &amp; Schedule <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════ STEP 2: DATES & SCHEDULE ════════════ */}
        {step === 'configure' && selectedRoom && (
          <div>
            <button
              className="nb-btn nb-btn-light nb-btn-sm"
              onClick={() => setStep('browse')}
              type="button"
              style={{ marginBottom: '14px' }}
            >
              <ArrowLeft size={12} /> Change accommodation
            </button>

            <span className="eyebrow">STEP 2 OF 3 · SCHEDULE CONFIGURATION</span>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', margin: '4px 0 16px', color: '#1f382b' }}>
              Select dates &amp; schedule.
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#ffffff', border: '2px solid #111', boxShadow: '3px 3px 0px #111', padding: '20px' }}>
                <div style={{ display: 'grid', gap: '14px' }}>
                  <div className="hb-field">
                    <span>VISIT SCHEDULE / TIMING</span>
                    <select
                      value={scheduleType}
                      onChange={(e) => setScheduleType(e.target.value as any)}
                    >
                      <option value="TWELVE_HR">12-Hour Stay (Check-in flexibility)</option>
                      <option value="DAY">Day Tour Schedule (7:00 AM – 5:00 PM)</option>
                      <option value="NIGHT">Night Tour Schedule (7:00 PM – 5:00 AM)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="hb-field">
                      <span>CHECK-IN DATE</span>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={checkIn}
                        onChange={(e) => {
                          setCheckIn(e.target.value)
                          if (!checkOut || checkOut < e.target.value) setCheckOut(e.target.value)
                          setAvailabilityChecked(false)
                        }}
                        required
                      />
                    </div>
                    <div className="hb-field">
                      <span>CHECK-OUT DATE</span>
                      <input
                        type="date"
                        min={checkIn || new Date().toISOString().slice(0, 10)}
                        value={checkOut}
                        onChange={(e) => {
                          setCheckOut(e.target.value)
                          setAvailabilityChecked(false)
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="hb-field">
                    <span>PARTY SIZE (MAX: {selectedRoom.capacity} PAX)</span>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                    >
                      {Array.from({ length: selectedRoom.capacity }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Event equipment add-ons */}
                  {selectedRoom.type === 'PACKAGE' && (
                    <div style={{ border: '1px solid #dcdfd2', padding: '12px', background: '#fbfaf4' }}>
                      <span className="nb-pill" style={{ background: '#fff', marginBottom: '6px' }}>
                        OPTIONAL EVENT RENTALS
                      </span>
                      <div style={{ display: 'grid', gap: '6px', marginTop: '6px' }}>
                        {addons.map((addon) => (
                          <div
                            key={addon.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '11px',
                              borderBottom: '1px solid #e8e8e8',
                              paddingBottom: '4px',
                            }}
                          >
                            <div>
                              <span>{addon.name}</span>
                              <span style={{ color: '#778174', marginLeft: '6px' }}>(₱{addon.rate}/pc)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => updateAddonQty(addon.id, -5)}
                                style={{ width: '22px', height: '22px', border: '1px solid #111', background: '#fff', cursor: 'pointer' }}
                              >
                                -
                              </button>
                              <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 700 }}>{addon.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateAddonQty(addon.id, 5)}
                                style={{ width: '22px', height: '22px', border: '1px solid #111', background: '#fff', cursor: 'pointer' }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`nb-btn ${availabilityChecked ? '' : 'nb-btn-light'}`}
                    onClick={checkAvailability}
                    disabled={!checkIn || checkingAvail}
                    style={{ width: '100%' }}
                  >
                    {checkingAvail ? (
                      'Checking Live Database…'
                    ) : availabilityChecked ? (
                      <>
                        <Check size={14} /> Available on {checkIn}
                      </>
                    ) : (
                      'Verify Live Availability'
                    )}
                  </button>

                  {error && (
                    <div style={{ border: '1.5px solid #d9534f', padding: '10px', background: '#fff0f0', color: '#c9302c', fontSize: '11px' }}>
                      <AlertTriangle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {error}
                    </div>
                  )}

                  {availabilityChecked && (
                    <div style={{ border: '1.5px solid #1f382b', padding: '10px', background: '#f0ede1', color: '#1f382b', fontSize: '11px' }}>
                      <Check size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      Confirmed Available! Proceed to finalize your reservation.
                    </div>
                  )}
                </div>
              </div>

              {/* Price card */}
              <div style={{ background: '#ffffff', border: '2px solid #111', boxShadow: '3px 3px 0px #111', padding: '20px', height: 'fit-content' }}>
                <span className="nb-pill" style={{ background: '#eaf0e6', marginBottom: '8px' }}>
                  RATE BREAKDOWN
                </span>
                <strong style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1f382b', display: 'block', margin: '4px 0 10px' }}>
                  {selectedRoom.name}
                </strong>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 700, color: '#1f382b' }}>
                  ₱{baseRate.toLocaleString()} <span style={{ fontSize: '11px', color: '#778174' }}>/ 12 hrs</span>
                </div>

                <div style={{ display: 'grid', gap: '8px', fontSize: '12px', borderTop: '1px solid #dcdfd2', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#556459' }}>
                    <span>Accommodation ({nights} slot)</span>
                    <span>₱{roomSubtotal.toLocaleString()}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#556459' }}>
                      <span>Event Add-ons</span>
                      <span>₱{addonsTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #111', paddingTop: '8px', fontSize: '15px', fontWeight: 700, color: '#1f382b' }}>
                    <span>Estimated Total</span>
                    <span>₱{totalBeforeDiscount.toLocaleString()}</span>
                  </div>
                </div>

                {availabilityChecked && (
                  <button
                    className="nb-btn"
                    style={{ width: '100%', marginTop: '18px' }}
                    onClick={() => setStep('confirm')}
                    type="button"
                  >
                    Continue to Guest Details <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ STEP 3: DETAILS & REVIEW ════════════ */}
        {step === 'confirm' && selectedRoom && (
          <div>
            <button
              className="nb-btn nb-btn-light nb-btn-sm"
              onClick={() => setStep('configure')}
              type="button"
              style={{ marginBottom: '14px' }}
            >
              <ArrowLeft size={12} /> Adjust dates
            </button>

            <span className="eyebrow">STEP 3 OF 3 · GUEST DETAILS &amp; CONFIRMATION</span>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', margin: '4px 0 16px', color: '#1f382b' }}>
              Confirm your reservation.
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#ffffff', border: '2px solid #111', boxShadow: '3px 3px 0px #111', padding: '20px' }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div className="hb-field">
                    <span>GUEST FULL NAME *</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                  <div className="hb-field">
                    <span>EMAIL ADDRESS *</span>
                    <input
                      type="email"
                      required
                      placeholder="e.g. maria@gmail.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                  <div className="hb-field">
                    <span>MOBILE NUMBER *</span>
                    <input
                      type="tel"
                      required
                      placeholder="+63 947 XXX XXXX"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                  <div className="hb-field">
                    <span>SPECIAL REQUESTS / EVENT REMARKS</span>
                    <textarea
                      rows={2}
                      placeholder="Arrival window, requests..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ border: '1.5px solid #dcdfd2', padding: '8px', fontSize: '11px', background: '#fbfaf4' }}
                    />
                  </div>

                  <button
                    type="button"
                    className="nb-btn nb-btn-light nb-btn-sm"
                    onClick={fetchLoyalty}
                  >
                    <Award size={13} /> Check Loyalty Member Discounts
                  </button>

                  {loyalty && (
                    <div style={{ border: '1.5px solid #1f382b', padding: '10px', background: '#eaf0e6', fontSize: '11px' }}>
                      <strong style={{ color: '#1f382b' }}>
                        <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        {loyalty.loyalty.tier.tier} Member Tier Recognized!
                      </strong>
                      <div style={{ color: '#556459', marginTop: '2px' }}>
                        {loyalty.loyalty.tier.discountPercentage > 0
                          ? `${loyalty.loyalty.tier.discountPercentage}% automatic discount applied!`
                          : 'First visit recorded towards Silver Tier status (10% off)!'}
                      </div>
                    </div>
                  )}

                  {/* Policy acceptance */}
                  <div style={{ border: '1px solid #dcdfd2', padding: '12px', background: '#fbfaf4' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#1f382b', marginBottom: '6px' }}>
                      Resort Policies Acceptance
                    </div>
                    <ul style={{ margin: '0 0 8px 14px', padding: 0, fontSize: '10px', color: '#556459', lineHeight: 1.5 }}>
                      <li>Strictly NO PETS ALLOWED anywhere on the property.</li>
                      <li>&ldquo;NO COTTAGE, NO ENTRY&rdquo; applies for swimming visitors.</li>
                      <li>Reservation payments are NON-REFUNDABLE &amp; NON-TRANSFERABLE.</li>
                    </ul>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '10px', fontWeight: 600, color: '#1f382b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={policyAgreed}
                        onChange={(e) => setPolicyAgreed(e.target.checked)}
                        required
                        style={{ marginTop: '2px' }}
                      />
                      <span>I agree to all Queen Aurora&apos;s resort rules and payment policies.</span>
                    </label>
                  </div>

                  {error && (
                    <div style={{ border: '1.5px solid #d9534f', padding: '8px', background: '#fff0f0', color: '#c9302c', fontSize: '11px' }}>
                      <AlertTriangle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="nb-btn"
                    disabled={submitting}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    {submitting ? 'Submitting Reservation…' : <>Confirm Reservation <ArrowRight size={13} /></>}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div style={{ background: '#ffffff', border: '2px solid #111', boxShadow: '3px 3px 0px #111', padding: '20px', height: 'fit-content' }}>
                <span className="nb-pill" style={{ background: '#eaf0e6', marginBottom: '8px' }}>
                  RESERVATION SUMMARY
                </span>
                <strong style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1f382b', display: 'block', margin: '4px 0 10px' }}>
                  {selectedRoom.name}
                </strong>

                <div style={{ display: 'grid', gap: '8px', fontSize: '11px', borderTop: '1px solid #dcdfd2', paddingTop: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#556459' }}>
                    <span>Check-in</span>
                    <strong>{checkIn}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#556459' }}>
                    <span>Check-out</span>
                    <strong>{checkOut}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#556459' }}>
                    <span>Schedule</span>
                    <strong>{scheduleType === 'DAY' ? 'Day (7 AM–5 PM)' : scheduleType === 'NIGHT' ? 'Night (7 PM–5 AM)' : '12-Hour Stay'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#556459' }}>
                    <span>Party Size</span>
                    <strong>{guestsCount} pax</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '6px', fontSize: '11px', borderTop: '1px solid #dcdfd2', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#556459' }}>
                    <span>Accommodation</span>
                    <span>₱{roomSubtotal.toLocaleString()}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#556459' }}>
                      <span>Event Add-ons</span>
                      <span>₱{addonsTotal.toLocaleString()}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1f382b', fontWeight: 700 }}>
                      <span>Loyalty ({discountPercent}%)</span>
                      <span>−₱{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #111', paddingTop: '8px', fontSize: '16px', fontWeight: 700, color: '#1f382b' }}>
                    <span>Grand Total</span>
                    <span>₱{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ════════════ STEP 4: CONFIRMED VOUCHER ════════════ */}
        {step === 'success' && booking && (
          <div style={{ maxWidth: '580px', margin: '0 auto' }}>
            <div
              style={{
                background: '#ffffff',
                border: '2px solid #111',
                boxShadow: '4px 4px 0px #111',
                padding: '28px',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <span className="nb-pill" style={{ background: '#dce7d6', marginBottom: '6px' }}>
                  ✓ CONFIRMED RESERVATION VOUCHER
                </span>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', margin: '4px 0', color: '#1f382b' }}>
                  Reservation Received!
                </h1>
                <p style={{ fontSize: '11px', color: '#687367', margin: 0 }}>
                  Thank you, {booking.guestName}. Please save your official reference code.
                </p>
              </div>

              <div
                style={{
                  border: '1.5px dashed #111',
                  background: '#fbfaf4',
                  padding: '14px',
                  textAlign: 'center',
                  marginBottom: '18px',
                }}
              >
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#778174' }}>
                  BOOKING REFERENCE NUMBER
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '26px', fontWeight: 800, letterSpacing: '0.06em', color: '#1f382b', margin: '2px 0' }}>
                  {booking.referenceNumber}
                </div>
                <div style={{ fontSize: '9px', color: '#778174' }}>Present upon check-in at the resort reception desk</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', borderBottom: '1px solid #dcdfd2', paddingBottom: '14px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '8px', color: '#778174', textTransform: 'uppercase' }}>Accommodation</span>
                  <div style={{ fontWeight: 700, color: '#1f382b' }}>{booking.roomName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: '#778174', textTransform: 'uppercase' }}>Party</span>
                  <div style={{ fontWeight: 700, color: '#1f382b' }}>{booking.guestsCount} pax</div>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: '#778174', textTransform: 'uppercase' }}>Check-In</span>
                  <div style={{ fontWeight: 700, color: '#1f382b' }}>{booking.checkInDate}</div>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: '#778174', textTransform: 'uppercase' }}>Check-Out</span>
                  <div style={{ fontWeight: 700, color: '#1f382b' }}>{booking.checkOutDate}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: 700, color: '#1f382b', marginBottom: '18px' }}>
                <span>Total Amount Due:</span>
                <span>₱{booking.totalAmount.toLocaleString()}</span>
              </div>

              <div style={{ border: '1px solid #dcdfd2', padding: '12px', background: '#fbfaf4', fontSize: '11px', lineHeight: 1.6, color: '#556459', marginBottom: '18px' }}>
                <strong>Deposit Arrangements:</strong> Front desk staff will contact you via <strong>{booking.guestPhone}</strong> or <strong>{booking.guestEmail}</strong> to confirm your slot and provide official payment details. Reminder: <em>&ldquo;No Down Payment, No Reservation&rdquo;</em> and <em>&ldquo;Strictly No Pets Allowed&rdquo;</em>.
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Link href="/" className="nb-btn">
                  Back to Resort
                </Link>
                <button
                  className="nb-btn nb-btn-light"
                  onClick={() => {
                    setStep('browse')
                    setSelectedRoom(null)
                    setBooking(null)
                    setLoyalty(null)
                  }}
                  type="button"
                >
                  Make Another Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── RATES & INFORMATION MODAL SHEET ───────────────────── */}
      {showRatesModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowRatesModal(false)}
        >
          <div
            className="min-modal"
            style={{ maxWidth: '720px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={() => setShowRatesModal(false)}>
              <X size={16} />
            </button>

            <span className="eyebrow">RESORT DIRECTORY</span>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', margin: '4px 0 16px', color: '#1f382b' }}>
              Rates &amp; Information Guide
            </h2>

            {/* Rooms Table (Compact 2-Column Grid) */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '15px', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1f382b', marginBottom: '8px', borderBottom: '1.5px solid #111', paddingBottom: '4px' }}>
                Rooms &amp; Accommodations <span style={{ fontSize: '11px', fontWeight: 400, color: '#778174' }}>· Rates are for 12 hours</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#1f382b', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Deluxe &amp; Executive (2–6 Pax)
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>ROOM</th>
                        <th>PAX</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TARIFF_DELUXE.map((r) => (
                        <tr key={r.name}>
                          <td><strong>{r.name}</strong></td>
                          <td>{r.pax}</td>
                          <td className="rate-cell">{r.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#1f382b', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Family Suites &amp; Dorms (10–30 Pax)
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>ROOM</th>
                        <th>PAX</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TARIFF_FAMILY.map((r) => (
                        <tr key={r.name} className={r.highlight ? 'highlight' : ''}>
                          <td><strong>{r.name}</strong></td>
                          <td>{r.pax}</td>
                          <td className="rate-cell">{r.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Swimming & Gazebos (Side-by-side 2 columns) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1f382b', marginBottom: '8px', borderBottom: '1.5px solid #111', paddingBottom: '4px' }}>
                Entrance Fees &amp; Cottages
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#1f382b', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Swimming Schedules
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>SCHEDULE</th>
                        <th>HOURS</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Day Swimming</strong></td>
                        <td style={{ color: '#556459', fontSize: '11px' }}>7 AM – 5 PM</td>
                        <td className="rate-cell">₱150 / head</td>
                      </tr>
                      <tr>
                        <td><strong>Night Swimming</strong></td>
                        <td style={{ color: '#556459', fontSize: '11px' }}>7 PM – 5 AM</td>
                        <td className="rate-cell">₱200 / head</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#1f382b', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Gazebo / Cottage (&ldquo;No Cottage, No Entry&rdquo;)
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>CAPACITY</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1–10 pax</td>
                        <td className="rate-cell">₱1,500</td>
                      </tr>
                      <tr>
                        <td>11–15 pax</td>
                        <td className="rate-cell">₱2,000</td>
                      </tr>
                      <tr>
                        <td>20 pax</td>
                        <td className="rate-cell">₱3,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="min-policy-box" style={{ marginTop: '16px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f382b', marginBottom: '8px' }}>
                Resort &amp; Payment Policies
              </div>
              <ul className="min-policy-list" style={{ fontSize: '11px', gap: '8px' }}>
                <li>🚫 Strictly NO PETS ALLOWED anywhere on resort premises.</li>
                <li>🏡 &ldquo;NO COTTAGE, NO ENTRY&rdquo; applies for swimming guests.</li>
                <li>💳 Reservation payments are NON-REFUNDABLE &amp; NON-TRANSFERABLE.</li>
                <li>🔒 NO DOWN PAYMENT, NO RESERVATION.</li>
              </ul>
            </div>

            <button
              className="nb-btn"
              style={{ width: '100%', marginTop: '18px' }}
              onClick={() => setShowRatesModal(false)}
            >
              Close Guide &amp; Continue Booking
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
