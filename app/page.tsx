'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Menu,
  Phone,
  X,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'

const photos = [
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ptJYAW4Nc0nc5uSjXobR2m1gYIIkIx.png', alt: 'Turquoise swimming pool beneath a bright sky and tropical garden', label: 'The garden pool', category: 'Pool' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1gxchwNgwDNiM3hBJ8qqRvwmLNqMzQ.png', alt: 'A calm pool framed by tall trees and flowering bougainvillea', label: 'A quieter kind of day', category: 'Garden' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wLIUSTxIiOrRcdtn3VVKEMpDdOt6Xy.png', alt: 'Resort swimming pool looking out toward the lake', label: 'By the water', category: 'Pool' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-BHGKOr0SoJ5WMof3lmd8NfNRgRsxEb.png', alt: 'The resort entrance beneath a red tiled roof and mature trees', label: 'A warm welcome', category: 'Resort' },
]

const facilities = [
  { number: '01', name: 'Swimming pool', note: 'Day (₱150) & Night (₱200) swimming under open skies.', icon: '↗' },
  { number: '02', name: 'Garden grounds', note: 'Lush green spaces made for slowing down together.', icon: '↗' },
  { number: '03', name: 'Gazebo & cottages', note: 'Shaded open cottages (1–20 pax) for groups and gatherings.', icon: '↗' },
  { number: '04', name: 'Lakefront views', note: 'A peaceful setting to take in the beauty of Laguna.', icon: '↗' },
]

const ROOM_ROWS = [
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

const DELUXE_ROOMS = [
  { name: 'Deluxe Annex', pax: '2', rate: '₱2,000' },
  { name: 'Deluxe Room (1–11)', pax: '4', rate: '₱2,500' },
  { name: 'Deluxe Room 12', pax: '6', rate: '₱4,000' },
  { name: 'Deluxe Room 13', pax: '6', rate: '₱4,500' },
  { name: 'Executive Room', pax: '2–3', rate: '₱4,000' },
  { name: 'Family Executive (1–5)', pax: '5', rate: '₱4,500' },
]

const FAMILY_ROOMS = [
  { name: 'Family Room 2', pax: '10', rate: '₱5,000' },
  { name: 'Family Room 1', pax: '10', rate: '₱6,000' },
  { name: 'Family Room 3', pax: '15–16', rate: '₱8,000' },
  { name: 'Dormitory Down', pax: '18', rate: '₱10,000' },
  { name: 'Dormitory Up', pax: '18', rate: '₱10,000' },
  { name: 'Family Package', pax: '30', rate: '₱18,000', highlight: true },
]

const EVENT_ROWS = [
  { name: 'Function Hall', cap: '100 pax', rate: '₱20,000' },
  { name: 'Function Hall (Half)', cap: '50 pax', rate: '₱12,500' },
  { name: 'Pavilion w/ Round Pool', cap: '100 pax', rate: '₱15,000' },
  { name: 'Octagon Hall', cap: '100 pax', rate: '₱25,000' },
  { name: 'Big Pavilion', cap: '200–300 pax', rate: '₱80,000', highlight: true },
]

const COTTAGE_ROWS = [
  { cap: '1–10 pax', rate: '₱1,500' },
  { cap: '11–15 pax', rate: '₱2,000' },
  { cap: '20 pax', rate: '₱3,000' },
]

const RENTALS = [
  { item: 'Monoblock Chair', rate: '₱10.00' },
  { item: 'Monoblock Chair with Cover', rate: '₱20.00' },
  { item: 'Tiffany Chair', rate: '₱75.00' },
  { item: 'Tables Round / Long', rate: '₱100.00' },
  { item: 'Tables Round / Long with Cover', rate: '₱165.00' },
]

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activePhoto, setActivePhoto] = useState<number | null>(null)
  const [galleryFilter, setGalleryFilter] = useState('All')
  const [submitted, setSubmitted] = useState(false)
  const [ratesTab, setRatesTab] = useState<'ROOMS' | 'SWIMMING' | 'EVENTS' | 'POLICIES' | 'ALL'>('ROOMS')

  // Booking states
  const [bookingCategory, setBookingCategory] = useState<'ROOMS' | 'SWIMMING' | 'EVENTS'>('ROOMS')
  const [checkin, setCheckin] = useState('')
  const [guests, setGuests] = useState('2 guests')
  const [selectedRoomName, setSelectedRoomName] = useState('Deluxe Room (1–11)')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  const filteredPhotos = galleryFilter === 'All' ? photos : photos.filter((photo) => photo.category === galleryFilter)

  function openBookingWith(category: 'ROOMS' | 'SWIMMING' | 'EVENTS', roomName?: string) {
    setBookingCategory(category)
    if (roomName) setSelectedRoomName(roomName)
    setSubmitted(false)
    setBookingOpen(true)
  }

  return (
    <main>
      {/* ── Minimal Header ───────────────────────────────────── */}
      <header className="site-header">
        <Link href="/" className="wordmark">
          <span className="wordmark-flower">✳</span>
          <div>
            <span>QUEEN AURORA&apos;S</span>
            <small>GARDEN RESORT</small>
          </div>
        </Link>

        <nav className={mobileOpen ? 'main-nav is-open' : 'main-nav'}>
          <a href="#rates" onClick={() => setMobileOpen(false)}>Rates &amp; Info</a>
          <a href="#story" onClick={() => setMobileOpen(false)}>The Resort</a>
          <a href="#facilities" onClick={() => setMobileOpen(false)}>Experiences</a>
          <a href="#gallery" onClick={() => setMobileOpen(false)}>Gallery</a>
          <a href="#visit" onClick={() => setMobileOpen(false)}>Find Us</a>
          <Link href="/book" onClick={() => setMobileOpen(false)} style={{ fontWeight: 800, textDecoration: 'underline' }}>
            Book Online →
          </Link>
        </nav>

        <div className="header-actions">
          <a href="tel:+639478053279" style={{ fontSize: '11px', fontWeight: 700, color: '#263e32' }} className="hidden sm:inline">
            +63 947 805-3279
          </a>
          <button className="nb-btn nb-btn-sm" onClick={() => openBookingWith('ROOMS')}>
            Book Now <ArrowRight size={13} />
          </button>
          <button className="menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle Menu">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section
        className="hero"
        id="home"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(20,36,28,0.7) 0%, rgba(20,36,28,0.4) 60%, rgba(20,36,28,0.2) 100%), url("${photos[2].src}")`,
        }}
      >
        <div className="hero-topline">
          <span>A LITTLE CLOSER TO NATURE</span>
          <span>EST. IN CABUYAO CITY · LAGUNA</span>
        </div>

        <div className="hero-copy">
          <span className="eyebrow" style={{ color: '#e7ece4' }}>YOUR GARDEN ESCAPE</span>
          <h1>
            Room to breathe.<br />
            <em>Space to belong.</em>
          </h1>
          <p className="hero-description">
            A gentle pause in Barangay Marinig, Cabuyao. Shaded open-air gazebos, crystal swimming pools, and 12-hour private air-conditioned suites.
          </p>

          <div className="hero-buttons">
            <button className="nb-btn nb-btn-light" onClick={() => openBookingWith('ROOMS')}>
              Plan your visit <ArrowRight size={14} />
            </button>
            <a href="#rates" className="nb-btn" style={{ background: 'transparent', borderColor: '#fff', color: '#fff' }}>
              View resort rates <ArrowDown size={14} />
            </a>
          </div>
        </div>

        {/* ── Minimal Neo-Brutalist Booking Bar ────────────────── */}
        <div className="hero-booking-bar">
          <div className="hb-field">
            <span>EXPERIENCE TYPE</span>
            <select value={bookingCategory} onChange={(e) => setBookingCategory(e.target.value as any)}>
              <option value="ROOMS">12-hr Room Stay (from ₱2,000)</option>
              <option value="SWIMMING">Day / Night Swimming (from ₱150)</option>
              <option value="EVENTS">Event Hall / Pavilion (from ₱12,500)</option>
            </select>
          </div>
          <div className="hb-field">
            <span>TARGET DATE</span>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
            />
          </div>
          <div className="hb-field">
            <span>PARTY SIZE</span>
            <select value={guests} onChange={(e) => setGuests(e.target.value)}>
              <option>2 guests</option>
              <option>3–5 guests</option>
              <option>6–10 guests</option>
              <option>11–15 guests</option>
              <option>16–20 guests</option>
              <option>20+ guests</option>
            </select>
          </div>
          <button className="nb-btn" onClick={() => openBookingWith(bookingCategory)}>
            Check In With Us <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ── Intro Section ─────────────────────────────────────── */}
      <section className="section-pad" id="story" style={{ background: '#f7f6ef' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">A PLACE TO UNWIND</span>
            <h2 className="section-title">
              Some days are best spent<br /><em>a little closer to nature.</em>
            </h2>
            <p style={{ fontSize: '13px', lineHeight: 1.85, color: '#556459', margin: '14px 0 20px' }}>
              At Queen Aurora&apos;s, the day moves at a gentler pace. Swim under an open sky, find a shady spot in the garden, and make a little more room for the moments that matter.
            </p>
            <a href="#rates" className="nb-btn nb-btn-light nb-btn-sm">
              A look at rates &amp; info <ArrowRight size={12} />
            </a>
          </div>
          <div style={{ border: '2px solid #111', boxShadow: '4px 4px 0px #111', background: '#fff', padding: '10px' }}>
            <img
              src={photos[1].src}
              alt="Garden Pool"
              style={{ width: '100%', height: '300px', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px 2px', fontSize: '10px', fontWeight: 700, color: '#263e32' }}>
              <span>THE GARDEN POOL · A SUNNY AFTERNOON</span>
              <span>CABUYAO, LAGUNA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVAMPED RATES & INFORMATION (Compact & Organized) ── */}
      <section className="section-pad" id="rates" style={{ background: '#fbfaf4', borderTop: '2px solid #111', borderBottom: '2px solid #111' }}>
        <div className="rates-container">
          <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="eyebrow">OFFICIAL TARIFF &amp; GUIDELINES</span>
              <h2 className="section-title" style={{ margin: '4px 0 8px' }}>
                Rates &amp;<br /><em>information.</em>
              </h2>
              <p style={{ fontSize: '12px', color: '#687367', margin: '0', maxWidth: '440px', lineHeight: 1.6 }}>
                Official rates for swimming, 12-hour room accommodations, gazebos, and event venues. Select a category below:
              </p>
            </div>

            <Link href="/book" className="nb-btn" style={{ padding: '10px 18px', textDecoration: 'none' }}>
              Launch Full Booking Engine →
            </Link>
          </div>

          {/* Minimal Neo-Brutalist Category Switcher (No Long Scrolling) */}
          <div className="rates-tab-bar">
            <button
              type="button"
              className={`rates-tab-btn ${ratesTab === 'ROOMS' ? 'active' : ''}`}
              onClick={() => setRatesTab('ROOMS')}
            >
              🛏️ Rooms &amp; Suites (12-Hr)
            </button>
            <button
              type="button"
              className={`rates-tab-btn ${ratesTab === 'SWIMMING' ? 'active' : ''}`}
              onClick={() => setRatesTab('SWIMMING')}
            >
              🏊 Swimming &amp; Cottages
            </button>
            <button
              type="button"
              className={`rates-tab-btn ${ratesTab === 'EVENTS' ? 'active' : ''}`}
              onClick={() => setRatesTab('EVENTS')}
            >
              🎉 Events &amp; Rentals
            </button>
            <button
              type="button"
              className={`rates-tab-btn ${ratesTab === 'POLICIES' ? 'active' : ''}`}
              onClick={() => setRatesTab('POLICIES')}
            >
              📋 Policies &amp; Contact
            </button>
            <button
              type="button"
              className={`rates-tab-btn ${ratesTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setRatesTab('ALL')}
            >
              👁️ View All Rates
            </button>
          </div>

          {/* TAB 1: ROOMS & ACCOMMODATIONS (Compact 2-Column Grid) */}
          {(ratesTab === 'ROOMS' || ratesTab === 'ALL') && (
            <div className="rates-block" style={{ marginBottom: ratesTab === 'ALL' ? '40px' : '0' }}>
              <div className="rates-header-row">
                <h3 className="rates-block-title">
                  2. Rooms and Accommodations <span className="rates-block-sub">· Rates are for 12 hours</span>
                </h3>
                <Link href="/book" style={{ fontSize: '11px', fontWeight: 700, color: '#1f382b', textDecoration: 'underline' }}>
                  Reserve 12-Hour Room Online →
                </Link>
              </div>

              {/* 2-Column Compact Table Grid */}
              <div className="rates-grid-2col">
                {/* Left Column: Deluxe & Executive Rooms (2–6 pax) */}
                <div className="rates-card-box">
                  <div className="rates-card-box-header">
                    <h4 className="rates-card-box-title">Deluxe &amp; Executive Rooms</h4>
                    <span className="rates-card-box-sub">2 to 6 Pax</span>
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>ROOM</th>
                        <th>PAX</th>
                        <th style={{ textAlign: 'right' }}>12-HR RATE</th>
                        <th style={{ textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DELUXE_ROOMS.map((r) => (
                        <tr key={r.name}>
                          <td><strong>{r.name}</strong></td>
                          <td>{r.pax}</td>
                          <td className="rate-cell">{r.rate}</td>
                          <td className="action-cell">
                            <button
                              className="nb-btn nb-btn-light nb-btn-sm"
                              onClick={() => openBookingWith('ROOMS', r.name)}
                            >
                              Book
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right Column: Family Suites & Dormitories (10–30 pax) */}
                <div className="rates-card-box">
                  <div className="rates-card-box-header">
                    <h4 className="rates-card-box-title">Family Suites &amp; Dorms</h4>
                    <span className="rates-card-box-sub">10 to 30 Pax</span>
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>ROOM / PACKAGE</th>
                        <th>PAX</th>
                        <th style={{ textAlign: 'right' }}>12-HR RATE</th>
                        <th style={{ textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FAMILY_ROOMS.map((r) => (
                        <tr key={r.name} className={r.highlight ? 'highlight' : ''}>
                          <td><strong>{r.name}</strong></td>
                          <td>{r.pax}</td>
                          <td className="rate-cell">{r.rate}</td>
                          <td className="action-cell">
                            <button
                              className={`nb-btn nb-btn-sm ${r.highlight ? '' : 'nb-btn-light'}`}
                              onClick={() => openBookingWith('ROOMS', r.name)}
                            >
                              Book
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SWIMMING & COTTAGES (Compact 2-Column Grid) */}
          {(ratesTab === 'SWIMMING' || ratesTab === 'ALL') && (
            <div className="rates-block" style={{ marginBottom: ratesTab === 'ALL' ? '40px' : '0' }}>
              <div className="rates-grid-2col">
                {/* Left Card: 1. Entrance Fees */}
                <div className="rates-card-box">
                  <div className="rates-card-box-header">
                    <h4 className="rates-card-box-title">1. Entrance Fees</h4>
                    <span className="rates-card-box-sub">Swimming Schedules</span>
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>SCHEDULE</th>
                        <th>HOURS</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                        <th style={{ textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Day Swimming</strong></td>
                        <td style={{ color: '#556459', fontSize: '11px' }}>7 AM – 5 PM</td>
                        <td className="rate-cell">₱150 / head</td>
                        <td className="action-cell">
                          <button className="nb-btn nb-btn-sm" onClick={() => openBookingWith('SWIMMING')}>
                            Book
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Night Swimming</strong></td>
                        <td style={{ color: '#556459', fontSize: '11px' }}>7 PM – 5 AM</td>
                        <td className="rate-cell">₱200 / head</td>
                        <td className="action-cell">
                          <button className="nb-btn nb-btn-sm" onClick={() => openBookingWith('SWIMMING')}>
                            Book
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ marginTop: '16px', padding: '10px 12px', background: '#f7f6ef', border: '1px solid #111', fontSize: '11px', color: '#1f382b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💡</span>
                    <span>All day and night swimming guests are required to have a reserved cottage or gazebo.</span>
                  </div>
                </div>

                {/* Right Card: Gazebo / Cottage */}
                <div className="rates-card-box">
                  <div className="rates-card-box-header">
                    <h4 className="rates-card-box-title">Gazebo / Cottage</h4>
                    <span className="nb-pill" style={{ fontSize: '8px', padding: '2px 6px' }}>NO COTTAGE, NO ENTRY</span>
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>CAPACITY</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                        <th style={{ textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COTTAGE_ROWS.map((c) => (
                        <tr key={c.cap}>
                          <td><strong>{c.cap}</strong></td>
                          <td className="rate-cell">{c.rate}</td>
                          <td className="action-cell">
                            <button className="nb-btn nb-btn-light nb-btn-sm" onClick={() => openBookingWith('SWIMMING')}>
                              Reserve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '16px', padding: '10px 12px', background: '#fff', border: '1px dashed #111', fontSize: '11px', color: '#556459' }}>
                    🌿 Shaded native kiosks located directly beside our sparkling garden pools.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EVENTS & RENTALS (Compact 2-Column Grid) */}
          {(ratesTab === 'EVENTS' || ratesTab === 'ALL') && (
            <div className="rates-block" style={{ marginBottom: ratesTab === 'ALL' ? '40px' : '0' }}>
              <div className="rates-grid-2col">
                {/* Left Card: 3. Events Places & Rentals */}
                <div className="rates-card-box">
                  <div className="rates-card-box-header">
                    <h4 className="rates-card-box-title">3. Events Places &amp; Venues</h4>
                    <span className="rates-card-box-sub">Weddings &amp; Galas</span>
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>VENUE</th>
                        <th>CAPACITY</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                        <th style={{ textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EVENT_ROWS.map((e) => (
                        <tr key={e.name} className={e.highlight ? 'highlight' : ''}>
                          <td><strong>{e.name}</strong></td>
                          <td>{e.cap}</td>
                          <td className="rate-cell">{e.rate}</td>
                          <td className="action-cell">
                            <button
                              className={`nb-btn nb-btn-sm ${e.highlight ? '' : 'nb-btn-light'}`}
                              onClick={() => openBookingWith('EVENTS', e.name)}
                            >
                              Inquire
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right Card: 4. Other Rentals */}
                <div className="rates-card-box">
                  <div className="rates-card-box-header">
                    <h4 className="rates-card-box-title">4. Other Rentals</h4>
                    <span className="rates-card-box-sub">For Events Only</span>
                  </div>
                  <table className="min-table">
                    <thead>
                      <tr>
                        <th>ITEM</th>
                        <th style={{ textAlign: 'right' }}>RENTAL RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RENTALS.map((r) => (
                        <tr key={r.item}>
                          <td><strong>{r.item}</strong></td>
                          <td className="rate-cell">{r.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '16px', padding: '10px 12px', background: '#f7f6ef', border: '1px solid #111', fontSize: '11px', color: '#1f382b' }}>
                    ✨ Sound system setup and catering staging available upon venue inquiry.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: POLICIES & CONTACT (Exact User Screenshot Style + Contact Information) */}
          {(ratesTab === 'POLICIES' || ratesTab === 'ALL') && (
            <div className="rates-block" style={{ marginBottom: '0' }}>
              <div className="rates-grid-2col">
                {/* 5 & 6. Policies (Minimal Neo-Brutalist Box matching user screenshot) */}
                <div className="min-policy-box" style={{ marginTop: 0 }}>
                  <h3 className="min-policy-title">5 &amp; 6. Resort Policies &amp; Payment Terms</h3>
                  <ul className="min-policy-list">
                    <li>
                      <span>🚫</span>
                      <div>
                        <strong>STRICTLY NO PETS ALLOWED</strong> — Pets of any size are strictly prohibited anywhere on resort premises.
                      </div>
                    </li>
                    <li>
                      <span>🏡</span>
                      <div>
                        <strong>NO COTTAGE, NO ENTRY</strong> — All swimming guests are required to have a reserved cottage or gazebo.
                      </div>
                    </li>
                    <li>
                      <span>💳</span>
                      <div>
                        <strong>PAYMENT IS NON-REFUNDABLE &amp; NON-TRANSFERABLE</strong> — Once booked, payments cannot be refunded.
                      </div>
                    </li>
                    <li>
                      <span>🔒</span>
                      <div>
                        <strong>NO DOWN PAYMENT, NO RESERVATIONS</strong> — Confirmation requires settled deposit with resort staff.
                      </div>
                    </li>
                  </ul>
                </div>

                {/* 7. Contact Information Card */}
                <div className="rates-card-box" style={{ boxShadow: '5px 5px 0px #000' }}>
                  <div className="rates-card-box-header">
                    <h4 className="rates-card-box-title">7. Contact Information</h4>
                    <span className="rates-card-box-sub">Queen Aurora&apos;s Garden Resort</span>
                  </div>
                  <table className="min-table">
                    <tbody>
                      <tr>
                        <td style={{ width: '100px', color: '#778174', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Address</td>
                        <td><strong>Purok 3, Barangay Marinig, Cabuyao City, Laguna</strong></td>
                      </tr>
                      <tr>
                        <td style={{ color: '#778174', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Telephone</td>
                        <td><strong style={{ fontFamily: 'monospace', fontSize: '14px' }}>+63 947 805-3279</strong></td>
                      </tr>
                      <tr>
                        <td style={{ color: '#778174', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Facebook</td>
                        <td><strong>Queen Aurora&apos;s Garden Resort</strong></td>
                      </tr>
                      <tr>
                        <td style={{ color: '#778174', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Email</td>
                        <td><strong style={{ fontFamily: 'monospace' }}>qagresort@gmail.com</strong></td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ marginTop: '18px', display: 'flex', gap: '8px' }}>
                    <a
                      href="tel:+639478053279"
                      className="nb-btn nb-btn-sm"
                      style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                    >
                      Call Front Desk
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nb-btn nb-btn-light nb-btn-sm"
                      style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                    >
                      Facebook Page
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Facilities ────────────────────────────────────────── */}
      <section className="section-pad" id="facilities" style={{ background: '#f7f6ef' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <span className="eyebrow">SPACE TO MAKE YOUR OWN</span>
          <h2 className="section-title">A day that feels<br /><em>like yours.</em></h2>
          <div style={{ borderTop: '1.5px solid #111', marginTop: '24px' }}>
            {facilities.map((facility) => (
              <div
                key={facility.number}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1.2fr 1.2fr 30px',
                  alignItems: 'center',
                  padding: '18px 0',
                  borderBottom: '1px solid #dcdfd2',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '11px', color: '#778174', fontWeight: 700 }}>{facility.number}</span>
                <strong style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1f382b' }}>{facility.name}</strong>
                <p style={{ margin: 0, fontSize: '12px', color: '#556459' }}>{facility.note}</p>
                <span style={{ textAlign: 'right', color: '#889083' }}>{facility.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ───────────────────────────────────────────── */}
      <section className="section-pad" id="gallery" style={{ background: '#fbfaf4', borderTop: '2px solid #111', borderBottom: '2px solid #111' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <span className="eyebrow">AROUND THE GARDEN</span>
          <h2 className="section-title">Little moments,<br /><em>in the open air.</em></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginTop: '24px' }}>
            {photos.map((photo, index) => (
              <div
                key={photo.src}
                style={{ border: '2px solid #111', boxShadow: '3px 3px 0px #111', background: '#fff', padding: '6px', cursor: 'zoom-in' }}
                onClick={() => setActivePhoto(index)}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                <div style={{ padding: '6px 2px 2px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                  <span>{photo.label}</span>
                  <span>↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact & Location ─────────────────────────────────── */}
      <section className="section-pad" id="visit" style={{ background: '#1f382b', color: '#f7f6ef' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '36px' }}>
          <div>
            <span className="eyebrow" style={{ color: '#c5a867' }}>7. CONTACT INFORMATION</span>
            <h2 className="section-title" style={{ color: '#fff' }}>Find your way<br /><em style={{ color: '#d9e2d3' }}>to the garden.</em></h2>
            <p style={{ fontSize: '13px', lineHeight: 1.8, color: '#d5ded1', margin: '14px 0 24px' }}>
              We are located in Purok 3, Barangay Marinig, Cabuyao City, Laguna. Reach out to schedule private bookings, pool tours, or event venue viewings.
            </p>
            <div style={{ display: 'grid', gap: '14px', marginBottom: '24px', fontSize: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={16} color="#c5a867" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Purok 3, Barangay Marinig, Cabuyao City, Laguna, Philippines</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={16} color="#c5a867" style={{ flexShrink: 0 }} />
                <a href="tel:+639478053279" style={{ color: '#fff', textDecoration: 'underline' }}>+63 947 805-3279</a>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Clock3 size={16} color="#c5a867" style={{ flexShrink: 0 }} />
                <span>Day Swimming: 7 AM – 5 PM · Night: 7 PM – 5 AM · 12-hr Room Stays</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="nb-btn nb-btn-light" onClick={() => openBookingWith('ROOMS')}>
                Book a Visit <ArrowRight size={13} />
              </button>
              <a
                href="https://maps.google.com/?q=Queen+Aurora%27s+Garden+Resort+Marinig+Cabuyao+Laguna"
                target="_blank"
                rel="noreferrer"
                className="nb-btn"
                style={{ background: 'transparent', borderColor: '#fff', color: '#fff' }}
              >
                Google Maps <ArrowRight size={13} />
              </a>
            </div>
          </div>
          <div style={{ border: '2px solid #fff', boxShadow: '4px 4px 0px #000', padding: '8px', background: '#fff' }}>
            <img
              src={photos[3].src}
              alt="Resort Entrance"
              style={{ width: '100%', height: '340px', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ padding: '32px 5%', background: '#ffffff', borderTop: '2px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '11px' }}>
        <div>
          <strong style={{ textTransform: 'uppercase', color: '#1f382b' }}>QUEEN AURORA&apos;S GARDEN RESORT</strong>
          <span style={{ display: 'block', color: '#778174' }}>Purok 3, Barangay Marinig, Cabuyao City, Laguna</span>
        </div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Link href="/book" style={{ fontWeight: 700, color: '#1f382b', textDecoration: 'underline' }}>
            Online Booking Engine
          </Link>
          <a href="tel:+639478053279">+63 947 805-3279</a>
          <Link href="/login" style={{ color: '#666' }}>
            Staff Portal
          </Link>
        </div>
      </footer>

      {/* ── Minimal Neo-Brutalist Booking Modal ────────────────── */}
      {bookingOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setBookingOpen(false)}
        >
          <div className="min-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setBookingOpen(false)}>
              <X size={16} />
            </button>

            {submitted ? (
              <div>
                <span className="nb-pill" style={{ background: '#d9e2d3', marginBottom: '10px' }}>
                  ✓ ENQUIRY LOGGED
                </span>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', margin: '6px 0 10px', color: '#1f382b' }}>
                  We&apos;ll be in touch!
                </h2>
                <p style={{ fontSize: '12px', lineHeight: 1.7, color: '#556459', marginBottom: '16px' }}>
                  Thank you, <strong>{guestName || 'Valued Guest'}</strong>! We received your reservation inquiry for{' '}
                  <strong>{selectedRoomName}</strong> on <strong>{checkin || 'your preferred date'}</strong>.
                </p>
                <div style={{ border: '1.5px solid #111', padding: '14px', background: '#fff', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 700, color: '#1f382b' }}>Next Step:</div>
                  <div style={{ color: '#556459', marginTop: '2px' }}>
                    Resort staff will contact {guestPhone} to confirm availability and coordinate deposit arrangements.
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <Link href={`/book?checkIn=${encodeURIComponent(checkin)}`} className="nb-btn" style={{ width: '100%' }}>
                    Open Live Booking Engine <ArrowRight size={13} />
                  </Link>
                  <button className="nb-btn nb-btn-light" onClick={() => setBookingOpen(false)} style={{ width: '100%' }}>
                    Return to Resort
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="eyebrow">MAKE IT A DAY</span>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', margin: '4px 0 8px', color: '#1f382b' }}>
                  Plan your visit.
                </h2>
                <p style={{ fontSize: '11px', color: '#687367', margin: '0 0 16px' }}>
                  Submit an inquiry with the resort team or proceed directly to online room selection.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSubmitted(true)
                  }}
                  style={{ display: 'grid', gap: '12px' }}
                >
                  <div className="hb-field">
                    <span>SELECT ACCOMMODATION / SERVICE</span>
                    <select value={selectedRoomName} onChange={(e) => setSelectedRoomName(e.target.value)}>
                      {ROOM_ROWS.map((r) => (
                        <option key={r.name} value={r.name}>
                          {r.name} ({r.pax} pax) — {r.rate}
                        </option>
                      ))}
                      <option value="Day Swimming">Day Swimming (7 AM – 5 PM · ₱150/head)</option>
                      <option value="Night Swimming">Night Swimming (7 PM – 5 AM · ₱200/head)</option>
                      <option value="Cottage (1-10 pax)">Cottage (1–10 pax · ₱1,500)</option>
                      <option value="Cottage (11-15 pax)">Cottage (11–15 pax · ₱2,000)</option>
                      <option value="Cottage (20 pax)">Cottage (20 pax · ₱3,000)</option>
                      <option value="Function Hall">Function Hall (₱20,000)</option>
                      <option value="Big Pavilion">Big Pavilion (₱80,000)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="hb-field">
                      <span>TARGET DATE</span>
                      <input
                        required
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={checkin}
                        onChange={(e) => setCheckin(e.target.value)}
                      />
                    </div>
                    <div className="hb-field">
                      <span>PARTY SIZE</span>
                      <select value={guests} onChange={(e) => setGuests(e.target.value)}>
                        <option>2 guests</option>
                        <option>3–5 guests</option>
                        <option>6–10 guests</option>
                        <option>11–15 guests</option>
                        <option>16–20 guests</option>
                        <option>20+ guests</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="hb-field">
                      <span>FULL NAME</span>
                      <input
                        required
                        type="text"
                        placeholder="Your full name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </div>
                    <div className="hb-field">
                      <span>MOBILE NUMBER</span>
                      <input
                        required
                        type="tel"
                        placeholder="+63 9XX XXX XXXX"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #dcdfd2', padding: '10px', fontSize: '10px', color: '#556459', lineHeight: 1.5 }}>
                    <strong>Policies Reminder:</strong> Strictly No Pets Allowed · Mandatory Cottage (&ldquo;No Cottage, No Entry&rdquo;) · Non-refundable payments.
                  </div>

                  <button className="nb-btn" type="submit" style={{ width: '100%', marginTop: '4px' }}>
                    Send Reservation Inquiry <ArrowRight size={13} />
                  </button>
                </form>

                <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #dcdfd2', textAlign: 'center', fontSize: '11px' }}>
                  <span>Want live calendar availability? </span>
                  <Link href={`/book?checkIn=${encodeURIComponent(checkin)}`} style={{ fontWeight: 700, color: '#1f382b', textDecoration: 'underline' }}>
                    Open Live Engine →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────────── */}
      {activePhoto !== null && (
        <div className="modal-backdrop" onClick={() => setActivePhoto(null)}>
          <div style={{ maxWidth: '840px', width: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActivePhoto(null)}>
              <X size={16} />
            </button>
            <img
              src={photos[activePhoto].src}
              alt={photos[activePhoto].alt}
              style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', border: '2px solid #000', boxShadow: '4px 4px 0px #000', background: '#fff' }}
            />
          </div>
        </div>
      )}
    </main>
  )
}
