'use client'

import React, { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/Header'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { NfcScannerModal } from '@/components/nfc/NfcScannerModal'
import {
  Radio,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  Tag,
  UserCheck,
  Zap,
} from 'lucide-react'

type WristbandStatus = 'AVAILABLE' | 'ACTIVE' | 'DEACTIVATED' | 'LOST' | 'DAMAGED'

export default function WristbandsPage() {
  const [wristbands, setWristbands] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [nfcScanOpen, setNfcScanOpen] = useState(false)
  const [logsModalOpen, setLogsModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedWristband, setSelectedWristband] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Register form
  const [regUid, setRegUid] = useState('')
  const [regLabel, setRegLabel] = useState('')
  const [regNotes, setRegNotes] = useState('')

  // Status change form
  const [newStatus, setNewStatus] = useState<WristbandStatus>('AVAILABLE')
  const [statusReason, setStatusReason] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/wristbands')
      const data = await res.json()
      if (data.wristbands) setWristbands(data.wristbands)
      if (data.logs) setLogs(data.logs)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleRegister() {
    if (!regUid || !regLabel) { alert('UID and Label are required'); return }
    setActionLoading(true)
    try {
      const res = await fetch('/api/wristbands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: regUid, label: regLabel, notes: regNotes }),
      })
      const data = await res.json()
      if (data.wristband) {
        setRegisterModalOpen(false)
        setRegUid(''); setRegLabel(''); setRegNotes('')
        await loadData()
      } else { alert(data.error || 'Registration failed') }
    } catch (err: any) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  async function handleStatusChange() {
    if (!selectedWristband) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/wristbands/${selectedWristband.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason: statusReason }),
      })
      const data = await res.json()
      if (data.success) {
        setStatusModalOpen(false)
        await loadData()
      } else { alert(data.error || 'Status update failed') }
    } catch (err: any) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  function handleNfcScanned(wristband: any) {
    if (wristband) {
      const found = wristbands.find(w => w.uid === wristband.uid)
      if (found) {
        setSelectedWristband(found)
        setLogsModalOpen(true)
      }
    }
  }

  const filtered = wristbands.filter(wb => {
    const matchesStatus = statusFilter === 'ALL' || wb.status === statusFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || wb.label.toLowerCase().includes(q) || wb.uid.toLowerCase().includes(q) ||
      (wb.currentGuestName && wb.currentGuestName.toLowerCase().includes(q))
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: wristbands.length,
    available: wristbands.filter(w => w.status === 'AVAILABLE').length,
    active: wristbands.filter(w => w.status === 'ACTIVE').length,
    deactivated: wristbands.filter(w => w.status === 'DEACTIVATED').length,
    lost: wristbands.filter(w => w.status === 'LOST' || w.status === 'DAMAGED').length,
  }

  const statusVariant: Record<string, any> = {
    AVAILABLE: 'success',
    ACTIVE: 'forest',
    DEACTIVATED: 'outline',
    LOST: 'danger',
    DAMAGED: 'danger',
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f7f6ef]">
      <DashboardHeader
        title="NFC Wristband Fleet Management"
        subtitle="Register, scan, assign and manage the resort's reusable contactless wristband inventory"
      />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Wristbands', value: stats.total, color: 'text-stone-900' },
            { label: 'Available (Tray)', value: stats.available, color: 'text-emerald-800' },
            { label: 'Active (Assigned)', value: stats.active, color: 'text-[#14261d]' },
            { label: 'Deactivated', value: stats.deactivated, color: 'text-stone-600' },
            { label: 'Lost / Damaged', value: stats.lost, color: 'text-rose-700' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border-2 border-black p-4 text-center shadow-[3px_3px_0px_#000]">
              <div className={`text-2xl font-serif font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
            {['ALL','AVAILABLE','ACTIVE','DEACTIVATED','LOST','DAMAGED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all ${
                  statusFilter === s ? 'bg-[#14261d] text-white' : 'bg-white text-stone-900 hover:bg-stone-100'
                }`}>
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input type="text" placeholder="Search label, UID, guest..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border-2 border-black w-full focus:outline-none" />
            </div>
            <button onClick={loadData} disabled={loading} className="p-2 bg-white text-stone-900 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setNfcScanOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5">
              <Radio size={13} className="animate-pulse" /> Scan NFC
            </button>
            <button onClick={() => setRegisterModalOpen(true)}
              className="bg-[#14261d] hover:bg-[#1f382b] text-white text-xs font-bold px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5">
              <Plus size={13} /> Register Wristband
            </button>
          </div>
        </div>

        {/* Wristbands Table */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f6ef] text-stone-800 uppercase tracking-wider text-[10px] font-bold border-b-2 border-black">
                <tr>
                  <th className="py-3 px-4">Label</th>
                  <th className="py-3 px-4">NFC UID (Chip ID)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Current Guest</th>
                  <th className="py-3 px-4">Last Scanned</th>
                  <th className="py-3 px-4">Last Assigned</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filtered.map(wb => (
                  <tr key={wb.id} className="hover:bg-[#f7f6ef]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900 font-mono text-sm">{wb.label}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-700 text-xs font-semibold">{wb.uid}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={statusVariant[wb.status] || 'default'}>{wb.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {wb.currentGuestName
                        ? <div>
                            <div className="font-bold text-stone-900 flex items-center gap-1">
                              <UserCheck size={12} className="text-emerald-700" />
                              {wb.currentGuestName}
                            </div>
                            {wb.currentReservationId && (
                              <div className="text-[10px] text-stone-500 font-mono">Res: {wb.currentReservationId.slice(0,12)}...</div>
                            )}
                          </div>
                        : <span className="text-stone-400 italic text-[11px]">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 font-medium">
                      {wb.lastScannedAt ? new Date(wb.lastScannedAt).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 font-medium">
                      {wb.lastAssignedAt ? new Date(wb.lastAssignedAt).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 max-w-[180px] truncate">{wb.notes || '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="px-2 py-1 text-[11px] font-bold bg-white text-stone-900 border border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-stone-100"
                          onClick={() => { setSelectedWristband(wb); setNewStatus(wb.status); setStatusReason(''); setStatusModalOpen(true) }}>
                          Status
                        </button>
                        <button className="p-1 text-stone-700 bg-white border border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-stone-100"
                          onClick={() => { setSelectedWristband(wb); setLogsModalOpen(true) }}>
                          <History size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="p-8 text-center text-stone-500 text-xs font-medium">No wristbands found matching filters.</div>
            )}
          </div>
        </div>

        {/* NFC Reuse Info Banner */}
        <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#000] text-xs text-stone-800 flex items-start gap-4">
          <div className="size-9 bg-[#14261d] text-white flex items-center justify-center font-bold border border-black shrink-0 shadow-[2px_2px_0px_#000]">
            <Radio size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="font-serif text-base font-bold text-stone-900 mb-1">Reusable Contactless Fleet Architecture</div>
            <div className="text-stone-700 leading-relaxed font-medium">
              Guest privacy and security guarantee: Personal guest information is <strong>never stored on the physical silicon</strong>. The chip only holds a hardware UID (e.g. <span className="font-mono font-bold">04:7B:A2:3F</span>). 
              Upon guest checkout, the wristband is disinfected and automatically flagged back to <strong>AVAILABLE</strong> in the inventory tray for reassignment.
            </div>
          </div>
        </div>
      </main>

      {/* Register Wristband Dialog */}
      <Dialog open={registerModalOpen} onClose={() => setRegisterModalOpen(false)}
        title="Register New NFC Wristband" description="Add a new reusable wristband to the resort inventory">
        <div className="space-y-4 text-xs">
          <div className="bg-[#f7f6ef] border-2 border-black p-3 text-stone-800 text-[11px] flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-700" />
            <span className="font-medium">Use the NFC Scanner to auto-read the chip UID from physical hardware. For testing, enter a hex UID manually.</span>
          </div>
          <div>
            <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">NFC Chip UID <span className="text-rose-600">*</span></label>
            <input type="text" placeholder="04:A3:8C:F2:10:5B:80" value={regUid}
              onChange={e => setRegUid(e.target.value)}
              className="w-full p-2 border-2 border-black bg-white font-mono text-xs focus:outline-none" />
            <p className="text-[10px] text-stone-500 mt-1 font-mono">Format: 7-byte hex, colon-separated (ISO 14443A)</p>
          </div>
          <div>
            <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Wristband Label <span className="text-rose-600">*</span></label>
            <input type="text" placeholder="WB-0107" value={regLabel}
              onChange={e => setRegLabel(e.target.value)}
              className="w-full p-2 border-2 border-black bg-white text-xs font-mono focus:outline-none" />
          </div>
          <div>
            <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Notes (optional)</label>
            <input type="text" placeholder="Batch 4 received from supplier..." value={regNotes}
              onChange={e => setRegNotes(e.target.value)}
              className="w-full p-2 border-2 border-black bg-white text-xs focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t-2 border-black">
            <button onClick={() => setRegisterModalOpen(false)} className="px-3 py-1.5 bg-white text-stone-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">Cancel</button>
            <button onClick={handleRegister} disabled={actionLoading}
              className="px-4 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">
              {actionLoading ? 'Registering...' : 'Register to Inventory'}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Status Change Dialog */}
      {selectedWristband && (
        <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)}
          title={`Update Wristband Status — ${selectedWristband.label}`}
          description={`Current: ${selectedWristband.status} · UID: ${selectedWristband.uid}`}>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">New Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as WristbandStatus)}
                className="w-full p-2 border-2 border-black bg-white text-xs font-bold focus:outline-none">
                <option value="AVAILABLE">AVAILABLE — Ready for assignment</option>
                <option value="DEACTIVATED">DEACTIVATED — Taken out of rotation</option>
                <option value="LOST">LOST — Reported missing by guest</option>
                <option value="DAMAGED">DAMAGED — Physical damage, cannot be used</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Reason / Notes</label>
              <input type="text" placeholder="e.g. Guest returned damaged wristband at checkout..."
                value={statusReason} onChange={e => setStatusReason(e.target.value)}
                className="w-full p-2 border-2 border-black bg-white text-xs focus:outline-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t-2 border-black">
              <button onClick={() => setStatusModalOpen(false)} className="px-3 py-1.5 bg-white text-stone-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">Cancel</button>
              <button onClick={handleStatusChange} disabled={actionLoading}
                className="px-4 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Activity Log Dialog */}
      {selectedWristband && (
        <Dialog open={logsModalOpen} onClose={() => setLogsModalOpen(false)}
          title={`Activity History — ${selectedWristband.label}`}
          description="Complete audit trail for this wristband" maxWidth="lg">
          <div className="space-y-2 text-xs max-h-96 overflow-y-auto">
            {logs.filter(l => l.wristbandUid === selectedWristband.uid).length === 0
              ? <p className="text-stone-500 italic text-center py-6 font-medium">No activity recorded yet.</p>
              : logs.filter(l => l.wristbandUid === selectedWristband.uid).map(log => (
                  <div key={log.id} className="p-3 border-2 border-black bg-[#f7f6ef] shadow-[2px_2px_0px_#000] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 flex items-center gap-1.5 font-mono">
                        <Radio size={12} className="text-emerald-700" /> {log.action}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-stone-700">{log.details}</p>
                    {log.staffName && <div className="text-[10px] text-stone-500 font-bold">Staff: {log.staffName}</div>}
                  </div>
                ))
            }
          </div>
        </Dialog>
      )}

      {/* NFC Scanner for quick scan */}
      <NfcScannerModal isOpen={nfcScanOpen} onClose={() => { setNfcScanOpen(false); loadData() }}
        onSelectWristband={handleNfcScanned} actionLabel="View Details" />
    </div>
  )
}
