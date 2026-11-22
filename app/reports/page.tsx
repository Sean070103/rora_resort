'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  Users,
  Radio,
  UserCheck,
  Award,
  Clock,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('arrivals')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const reportCategories = [
    { id: 'arrivals', name: 'Daily Arrivals', icon: UserCheck, desc: 'Scheduled & checked-in arrivals for selected date' },
    { id: 'departures', name: 'Daily Departures', icon: Clock, desc: 'Scheduled & completed departures and ledger balances' },
    { id: 'occupancy', name: 'Current Guest Occupancy', icon: Users, desc: 'All guests currently residing on resort grounds' },
    { id: 'vip', name: 'VIP Guest Activity', icon: Award, desc: 'VIP guest profiles, perks, special requests, and history' },
    { id: 'wristbands', name: 'Wristband Inventory & Telemetry', icon: Radio, desc: 'Full lifecycle of wristband tags, status & scan history' },
    { id: 'staff_activity', name: 'Receptionist Shift Activity', icon: Calendar, desc: 'Front desk check-ins, checkouts, and pairings by staff member' },
  ]

  useEffect(() => {
    loadReport()
  }, [reportType, selectedDate])

  async function loadReport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports?type=${reportType}&date=${selectedDate}`)
      const data = await res.json()
      if (data.data) {
        setReportData(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const exportUrl = `/api/reports?type=${reportType}&date=${selectedDate}&format=csv`

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={24} className="text-teal-700" />
            Operational Reports & Export
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Generate hospitality reports, arrival rosters, occupancy audits, and export to CSV
          </p>
        </div>

        <a href={exportUrl} download>
          <Button className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-2 self-start sm:self-auto shadow-sm">
            <FileSpreadsheet size={15} /> Export Report (CSV)
          </Button>
        </a>
      </div>

      {/* Report Categories Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {reportCategories.map((cat) => {
          const Icon = cat.icon
          const isSelected = reportType === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setReportType(cat.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-teal-900 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-teal-300 hover:bg-stone-50'
              }`}
            >
              <Icon size={18} className={isSelected ? 'text-teal-300' : 'text-teal-700'} />
              <h3 className="font-bold text-xs mt-2 leading-tight">{cat.name}</h3>
            </button>
          )
        })}
      </div>

      {/* Filter and Date Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-700">Filter Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-stone-200 rounded-xl bg-stone-50 text-stone-800 focus:outline-teal-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-stone-100 text-stone-800 border-stone-200 text-xs">
            {reportData.length} Records Found
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={loadReport}
            className="border-stone-200 text-stone-700 text-xs gap-1"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Report Results Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {reportData.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No data records found for this report and date criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                  {Object.keys(reportData[0]).map((header) => (
                    <th key={header} className="py-3 px-4">
                      {header.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-teal-50/20 transition-colors">
                    {Object.keys(row).map((key) => (
                      <td key={key} className="py-3 px-4 text-stone-800">
                        {String(row[key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
