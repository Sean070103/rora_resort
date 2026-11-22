import React from 'react'
import Link from 'next/link'
import { db } from '@/lib/db/db'
import { DashboardHeader } from '@/components/dashboard/Header'
import {
  CalendarDays,
  DollarSign,
  Radio,
  ArrowUpRight,
  BedDouble,
  Sparkles,
} from 'lucide-react'

export const revalidate = 0

export default async function AdminOverviewPage() {
  const reservations = await db.getReservations()
  const rooms = await db.getRooms()
  const wristbands = await db.getWristbands()
  const payments = await db.getPayments()
  const wristbandLogs = await db.getWristbandLogs()

  // Compute key stats
  const totalReservations = reservations.length
  const todayStr = '2026-11-21'

  const todayCheckIns = reservations.filter(
    (r) => r.checkInDate === todayStr && (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN')
  )

  const todayCheckOuts = reservations.filter(
    (r) => r.checkOutDate === todayStr && (r.status === 'CHECKED_IN' || r.status === 'COMPLETED')
  )

  const totalRevenue = payments.reduce((acc, p) => acc + (p.status === 'COMPLETED' ? p.amount : 0), 0)
  const pendingBookings = reservations.filter((r) => r.status === 'PENDING').length
  const confirmedBookings = reservations.filter((r) => r.status === 'CONFIRMED').length
  const checkedInBookings = reservations.filter((r) => r.status === 'CHECKED_IN').length

  const occupiedRooms = reservations.filter((r) => r.status === 'CHECKED_IN').length
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0

  const activeWristbands = wristbands.filter((w) => w.status === 'ACTIVE').length
  const availableWristbands = wristbands.filter((w) => w.status === 'AVAILABLE').length

  return (
    <div className="flex-1 flex flex-col bg-[#f7f6ef]">
      <DashboardHeader
        title="Resort Operations & Analytics"
        subtitle="Live metrics for Queen Aurora's Garden Resort · Cabuyao, Laguna"
      />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-7">
        {/* KPI Cards Grid (Minimal Neo-Brutalist) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#000] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Total Collected Revenue
              </p>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                ₱{totalRevenue.toLocaleString()}
              </h3>
              <span className="text-[11px] text-emerald-800 flex items-center gap-1 mt-1 font-semibold">
                <ArrowUpRight size={13} /> {payments.length} verified payments
              </span>
            </div>
            <div className="size-11 bg-[#f7f6ef] border-2 border-black text-[#14261d] flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
              <DollarSign size={20} />
            </div>
          </div>

          {/* Today's Check-ins */}
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#000] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Today&apos;s Schedule
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-serif font-bold text-[#14261d]">
                  {todayCheckIns.length}
                </h3>
                <span className="text-xs text-stone-500 font-medium">arrivals</span>
                <span className="text-stone-300">/</span>
                <span className="text-lg font-serif font-bold text-stone-700">
                  {todayCheckOuts.length}
                </span>
                <span className="text-xs text-stone-500 font-medium">departures</span>
              </div>
              <span className="text-[11px] text-stone-500 block mt-1 font-medium">
                Live Front Desk Log
              </span>
            </div>
            <div className="size-11 bg-[#f7f6ef] border-2 border-black text-[#14261d] flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
              <CalendarDays size={20} />
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#000] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Resort Occupancy
              </p>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                {occupancyRate}%
              </h3>
              <div className="text-[11px] text-stone-500 mt-1 font-medium">
                {occupiedRooms} of {rooms.length} units occupied
              </div>
            </div>
            <div className="size-11 bg-[#f7f6ef] border-2 border-black text-[#14261d] flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
              <BedDouble size={20} />
            </div>
          </div>

          {/* NFC Wristbands in Service */}
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#000] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                NFC Wristbands Active
              </p>
              <h3 className="text-2xl font-serif font-bold text-[#14261d] mt-1">
                {activeWristbands}{' '}
                <span className="text-xs font-normal text-stone-500 font-sans">
                  / {availableWristbands} avail
                </span>
              </h3>
              <span className="text-[11px] text-emerald-800 font-semibold block mt-1">
                100% contactless fleet
              </span>
            </div>
            <div className="size-11 bg-[#f7f6ef] border-2 border-black text-[#14261d] flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
              <Radio size={20} className="animate-pulse" />
            </div>
          </div>
        </div>

        {/* Quick Action Banner */}
        <div className="bg-[#14261d] text-white border-2 border-black p-6 shadow-[5px_5px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-white/20 bg-white/10 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={13} /> Front Desk Ready
            </div>
            <h2 className="font-serif text-xl font-bold text-white">
              Launch Receptionist Terminal
            </h2>
            <p className="text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
              Fast guest search, physical NFC tap scanner verification, 1-click wristband assignments, and balance settlement.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/receptionist"
              className="px-4 py-2.5 bg-[#f7f6ef] hover:bg-white text-[#14261d] font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2 transition-transform active:translate-x-[1px] active:translate-y-[1px]"
            >
              Open Reception Desk <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/admin/reservations"
              className="px-4 py-2.5 bg-transparent hover:bg-white/10 text-white font-bold text-xs border-2 border-white/40 flex items-center gap-2 transition-colors"
            >
              Manage Reservations
            </Link>
          </div>
        </div>

        {/* ── 5 & 6. Resort Policies & Payment Terms Reference (Exact User Screenshot Style) ── */}
        <div className="min-policy-box">
          <h3 className="min-policy-title">
            5 &amp; 6. Resort Policies &amp; Payment Terms
          </h3>
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

        {/* Two-column layout: Active Reservations & NFC Wristband Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Recent Reservations Table (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Recent Guest Reservations
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {pendingBookings} pending · {confirmedBookings} confirmed · {checkedInBookings} checked in
                </p>
              </div>
              <Link
                href="/admin/reservations"
                className="text-xs text-[#14261d] font-bold hover:underline"
              >
                View all ({totalReservations}) →
              </Link>
            </div>

            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f7f6ef] text-stone-600 uppercase tracking-wider text-[10px] font-bold border-b-2 border-black">
                    <tr>
                      <th className="py-3 px-4">Ref Number</th>
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Accommodation</th>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Wristband</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-medium">
                    {reservations.slice(0, 6).map((res) => (
                      <tr key={res.id} className="hover:bg-[#fcfbf7] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">
                          {res.referenceNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{res.guestName}</div>
                          <div className="text-[10px] text-stone-500">{res.guestPhone}</div>
                        </td>
                        <td className="py-3 px-4 text-stone-800 font-semibold">{res.roomName}</td>
                        <td className="py-3 px-4 text-stone-600 whitespace-nowrap font-sans text-[11px]">
                          {res.checkInDate} → {res.checkOutDate}
                        </td>
                        <td className="py-3 px-4 font-bold font-serif text-stone-900">
                          ₱{res.totalAmount.toLocaleString()}
                          {res.discountAmount > 0 && (
                            <span className="block text-[9px] font-sans font-bold text-emerald-800">
                              Loyalty -₱{res.discountAmount.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {res.assignedWristbandUid ? (
                            <span className="inline-block px-1.5 py-0.5 border border-black bg-[#eaf0e6] font-mono text-[10px] font-bold">
                              {res.assignedWristbandUid.slice(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-stone-400 italic text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 border border-black text-[10px] font-bold uppercase ${
                              res.status === 'CHECKED_IN'
                                ? 'bg-[#14261d] text-white'
                                : res.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-900'
                                : res.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* NFC Activity Feed (1 col) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  NFC Activity Feed
                </h3>
                <p className="text-xs text-stone-500 font-medium">Hardware audit trail</p>
              </div>
              <Link
                href="/admin/wristbands"
                className="text-xs text-[#14261d] font-bold hover:underline"
              >
                Wristbands →
              </Link>
            </div>

            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] divide-y divide-stone-200">
              {wristbandLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-[#fcfbf7] transition-colors text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Radio size={12} className="text-emerald-700" />
                      {log.action}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600">
                    UID: <span className="font-mono font-bold text-stone-900">{log.wristbandUid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
