'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Radio,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { GuestAccessLog } from '@/lib/types'

export default function WristbandHistoryPage() {
  const [logs, setLogs] = useState<GuestAccessLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [actionFilter])

  async function loadLogs() {
    setLoading(true)
    try {
      const actParam = actionFilter !== 'ALL' ? `?action=${actionFilter}` : ''
      const res = await fetch(`/api/activity-logs${actParam}`)
      const data = await res.json()
      if (data.logs) {
        // Filter specifically for wristband related actions
        setLogs(data.logs)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const q = encodeURIComponent(searchQuery.trim())
      const res = await fetch(`/api/activity-logs?q=${q}`)
      const data = await res.json()
      if (data.logs) setLogs(data.logs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Wristband History" subtitle="Immutable log of wristband assignments, replacements, deactivations, and taps">
      <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/wristbands"
            className="size-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Clock size={22} className="text-teal-700" />
              Wristband Activity & Audit History
            </h1>
            <p className="text-xs text-stone-500">
              Immutable log of wristband assignments, replacements, deactivations, and taps
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by wristband code, guest name, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-teal-600"
            />
          </div>
          <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs px-4">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-stone-500 font-medium">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-2.5 py-1.5 bg-stone-50 text-stone-700 focus:outline-teal-600"
          >
            <option value="ALL">All Actions</option>
            <option value="Wristband Assigned">Wristband Assigned</option>
            <option value="Wristband Replaced">Wristband Replaced</option>
            <option value="Wristband Disabled">Wristband Disabled</option>
            <option value="Check In">Check In</option>
            <option value="Check Out">Check Out</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Timestamp (Local)</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Wristband</th>
                <th className="py-3.5 px-4">Guest & Booking</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Notes / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-stone-400">
                    No history records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        className={
                          log.action_type === 'Check In'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action_type === 'Check Out'
                            ? 'bg-amber-100 text-amber-800'
                            : log.action_type === 'Wristband Disabled'
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : log.action_type === 'Wristband Replaced'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-teal-100 text-teal-800'
                        }
                      >
                        {log.action_type}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-900">
                      {log.wristband_code || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-800">{log.guest_name}</div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {log.reservation_ref}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200">
                        {log.verification_method}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-700">
                      {log.receptionist_name}
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </AppShell>
  )
}
