'use client'

import React, { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/Header'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { CreditCard, Plus, Search, RefreshCw, DollarSign, ArrowUpRight, Receipt, AlertCircle } from 'lucide-react'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [recordModalOpen, setRecordModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formReservationId, setFormReservationId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formMethod, setFormMethod] = useState('CASH')
  const [formType, setFormType] = useState('BALANCE')
  const [formTxnRef, setFormTxnRef] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<any>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [payRes, resRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/reservations'),
      ])
      const payData = await payRes.json()
      const resData = await resRes.json()
      if (payData.payments) setPayments(payData.payments)
      if (resData.reservations) setReservations(resData.reservations)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  function handleSelectReservation(id: string) {
    setFormReservationId(id)
    const res = reservations.find(r => r.id === id)
    setSelectedReservation(res || null)
    if (res) {
      setFormAmount(String(res.balanceDue || ''))
    }
  }

  async function handleRecord() {
    if (!formReservationId || !formAmount || !formMethod || !formType) {
      alert('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: formReservationId,
          amount: Number(formAmount),
          paymentMethod: formMethod,
          paymentType: formType,
          transactionRef: formTxnRef,
          notes: formNotes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setRecordModalOpen(false)
        setFormReservationId(''); setFormAmount(''); setFormTxnRef(''); setFormNotes('')
        setSelectedReservation(null)
        await loadData()
      } else { alert(data.error || 'Payment failed') }
    } catch (err: any) { alert(err.message) }
    finally { setSaving(false) }
  }

  const totalCollected = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0)
  const pendingBalance = reservations.reduce((s, r) => s + (r.balanceDue || 0), 0)

  const methodVariant: Record<string, string> = {
    CASH: 'success', GCASH: 'info', CARD: 'default', BANK_TRANSFER: 'warning'
  }
  const typeVariant: Record<string, string> = {
    DEPOSIT: 'warning', BALANCE: 'info', FULL_PAYMENT: 'success', REFUND: 'danger'
  }

  const filtered = payments.filter(p => {
    const q = searchQuery.toLowerCase()
    return !q || p.guestName.toLowerCase().includes(q) || p.referenceNumber.toLowerCase().includes(q) || p.transactionRef.toLowerCase().includes(q)
  })

  return (
    <div className="flex-1 flex flex-col bg-[#f7f6ef]">
      <DashboardHeader
        title="Payments & Financial Ledger"
        subtitle="Record payments, track deposits, and manage outstanding balances"
      />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Financial Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#000] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Total Collected</div>
              <div className="text-2xl font-serif font-bold text-stone-900 mt-1">₱{totalCollected.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-800 font-bold mt-1">{payments.filter(p => p.status === 'COMPLETED').length} verified transactions</div>
            </div>
            <div className="size-11 bg-[#f7f6ef] border-2 border-black text-[#14261d] flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#000] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Outstanding Balance</div>
              <div className="text-2xl font-serif font-bold text-rose-700 mt-1">₱{pendingBalance.toLocaleString()}</div>
              <div className="text-[11px] text-stone-600 font-medium mt-1">across {reservations.filter(r => r.balanceDue > 0).length} reservations</div>
            </div>
            <div className="size-11 bg-[#f7f6ef] border-2 border-black text-rose-700 flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
              <Receipt size={20} />
            </div>
          </div>

          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#000] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Today&apos;s Collections</div>
              <div className="text-2xl font-serif font-bold text-stone-900 mt-1">
                ₱{payments
                  .filter(p => p.status === 'COMPLETED' && p.createdAt.startsWith('2026-11-21'))
                  .reduce((s, p) => s + p.amount, 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-stone-600 font-medium mt-1">Live Front Desk Register</div>
            </div>
            <div className="size-11 bg-[#f7f6ef] border-2 border-black text-[#14261d] flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
              <CreditCard size={20} />
            </div>
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

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input type="text" placeholder="Search guest name, ref#, transaction ref..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border-2 border-black rounded-none shadow-[2px_2px_0px_#000] focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} disabled={loading} className="p-2 bg-white text-stone-900 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setRecordModalOpen(true)}
              className="bg-[#14261d] hover:bg-[#1f382b] text-white text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5">
              <Plus size={13} /> Record Payment
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f6ef] text-stone-800 uppercase tracking-wider text-[10px] font-bold border-b-2 border-black">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Reservation Ref</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filtered.map(pay => (
                  <tr key={pay.id} className="hover:bg-[#f7f6ef]/60 transition-colors">
                    <td className="py-3.5 px-4 text-stone-700 font-mono text-[11px]">
                      {new Date(pay.createdAt).toLocaleString([], {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{pay.guestName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">{pay.referenceNumber}</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-stone-900 text-sm">₱{pay.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={methodVariant[pay.paymentMethod] as any || 'default'}>{pay.paymentMethod}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={typeVariant[pay.paymentType] as any || 'default'}>{pay.paymentType.replace('_',' ')}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600 text-[11px]">{pay.transactionRef}</td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">{pay.recordedBy}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={pay.status === 'COMPLETED' ? 'success' : 'warning'}>{pay.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="p-8 text-center text-stone-500 text-xs font-medium">No payment records found.</div>
            )}
          </div>
        </div>

        {/* Outstanding Balances Section */}
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900 mb-3">Outstanding Balances (Deposit / Remainder Due)</h3>
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] divide-y divide-black/10">
            {reservations.filter(r => r.balanceDue > 0 && r.status !== 'CANCELLED').length === 0 ? (
              <div className="p-6 text-center text-stone-500 text-xs font-medium">All reservations are fully settled.</div>
            ) : (
              reservations.filter(r => r.balanceDue > 0 && r.status !== 'CANCELLED').map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 hover:bg-[#f7f6ef]/60 transition-colors">
                  <div className="text-xs">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-stone-900">{r.referenceNumber}</span>
                      <Badge variant={r.status === 'CHECKED_IN' ? 'forest' : r.status === 'CONFIRMED' ? 'success' : 'warning'} className="text-[10px]">{r.status}</Badge>
                    </div>
                    <div className="text-stone-900 font-bold">{r.guestName} · {r.roomName}</div>
                    <div className="text-stone-600 font-medium">{r.checkInDate} → {r.checkOutDate} · ₱{r.amountPaid.toLocaleString()} paid of ₱{r.totalAmount.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-stone-500">Balance Due</div>
                      <div className="font-serif font-bold text-rose-700 text-base">₱{r.balanceDue.toLocaleString()}</div>
                    </div>
                    <button onClick={() => { setFormReservationId(r.id); handleSelectReservation(r.id); setRecordModalOpen(true) }}
                      className="bg-[#14261d] hover:bg-[#1f382b] text-white text-xs font-bold px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]">
                      Record Payment
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Record Payment Dialog */}
      <Dialog open={recordModalOpen} onClose={() => { setRecordModalOpen(false); setSelectedReservation(null) }}
        title="Record New Payment" description="Collect and record a payment for a reservation" maxWidth="md">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Reservation <span className="text-rose-600">*</span></label>
            <select value={formReservationId}
              onChange={e => handleSelectReservation(e.target.value)}
              className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none">
              <option value="">— Select Reservation —</option>
              {reservations.filter(r => r.status !== 'CANCELLED' && r.status !== 'COMPLETED').map(r => (
                <option key={r.id} value={r.id}>
                  {r.referenceNumber} · {r.guestName} · Balance: ₱{r.balanceDue.toLocaleString()}
                </option>
              ))}
            </select>
            {selectedReservation && (
              <div className="mt-2 p-3 bg-[#f7f6ef] border-2 border-black text-[11px]">
                <div className="font-serif font-bold text-stone-900 text-sm">{selectedReservation.guestName} — {selectedReservation.roomName}</div>
                <div className="text-stone-700 mt-0.5">Total: ₱{selectedReservation.totalAmount.toLocaleString()} · Paid: ₱{selectedReservation.amountPaid.toLocaleString()} · <span className="text-rose-700 font-bold">Due: ₱{selectedReservation.balanceDue.toLocaleString()}</span></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Amount (₱) <span className="text-rose-600">*</span></label>
              <input type="number" min={1} step={100} value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                className="w-full p-2 border-2 border-black bg-white text-xs font-mono font-bold focus:outline-none" />
            </div>
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Transaction Reference</label>
              <input type="text" placeholder="GCash/bank ref#..." value={formTxnRef}
                onChange={e => setFormTxnRef(e.target.value)}
                className="w-full p-2 border-2 border-black bg-white text-xs font-mono focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Payment Method <span className="text-rose-600">*</span></label>
              <select value={formMethod} onChange={e => setFormMethod(e.target.value)}
                className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none">
                <option value="CASH">Cash (at front desk)</option>
                <option value="GCASH">GCash</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Payment Type <span className="text-rose-600">*</span></label>
              <select value={formType} onChange={e => setFormType(e.target.value)}
                className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none">
                <option value="DEPOSIT">Deposit / Partial</option>
                <option value="BALANCE">Balance Settlement</option>
                <option value="FULL_PAYMENT">Full Payment</option>
                <option value="REFUND">Refund</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Notes (optional)</label>
            <input type="text" placeholder="Additional payment notes..."
              value={formNotes} onChange={e => setFormNotes(e.target.value)}
              className="w-full p-2 border-2 border-black bg-white text-xs focus:outline-none" />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t-2 border-black">
            <button onClick={() => setRecordModalOpen(false)} className="px-3 py-1.5 bg-white text-stone-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">Cancel</button>
            <button onClick={handleRecord} disabled={saving}
              className="px-4 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]">
              {saving ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
