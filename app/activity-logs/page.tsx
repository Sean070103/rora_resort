'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ClipboardList,
  Search,
  Filter,
  Radio,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Calendar,
  Sparkles,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GuestAccessLog, ActionType, VerificationMethod } from '@/lib/types'

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<GuestAccessLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [actionFilter, methodFilter])

  async function loadLogs() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (actionFilter !== 'ALL') params.append('action', actionFilter)
      if (methodFilter !== 'ALL') params.append('method', methodFilter)

      const res = await fetch(`/api/activity-logs?${params.toString()}`)
      const data = await res.json()
      if (data.logs) setLogs(data.logs)
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
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <ClipboardList size={24} className="text-teal-700" />
            Guest Access & Activity Logs
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Complete, immutable audit trail of NFC scans, check-ins, checkouts, and staff transactions
          </p>
        </div>

        <a href="/api/reports?type=staff_activity&format=csv">
          <Button size="sm" variant="outline" className="border-stone-200 text-stone-700 text-xs gap-1.5 self-start sm:self-auto">
            <Download size={14} /> Export CSV Audit Trail
          </Button>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by guest name, reservation ref, wristband, staff, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-teal-600"
            />
          </div>
          <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs px-4">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs border border-stone-200 rounded-xl px-2.5 py-1.5 bg-stone-50 text-stone-700 focus:outline-teal-600"
            >
              <option value="ALL">All Actions</option>
              <option value="Check In">Check In</option>
              <option value="Check Out">Check Out</option>
              <option value="Wristband Assigned">Wristband Assigned</option>
              <option value="Wristband Replaced">Wristband Replaced</option>
              <option value="Wristband Disabled">Wristband Disabled</option>
              <option value="Manual Verification">Manual Verification</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="text-xs border border-stone-200 rounded-xl px-2.5 py-1.5 bg-stone-50 text-stone-700 focus:outline-teal-600"
            >
              <option value="ALL">All Methods</option>
              <option value="NFC">NFC Tap</option>
              <option value="QR_CODE">QR Code</option>
              <option value="MANUAL">Manual Front Desk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Timestamp (UTC/Local)</th>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Guest</th>
                <th className="py-3.5 px-4">Reservation Ref</th>
                <th className="py-3.5 px-4">Wristband</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Transaction Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-stone-400">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        className={
                          log.action_type === 'Check In'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : log.action_type === 'Check Out'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : log.action_type === 'Wristband Disabled'
                            ? 'bg-rose-100 text-rose-800 font-bold border-rose-300'
                            : log.action_type === 'Wristband Replaced'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-teal-100 text-teal-800'
                        }
                      >
                        {log.action_type}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-stone-900 whitespace-nowrap">
                      {log.guest_name}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-teal-800 font-semibold whitespace-nowrap">
                      {log.reservation_ref || '—'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-700 whitespace-nowrap">
                      {log.wristband_code ? (
                        <span className="inline-flex items-center gap-1 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                          <Radio size={10} className="text-teal-600" />
                          {log.wristband_code}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                        {log.verification_method}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-700 whitespace-nowrap">
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
  )
}
