'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  UserCheck,
  CalendarDays,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Sparkles,
  ScanLine,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Home,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardMetrics, Reservation, GuestAccessLog } from '@/lib/types'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [recentLogs, setRecentLogs] = useState<GuestAccessLog[]>([])
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchDashboardData()
    // Periodic refresh for realtime dashboard metrics
    const interval = setInterval(fetchDashboardData, 8000)
    return () => clearInterval(interval)
  }, [dateFilter])

  async function fetchDashboardData() {
    try {
      const [mRes, rRes, lRes] = await Promise.all([
        fetch('/api/dashboard/metrics').then((r) => r.json()),
        fetch(`/api/reservations?date=${dateFilter}`).then((r) => r.json()),
        fetch('/api/activity-logs').then((r) => r.json()),
      ])

      if (mRes.metrics) setMetrics(mRes.metrics)
      if (rRes.reservations) setReservations(rRes.reservations)
      if (lRes.logs) setRecentLogs(lRes.logs.slice(0, 7))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const arrivalsForDate = reservations.filter((r) => r.check_in_date === dateFilter)
  const departuresForDate = reservations.filter((r) => r.check_out_date === dateFilter)

  return (
    <AppShell title="Operations Dashboard" subtitle="Live guest occupancy, arrival/departure schedules, and NFC access telemetry">
      <div className="space-y-6 select-none">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
            Resort Operations Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Live guest occupancy, arrival/departure schedules, and NFC access telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-700 shadow-xs">
            <Filter size={14} className="text-stone-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border-0 bg-transparent text-xs text-stone-800 focus:outline-none"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboardData}
            className="border-stone-200 text-stone-700 text-xs gap-1.5"
            title="Refresh Realtime Stats"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Link href="/reception/scan">
            <Button
              size="sm"
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs gap-1.5 font-bold shadow-xs"
            >
              <ScanLine size={14} />
              <span>NFC Scan</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* METRICS CARDS GRID (Requirement 4.A) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
        {/* Total Guests Currently Inside */}
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Guests Inside
            </span>
            <div className="size-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-teal-900 block">
              {metrics?.totalGuestsInside ?? 0}
            </span>
            <span className="text-[11px] text-teal-700 font-medium">Currently on resort grounds</span>
          </div>
        </div>

        {/* Expected Arrivals Today */}
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Arrivals Today
            </span>
            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-stone-900 block">
              {metrics?.expectedArrivalsToday ?? 0}
            </span>
            <span className="text-[11px] text-stone-500">Scheduled for check-in</span>
          </div>
        </div>

        {/* Expected Departures Today */}
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Departures Today
            </span>
            <div className="size-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-stone-900 block">
              {metrics?.expectedDeparturesToday ?? 0}
            </span>
            <span className="text-[11px] text-stone-500">Scheduled for checkout</span>
          </div>
        </div>

        {/* Active Reservations */}
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Active Bookings
            </span>
            <div className="size-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CalendarDays size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-stone-900 block">
              {metrics?.activeReservations ?? 0}
            </span>
            <span className="text-[11px] text-stone-500">Confirmed & checked-in</span>
          </div>
        </div>

        {/* Checked-In Guests */}
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Checked In
            </span>
            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-emerald-800 block">
              {metrics?.checkedInGuests ?? 0}
            </span>
            <span className="text-[11px] text-stone-500">Active checked-in stays</span>
          </div>
        </div>

        {/* Checked-Out Guests */}
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Checked Out
            </span>
            <div className="size-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-stone-900 block">
              {metrics?.checkedOutGuests ?? 0}
            </span>
            <span className="text-[11px] text-stone-500">Completed stays</span>
          </div>
        </div>

        {/* Available Wristbands */}
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Available Bands
            </span>
            <div className="size-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Radio size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-teal-800 block">
              {metrics?.availableWristbands ?? 0}
            </span>
            <span className="text-[11px] text-stone-500">Ready for assignment</span>
          </div>
        </div>

        {/* Lost or Disabled Wristbands */}
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Lost / Disabled
            </span>
            <div className="size-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-rose-700 block">
              {metrics?.lostOrDisabledWristbands ?? 0}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">Deactivated for security</span>
          </div>
        </div>
      </div>

      {/* Main Operational Tables: Arrivals & Departures for selected date */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 px-5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-stone-900">Arrivals for {dateFilter}</h2>
              <p className="text-[11px] text-stone-500">Scheduled guest check-ins</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-mono">
              {arrivalsForDate.length}
            </Badge>
          </div>

          <div className="divide-y divide-stone-100">
            {arrivalsForDate.length === 0 ? (
              <p className="p-6 text-xs text-stone-400 text-center">No arrivals scheduled for {dateFilter}</p>
            ) : (
              arrivalsForDate.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-stone-50/60 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-teal-800">{r.reference_number}</span>
                      <strong className="text-sm text-stone-900">{r.guest?.full_name}</strong>
                      <Badge className="text-[10px] py-0 px-1.5">{r.status}</Badge>
                    </div>
                    <p className="text-xs text-stone-500">
                      {r.room_or_accommodation} • Wristband: <span className="font-mono">{r.wristband?.wristband_code || 'None'}</span>
                    </p>
                  </div>

                  <Link href={`/reservations/${r.id}`}>
                    <Button size="sm" variant="outline" className="text-xs border-stone-200">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Departures Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 px-5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-stone-900">Departures for {dateFilter}</h2>
              <p className="text-[11px] text-stone-500">Scheduled guest checkouts</p>
            </div>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-mono">
              {departuresForDate.length}
            </Badge>
          </div>

          <div className="divide-y divide-stone-100">
            {departuresForDate.length === 0 ? (
              <p className="p-6 text-xs text-stone-400 text-center">No departures scheduled for {dateFilter}</p>
            ) : (
              departuresForDate.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-stone-50/60 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-amber-800">{r.reference_number}</span>
                      <strong className="text-sm text-stone-900">{r.guest?.full_name}</strong>
                      <Badge className="text-[10px] py-0 px-1.5">{r.status}</Badge>
                    </div>
                    <p className="text-xs text-stone-500">
                      {r.room_or_accommodation} • Wristband: <span className="font-mono">{r.wristband?.wristband_code || 'Active'}</span>
                    </p>
                  </div>

                  <Link href={`/reservations/${r.id}`}>
                    <Button size="sm" variant="outline" className="text-xs border-stone-200">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Guest Access Activity Feed (Section 4.H) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 px-5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-teal-700" />
            <h2 className="font-bold text-sm text-stone-900">Live Access & Scan Activity</h2>
          </div>
          <Link href="/activity-logs" className="text-xs text-teal-700 font-semibold hover:underline">
            View All Logs →
          </Link>
        </div>

        <div className="divide-y divide-stone-100">
          {recentLogs.length === 0 ? (
            <p className="p-6 text-xs text-stone-400 text-center">No recent access events recorded.</p>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span
                    className={`size-2.5 rounded-full shrink-0 ${
                      log.action_type === 'Check In'
                        ? 'bg-emerald-500'
                        : log.action_type === 'Check Out'
                        ? 'bg-amber-500'
                        : log.action_type === 'Wristband Disabled'
                        ? 'bg-rose-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs text-stone-900">{log.action_type}</strong>
                      <span className="text-xs text-stone-600 font-medium">{log.guest_name}</span>
                      <Badge className="text-[9px] py-0 px-1 font-mono">{log.verification_method}</Badge>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      {log.notes || 'Transaction verified'} • Staff: {log.receptionist_name}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:shrink-0">
                  <span className="text-[11px] font-mono text-stone-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </AppShell>
  )
}
