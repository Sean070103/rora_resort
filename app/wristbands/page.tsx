'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Radio,
  Search,
  Plus,
  Filter,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Clock,
  Key,
  CheckCircle2,
  XCircle,
  Copy,
  ScanLine,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { AppShell } from '@/components/layout/AppShell'
import { Wristband, WristbandStatus } from '@/lib/types'

export default function WristbandsPage() {
  const [wristbands, setWristbands] = useState<Wristband[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Register New Wristband Modal
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [wristbandCode, setWristbandCode] = useState('')
  const [customToken, setCustomToken] = useState('')
  const [condition, setCondition] = useState<'Good' | 'Fair' | 'Damaged'>('Good')
  const [notes, setNotes] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [regError, setRegError] = useState('')

  // Replace Lost Wristband Modal (TEST 5)
  const [replaceModalOpen, setReplaceModalOpen] = useState(false)
  const [selectedOldWristband, setSelectedOldWristband] = useState<Wristband | null>(null)
  const [selectedNewWristbandId, setSelectedNewWristbandId] = useState('')
  const [replaceReason, setReplaceReason] = useState('Lost wristband at beach')
  const [isReplacing, setIsReplacing] = useState(false)

  // Disable Wristband Modal (TEST 4)
  const [disableModalOpen, setDisableModalOpen] = useState(false)
  const [selectedDisableWb, setSelectedDisableWb] = useState<Wristband | null>(null)
  const [disableReason, setDisableReason] = useState('Compromised / casing broken')
  const [isDisabling, setIsDisabling] = useState(false)

  useEffect(() => {
    loadWristbands()
  }, [statusFilter])

  async function loadWristbands() {
    setLoading(true)
    try {
      const statusParam = statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''
      const res = await fetch(`/api/wristbands${statusParam}`)
      const data = await res.json()
      if (data.wristbands) setWristbands(data.wristbands)
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
      const res = await fetch(`/api/wristbands?q=${q}`)
      const data = await res.json()
      if (data.wristbands) setWristbands(data.wristbands)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegisterWristband(e: React.FormEvent) {
    e.preventDefault()
    setIsRegistering(true)
    setRegError('')

    try {
      const res = await fetch('/api/wristbands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wristband_code: wristbandCode,
          nfc_token: customToken,
          condition,
          notes,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setRegError(data.error || 'Failed to register wristband')
        return
      }

      setRegisterModalOpen(false)
      setWristbandCode('')
      setCustomToken('')
      setNotes('')
      loadWristbands()
    } catch (err: any) {
      setRegError(err.message)
    } finally {
      setIsRegistering(false)
    }
  }

  // REPLACE LOST WRISTBAND (TEST 5)
  async function handleExecuteReplacement() {
    if (!selectedOldWristband || !selectedNewWristbandId) return
    setIsReplacing(true)

    try {
      const res = await fetch('/api/wristbands/replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldWristbandId: selectedOldWristband.id,
          newWristbandId: selectedNewWristbandId,
          reason: replaceReason,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Replacement failed')
        return
      }

      setReplaceModalOpen(false)
      loadWristbands()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsReplacing(false)
    }
  }

  // DISABLE WRISTBAND (TEST 4)
  async function handleExecuteDisable() {
    if (!selectedDisableWb) return
    setIsDisabling(true)

    try {
      const res = await fetch('/api/wristbands/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wristbandId: selectedDisableWb.id,
          reason: disableReason,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Disable failed')
        return
      }

      setDisableModalOpen(false)
      loadWristbands()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsDisabling(false)
    }
  }

  const availableBands = wristbands.filter((w) => w.status === 'Available')

  return (
    <AppShell title="Wristband Inventory" subtitle="Hardware wristband management, random NDEF tokens, replacements, and access status">
      <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Radio size={24} className="text-teal-700" />
            NFC Wristband Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Wristband hardware inventory, secure random NDEF tokens, replacements, and access status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/wristbands/assign">
            <Button size="sm" variant="outline" className="border-teal-300 text-teal-800 text-xs gap-1.5">
              <Plus size={14} /> Assign Wristband
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => setRegisterModalOpen(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1.5"
          >
            <Radio size={14} /> Register New Band
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by code (e.g. WB-801), token, or assigned guest..."
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
          <span className="text-xs text-stone-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-2.5 py-1.5 bg-stone-50 text-stone-700 focus:outline-teal-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Disabled">Disabled</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Wristbands Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Wristband Code</th>
                <th className="py-3.5 px-4">NDEF Opaque Token</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Guest</th>
                <th className="py-3.5 px-4">Condition</th>
                <th className="py-3.5 px-4">Last Scanned</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {wristbands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-stone-400">
                    No wristbands found matching your filter.
                  </td>
                </tr>
              ) : (
                wristbands.map((w) => (
                  <tr key={w.id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-900 text-sm">
                      {w.wristband_code}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                      <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {w.nfc_token.substring(0, 16)}...
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        className={
                          w.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : w.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : w.status === 'Disabled'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                            : 'bg-amber-100 text-amber-800'
                        }
                      >
                        {w.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      {w.guest ? (
                        <div>
                          <p className="font-semibold text-stone-900">{w.guest.full_name}</p>
                          <span className="text-[10px] text-stone-400 font-mono">
                            Ref: {w.reservation?.reference_number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-medium ${
                          w.condition === 'Good'
                            ? 'text-emerald-700'
                            : w.condition === 'Fair'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {w.condition}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                      {w.last_scanned_at ? new Date(w.last_scanned_at).toLocaleString() : 'Never'}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      {w.status === 'Assigned' && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setSelectedOldWristband(w)
                            setReplaceModalOpen(true)
                          }}
                          className="border-amber-300 text-amber-800 hover:bg-amber-50 text-[11px]"
                        >
                          Replace Lost
                        </Button>
                      )}

                      {w.status !== 'Disabled' && w.status !== 'Lost' && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setSelectedDisableWb(w)
                            setDisableModalOpen(true)
                          }}
                          className="border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px]"
                        >
                          Disable
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER WRISTBAND MODAL */}
      <Dialog
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Register New NFC Wristband"
        description="Add a new wristband to the resort inventory. An opaque random token will be generated if left blank."
      >
        <form onSubmit={handleRegisterWristband} className="space-y-3 pt-2">
          {regError && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 text-xs">
              {regError}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Wristband Code (Label) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WB-810"
              value={wristbandCode}
              onChange={(e) => setWristbandCode(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600 font-mono uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Custom NDEF Opaque Token (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave blank to auto-generate cryptographically secure token"
              value={customToken}
              onChange={(e) => setCustomToken(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600 font-mono"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Never enter personal guest data here. This token is an opaque cryptographic reference.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
              >
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Notes</label>
              <input
                type="text"
                placeholder="Batch info / dock shelf"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-teal-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setRegisterModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isRegistering} className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold">
              {isRegistering ? 'Registering...' : 'Save Wristband'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* REPLACE LOST WRISTBAND MODAL (RULE 7 & TEST 5) */}
      <Dialog
        open={replaceModalOpen}
        onClose={() => setReplaceModalOpen(false)}
        title="Replace Lost Wristband"
        description="Invalidates the old wristband immediately and assigns a new available wristband."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1 text-amber-950">
            <p>
              Current Wristband: <strong>{selectedOldWristband?.wristband_code}</strong>
            </p>
            <p>
              Assigned Guest: <strong>{selectedOldWristband?.guest?.full_name}</strong>
            </p>
            <p className="text-[11px] text-amber-800">
              Upon confirmation, {selectedOldWristband?.wristband_code} will be invalidated and marked LOST. Scanning it will be permanently rejected.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Select Replacement Wristband (Must be Available):
            </label>
            <select
              value={selectedNewWristbandId}
              onChange={(e) => setSelectedNewWristbandId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-teal-600"
            >
              <option value="">-- Choose available wristband --</option>
              {availableBands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.wristband_code} (Condition: {b.condition})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Replacement Reason:
            </label>
            <input
              type="text"
              value={replaceReason}
              onChange={(e) => setReplaceReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setReplaceModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              disabled={isReplacing || !selectedNewWristbandId}
              onClick={handleExecuteReplacement}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
            >
              {isReplacing ? 'Replacing...' : 'Invalidate Old & Assign New'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DISABLE WRISTBAND MODAL (RULE 3 & TEST 4) */}
      <Dialog
        open={disableModalOpen}
        onClose={() => setDisableModalOpen(false)}
        title="Disable Wristband"
        description="Revoke access authorization for this wristband immediately."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950">
            Disabling wristband <strong>{selectedDisableWb?.wristband_code}</strong> will block all check-in/out and resort access.
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Reason for Disabling:
            </label>
            <input
              type="text"
              value={disableReason}
              onChange={(e) => setDisableReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDisableModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              disabled={isDisabling}
              onClick={handleExecuteDisable}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              {isDisabling ? 'Disabling...' : 'Confirm Disable'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
    </AppShell>
  )
}
