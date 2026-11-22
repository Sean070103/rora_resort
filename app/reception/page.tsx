'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Radio,
  ScanLine,
  UserCheck,
  Key,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { Reservation, DashboardMetrics } from '@/lib/types'

export default function ReceptionHubPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [todayArrivals, setTodayArrivals] = useState<Reservation[]>([])
  const [todayDepartures, setTodayDepartures] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const [mRes, rRes] = await Promise.all([
        fetch('/api/dashboard/metrics').then((r) => r.json()),
        fetch('/api/reservations').then((r) => r.json()),
      ])

      if (mRes.metrics) setMetrics(mRes.metrics)
      if (rRes.reservations) {
        const arr = rRes.reservations.filter((r: Reservation) => r.check_in_date === today)
        const dep = rRes.reservations.filter((r: Reservation) => r.check_out_date === today)
        setTodayArrivals(arr)
        setTodayDepartures(dep)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Reception Front Desk Hub" subtitle="High-speed check-in, arrivals roster, and NFC scanner launcher">
      <div className="space-y-6 select-none">
      {/* Front Desk Hero Banner */}
      <div className="bg-gradient-to-r from-[#0d1b2a] via-[#14213d] to-[#0f4c5c] rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-mono font-medium mb-3 border border-teal-400/30">
            <span className="size-2 rounded-full bg-teal-400 animate-pulse" />
            FRONT DESK SPEED TERMINAL
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
            Reception & NFC Access Command
          </h1>
          <p className="text-stone-300 text-xs md:text-sm mt-1.5 leading-relaxed">
            Scan wristbands with Android Web NFC, verify guest reservations, execute atomic check-in/out, and assign tokens instantly.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/reception/scan">
              <Button className="bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs gap-2 px-5 py-2.5 rounded-xl shadow-md">
                <ScanLine size={16} /> Launch NFC Scanner
              </Button>
            </Link>

            <Link href="/reception/manual-verification">
              <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs gap-2 rounded-xl">
                <Search size={15} /> QR Code & Manual Search
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/reception/scan"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="size-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Radio size={22} className="animate-pulse" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Android NFC Scan</h3>
          <p className="text-xs text-stone-500 mt-1">Tap wristband on phone to identify guest & confirm</p>
        </Link>

        <Link
          href="/reception/manual-verification"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="size-11 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Search size={22} />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Manual & QR Lookup</h3>
          <p className="text-xs text-stone-500 mt-1">Camera QR scan or search by booking reference</p>
        </Link>

        <Link
          href="/wristbands/assign"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="size-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Plus size={22} />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Assign Wristband</h3>
          <p className="text-xs text-stone-500 mt-1">Pair available NFC wristband with a confirmed reservation</p>
        </Link>

        <Link
          href="/wristbands"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="size-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Key size={22} />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Wristband Inventory</h3>
          <p className="text-xs text-stone-500 mt-1">View available, lost, and disabled wristbands</p>
        </Link>
      </div>

      {/* Today's Operational Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals Today */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 px-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck size={18} className="text-teal-700" />
              <h2 className="font-bold text-sm text-stone-900">Today&apos;s Expected Arrivals</h2>
            </div>
            <Badge className="bg-teal-100 text-teal-800 border-teal-200">
              {todayArrivals.length} Arrivals
            </Badge>
          </div>

          <div className="divide-y divide-stone-100">
            {todayArrivals.length === 0 ? (
              <p className="p-6 text-xs text-stone-400 text-center">No arrivals scheduled for today.</p>
            ) : (
              todayArrivals.map((res) => (
                <div key={res.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800">{res.reference_number}</span>
                      <strong className="text-sm text-stone-900">{res.guest?.full_name}</strong>
                      <Badge className="text-[10px] py-0 px-1.5">{res.status}</Badge>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {res.room_or_accommodation} • {res.adults_count} Adults • Wristband: {res.wristband?.wristband_code || 'Unassigned'}
                    </p>
                  </div>

                  <Link href={`/reception/scan`}>
                    <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs">
                      Check In
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Departures Today */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 px-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key size={18} className="text-amber-700" />
              <h2 className="font-bold text-sm text-stone-900">Today&apos;s Expected Departures</h2>
            </div>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              {todayDepartures.length} Departures
            </Badge>
          </div>

          <div className="divide-y divide-stone-100">
            {todayDepartures.length === 0 ? (
              <p className="p-6 text-xs text-stone-400 text-center">No departures scheduled for today.</p>
            ) : (
              todayDepartures.map((res) => (
                <div key={res.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-800">{res.reference_number}</span>
                      <strong className="text-sm text-stone-900">{res.guest?.full_name}</strong>
                      <Badge className="text-[10px] py-0 px-1.5">{res.status}</Badge>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {res.room_or_accommodation} • Wristband: {res.wristband?.wristband_code || 'Active'}
                    </p>
                  </div>

                  <Link href={`/reception/scan`}>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50 text-xs">
                      Check Out
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    </AppShell>
  )
}
