'use client'

import React, { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/Header'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import {
  Users, Search, Radio, CalendarDays, Star, Award, ChevronRight,
  RefreshCw, TrendingUp, Edit3
} from 'lucide-react'

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loyaltyTiers, setLoyaltyTiers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<any>(null)
  const [guestDetailOpen, setGuestDetailOpen] = useState(false)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [adjustVisits, setAdjustVisits] = useState(0)
  const [adjustReason, setAdjustReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [gRes, loyRes] = await Promise.all([
        fetch('/api/loyalty/guests'),
        fetch('/api/loyalty/settings'),
      ])
      const gData = await gRes.json()
      const loyData = await loyRes.json()
      if (gData.guests) setGuests(gData.guests)
      if (gData.auditLogs) setAuditLogs(gData.auditLogs)
      if (loyData.settings?.tiers) setLoyaltyTiers(loyData.settings.tiers)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleAdjust() {
    if (!selectedGuest || !adjustReason) { alert('Reason required'); return }
    setAdjusting(true)
    try {
      const res = await fetch('/api/loyalty/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestPhone: selectedGuest.phone,
          guestName: selectedGuest.name,
          newCompletedVisits: adjustVisits,
          reason: adjustReason,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setAdjustModalOpen(false)
        setAdjustReason('')
        await loadData()
      } else { alert(data.error || 'Adjustment failed') }
    } catch (err: any) { alert(err.message) }
    finally { setAdjusting(false) }
  }

  const tierBadgeVariant: Record<string, any> = {
    Standard: 'default', Silver: 'info', Gold: 'gold', Platinum: 'forest'
  }

  const filtered = guests.filter(g => {
    const q = searchQuery.toLowerCase()
    return !q || g.name.toLowerCase().includes(q) || g.phone.includes(q) || g.email.toLowerCase().includes(q)
  })

  return (
    <div className="flex-1 flex flex-col bg-[#f7f6ef]">
      <DashboardHeader
        title="Guest Profiles & Loyalty"
        subtitle="View guest profiles, booking histories, loyalty tiers, and NFC wristband assignments"
      />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Registered Guests', value: guests.length, icon: Users },
            { label: 'Silver+ Members', value: guests.filter(g => g.loyaltyTier?.tier !== 'Standard').length, icon: Star },
            { label: 'Platinum VIPs', value: guests.filter(g => g.loyaltyTier?.tier === 'Platinum').length, icon: Award },
            { label: 'Gold Members', value: guests.filter(g => g.loyaltyTier?.tier === 'Gold').length, icon: TrendingUp },
          ].map(stat => (
            <div key={stat.label} className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_#000] flex items-center gap-3">
              <div className="size-10 bg-[#f7f6ef] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]">
                <stat.icon size={18} className="text-[#14261d]" />
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-stone-900">{stat.value}</div>
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input type="text" placeholder="Search by name, phone, or email..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border-2 border-black rounded-none shadow-[2px_2px_0px_#000] focus:outline-none" />
          </div>
          <button onClick={loadData} disabled={loading} className="px-3 py-2 text-xs font-bold bg-white text-stone-900 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Guests Table */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f6ef] text-stone-800 uppercase tracking-wider text-[10px] font-bold border-b-2 border-black">
                <tr>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Loyalty Tier</th>
                  <th className="py-3 px-4">Completed Visits</th>
                  <th className="py-3 px-4">Total Bookings</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">NFC Wristband</th>
                  <th className="py-3 px-4">Last Visit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filtered.map(g => (
                  <tr key={g.phone} className="hover:bg-[#f7f6ef]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{g.name}</td>
                    <td className="py-3.5 px-4 text-stone-700">
                      <div className="font-mono font-semibold">{g.phone}</div>
                      <div className="text-[10px] text-stone-500">{g.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={tierBadgeVariant[g.loyaltyTier?.tier] || 'default'}>
                        {g.loyaltyTier?.tier || 'Standard'}
                        {g.loyaltyTier?.discountPercentage > 0 && ` (${g.loyaltyTier.discountPercentage}% off)`}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{g.effectiveCompletedVisits}</div>
                      {g.nextTier && (
                        <div className="text-[10px] text-stone-500 font-medium">
                          {g.visitsUntilNextTier} more → {g.nextTier.tier}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-800 font-bold">{g.totalBookings}</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-stone-900 text-sm">
                      ₱{(g.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {g.assignedWristband
                        ? <Badge variant="forest" className="font-mono text-[10px]">
                            <Radio size={10} /> {g.assignedWristband.label}
                          </Badge>
                        : <span className="text-stone-400 italic text-[11px]">None</span>}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 font-medium font-mono text-[11px]">
                      {g.lastVisitDate || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="px-2.5 py-1 text-[11px] font-bold bg-[#f7f6ef] hover:bg-white text-stone-900 border-2 border-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                        onClick={() => { setSelectedGuest(g); setAdjustVisits(g.effectiveCompletedVisits); setGuestDetailOpen(true) }}>
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="p-8 text-center text-stone-500 text-xs font-medium">No guests found.</div>
            )}
          </div>
        </div>
      </main>

      {/* Guest Detail Modal */}
      {selectedGuest && (
        <Dialog open={guestDetailOpen} onClose={() => setGuestDetailOpen(false)}
          title={selectedGuest.name} description={`${selectedGuest.phone} · ${selectedGuest.email}`} maxWidth="lg">
          <div className="space-y-4 text-xs">
            {/* Loyalty Card */}
            <div className="bg-[#14261d] border-2 border-black p-4 text-white shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Loyalty Membership</span>
                  <h3 className="text-xl font-serif font-bold mt-0.5 text-white">
                    {selectedGuest.loyaltyTier?.tier} Member
                  </h3>
                </div>
                <Award size={28} className="text-amber-300" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/10 border border-white/20 p-2">
                  <div className="text-xl font-serif font-bold">{selectedGuest.effectiveCompletedVisits}</div>
                  <div className="text-[9px] uppercase tracking-wider text-stone-300 font-bold">Completed Visits</div>
                </div>
                <div className="bg-white/10 border border-white/20 p-2">
                  <div className="text-xl font-serif font-bold">{selectedGuest.loyaltyTier?.discountPercentage || 0}%</div>
                  <div className="text-[9px] uppercase tracking-wider text-stone-300 font-bold">Discount Rate</div>
                </div>
                <div className="bg-white/10 border border-white/20 p-2">
                  <div className="text-xl font-serif font-bold">₱{(selectedGuest.totalSpent || 0).toLocaleString()}</div>
                  <div className="text-[9px] uppercase tracking-wider text-stone-300 font-bold">Total Spent</div>
                </div>
              </div>
              {selectedGuest.loyaltyTier?.perks?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-[10px] text-stone-300 font-bold uppercase tracking-wider mb-1">Tier Perks:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedGuest.loyaltyTier.perks.map((p: string) => (
                      <span key={p} className="text-[10px] bg-white/20 px-2 py-0.5 text-white font-semibold">✓ {p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Assigned Wristband */}
            <div className="p-3 border-2 border-black bg-white shadow-[2px_2px_0px_#000] flex items-center gap-3">
              <Radio size={16} className="text-[#14261d] shrink-0 animate-pulse" />
              <div>
                <div className="font-bold text-stone-900 uppercase text-[10px]">Active Contactless Wristband</div>
                {selectedGuest.assignedWristband
                  ? <div className="text-stone-800 font-mono text-[11px] font-bold">{selectedGuest.assignedWristband.label} · {selectedGuest.assignedWristband.uid} · <span className="font-sans font-semibold text-emerald-800">{selectedGuest.assignedWristband.status}</span></div>
                  : <div className="text-stone-400 italic">No wristband currently linked</div>}
              </div>
            </div>

            {/* Booking History */}
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-sm mb-2">Booking History ({selectedGuest.reservations?.length || 0})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(selectedGuest.reservations || []).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-2.5 bg-[#f7f6ef] border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                    <div>
                      <span className="font-mono font-bold text-stone-900">{r.referenceNumber}</span>
                      <span className="text-stone-700 ml-2 font-bold">{r.roomName}</span>
                      <div className="text-[10px] text-stone-500 font-medium">{r.checkInDate} → {r.checkOutDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold text-stone-900">₱{r.totalAmount.toLocaleString()}</div>
                      <Badge variant={r.status === 'COMPLETED' ? 'success' : r.status === 'CHECKED_IN' ? 'forest' : r.status === 'CANCELLED' ? 'danger' : 'warning'} className="text-[9px]">
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Adjust Loyalty */}
            <div className="pt-3 border-t-2 border-black flex justify-between items-center">
              <span className="text-stone-600 font-medium">Admin: Manually adjust loyalty visit count</span>
              <button onClick={() => { setGuestDetailOpen(false); setAdjustModalOpen(true) }} className="px-3 py-1.5 bg-[#f7f6ef] hover:bg-white text-stone-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
                <Edit3 size={13} /> Adjust Loyalty
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Loyalty Adjust Dialog */}
      {selectedGuest && (
        <Dialog open={adjustModalOpen} onClose={() => setAdjustModalOpen(false)}
          title="Manual Loyalty Adjustment"
          description={`Adjusting loyalty for ${selectedGuest.name} · Current visits: ${selectedGuest.effectiveCompletedVisits}`}>
          <div className="space-y-4 text-xs">
            <div className="bg-[#f7f6ef] border-2 border-black p-3 text-stone-800 text-[11px] font-medium">
              This action is logged in the loyalty audit trail. Use for corrections only — the system auto-increments loyalty upon checkout.
            </div>
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Override Completed Visits Count</label>
              <input type="number" min={0} max={999} value={adjustVisits}
                onChange={e => setAdjustVisits(Number(e.target.value))}
                className="w-full p-2 border-2 border-black bg-white text-sm font-mono focus:outline-none" />
            </div>
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Reason for Adjustment <span className="text-rose-600">*</span></label>
              <input type="text" placeholder="e.g. Corrected data entry error..."
                value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                className="w-full p-2 border-2 border-black bg-white text-xs focus:outline-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t-2 border-black">
              <button onClick={() => setAdjustModalOpen(false)} className="px-3 py-1.5 bg-white text-stone-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">Cancel</button>
              <button onClick={handleAdjust} disabled={adjusting}
                className="px-4 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">
                {adjusting ? 'Saving...' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
