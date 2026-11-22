'use client'

import React, { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/Header'
import { Award, Settings, Save, RefreshCw, ChevronRight, TrendingUp, History } from 'lucide-react'

export default function LoyaltyPage() {
  const [settings, setSettings] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [tiers, setTiers] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [settRes, guestRes] = await Promise.all([
        fetch('/api/loyalty/settings'),
        fetch('/api/loyalty/guests'),
      ])
      const settData = await settRes.json()
      const guestData = await guestRes.json()
      if (settData.settings) {
        setSettings(settData.settings)
        setTiers(JSON.parse(JSON.stringify(settData.settings.tiers)))
      }
      if (guestData.auditLogs) setAuditLogs(guestData.auditLogs)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleSaveTiers() {
    setSaving(true)
    try {
      const res = await fetch('/api/loyalty/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers }),
      })
      const data = await res.json()
      if (data.success) {
        setEditing(false)
        await loadData()
      } else { alert(data.error || 'Save failed') }
    } catch (err: any) { alert(err.message) }
    finally { setSaving(false) }
  }

  function updateTier(index: number, field: string, value: any) {
    const updated = [...tiers]
    updated[index] = { ...updated[index], [field]: value }
    setTiers(updated)
  }

  const tierColors = ['bg-[#f7f6ef] text-stone-900', 'bg-sky-100 text-sky-950', 'bg-amber-100 text-amber-950', 'bg-[#14261d] text-white']

  return (
    <div className="flex-1 flex flex-col bg-[#f7f6ef]">
      <DashboardHeader
        title="Loyalty & Rewards Program"
        subtitle="Configure discount tiers, member perks, and view the loyalty audit trail"
      />

      <main className="p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Tier Summary Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">Loyalty Tier Configuration</h2>
              <p className="text-xs text-stone-600 font-medium">Automatic discount structure based on completed guest stays</p>
            </div>
            <div className="flex gap-2">
              <button onClick={loadData} disabled={loading} className="p-2 bg-white text-stone-900 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]">
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
              {!editing
                ? <button onClick={() => setEditing(true)}
                    className="bg-[#14261d] hover:bg-[#1f382b] text-white text-xs font-bold px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5">
                    <Settings size={13} /> Edit Tiers
                  </button>
                : <button onClick={handleSaveTiers} disabled={saving}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5">
                    <Save size={13} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
              }
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(editing ? tiers : (settings?.tiers || [])).map((tier: any, i: number) => (
              <div key={tier.tier || i} className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden flex flex-col justify-between">
                <div>
                  <div className={`p-3 text-center border-b-2 border-black ${tierColors[i]}`}>
                    <Award size={22} className="mx-auto mb-1 opacity-90" />
                    {editing
                      ? <input value={tier.tier} onChange={e => updateTier(i, 'tier', e.target.value)}
                          className="text-center bg-white border-2 border-black px-2 py-0.5 text-sm font-serif font-bold w-full" />
                      : <h3 className="font-serif text-base font-bold">{tier.tier}</h3>}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-1">Minimum Stays</div>
                      {editing
                        ? <input type="number" min={0} value={tier.minCompletedVisits}
                            onChange={e => updateTier(i, 'minCompletedVisits', Number(e.target.value))}
                            className="w-full p-1.5 border-2 border-black bg-white text-xs text-center font-mono font-bold" />
                        : <div className="text-xl font-serif font-bold text-stone-900 text-center">
                            {tier.minCompletedVisits === 0 ? 'First Visit' : `${tier.minCompletedVisits}+ visits`}
                          </div>}
                    </div>
                    <div>
                      <div className="text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-1">Discount Rate</div>
                      {editing
                        ? <div className="flex items-center gap-1">
                            <input type="number" min={0} max={100} value={tier.discountPercentage}
                              onChange={e => updateTier(i, 'discountPercentage', Number(e.target.value))}
                              className="w-full p-1.5 border-2 border-black bg-white text-xs text-center font-mono font-bold" />
                            <span className="text-stone-700 font-bold text-xs">%</span>
                          </div>
                        : <div className="text-xl font-serif font-bold text-stone-900 text-center">
                            {tier.discountPercentage === 0 ? 'No Discount' : `${tier.discountPercentage}% OFF`}
                          </div>}
                    </div>
                    <div>
                      <div className="text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-1">Member Perks</div>
                      {editing
                        ? <textarea rows={3} value={(tier.perks || []).join('\n')}
                            onChange={e => updateTier(i, 'perks', e.target.value.split('\n').filter(Boolean))}
                            className="w-full p-1.5 border-2 border-black bg-white text-[11px] font-medium" placeholder="One perk per line" />
                        : <ul className="space-y-1">
                            {(tier.perks || []).map((perk: string) => (
                              <li key={perk} className="text-[11px] text-stone-700 font-medium flex items-start gap-1.5">
                                <ChevronRight size={11} className="text-[#14261d] mt-0.5 shrink-0" /> {perk}
                              </li>
                            ))}
                          </ul>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Progression Visual */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000]">
          <div className="p-5 border-b-2 border-black bg-[#f7f6ef]">
            <h3 className="font-serif text-lg font-bold text-stone-900">How Loyalty Works</h3>
            <p className="text-xs text-stone-600 font-medium mt-0.5">Automatic progression based on completed &amp; eligible stays</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 text-xs flex-wrap">
              {(settings?.tiers || []).map((tier: any, i: number, arr: any[]) => (
                <React.Fragment key={tier.tier}>
                  <div className="flex flex-col items-center gap-1 border-2 border-black p-3 bg-white shadow-[2px_2px_0px_#000]">
                    <div className={`px-3 py-1 font-bold text-xs border border-black ${i === 0 ? 'bg-[#f7f6ef] text-stone-900' : i === 1 ? 'bg-sky-100 text-sky-950' : i === 2 ? 'bg-amber-100 text-amber-950' : 'bg-[#14261d] text-white'}`}>
                      {tier.tier}
                    </div>
                    <div className="text-[11px] font-bold text-stone-800">{tier.discountPercentage}% discount</div>
                    <div className="text-[9px] text-stone-500 uppercase font-bold">
                      {tier.minCompletedVisits === 0 ? '1st visit' : `After ${tier.minCompletedVisits} stay(s)`}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <ChevronRight size={18} className="text-stone-900 font-bold" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-4 text-xs text-stone-700 bg-[#f7f6ef] p-4 border-2 border-black leading-relaxed font-medium">
              <strong>System logic:</strong> Only <strong>COMPLETED</strong> reservations count toward loyalty tier advancement. Cancelled and pending reservations are excluded. Tiers are evaluated automatically at each new booking and upon check-out. Administrators can manually override via Guest Management with a full audit trail.
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <History size={16} className="text-stone-700" />
            <h3 className="font-serif text-lg font-bold text-stone-900">Loyalty Audit Trail</h3>
          </div>
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] divide-y divide-black/10">
            {auditLogs.length === 0
              ? <div className="p-6 text-center text-stone-500 text-xs font-medium">No audit events yet.</div>
              : auditLogs.slice(0, 15).map(log => (
                  <div key={log.id} className="flex items-start justify-between p-4 hover:bg-[#f7f6ef]/60 text-xs">
                    <div>
                      <div className="font-bold text-stone-900">{log.guestName}</div>
                      <div className="text-stone-700 mt-0.5">{log.reason}</div>
                      <div className="text-stone-500 text-[10px] mt-1 font-bold">Staff: {log.performedBy}</div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-stone-600 font-medium">
                        {log.previousCompletedVisits} → <strong className="text-stone-900 font-bold">{log.newCompletedVisits}</strong> visits
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </main>
    </div>
  )
}
