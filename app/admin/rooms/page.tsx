'use client'

import React, { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/Header'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import {
  BedDouble,
  Plus,
  Edit2,
  Trash2,
  Users,
  Sparkles,
  Check,
  AlertCircle,
  Tag,
  Percent,
} from 'lucide-react'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('ROOM')
  const [formDesc, setFormDesc] = useState('')
  const [formCapacity, setFormCapacity] = useState(4)
  const [formPrice, setFormPrice] = useState(4500)
  const [formSeasonal, setFormSeasonal] = useState(1.0)
  const [formStatus, setFormStatus] = useState('AVAILABLE')
  const [formAmenities, setFormAmenities] = useState('')
  const [formPhoto, setFormPhoto] = useState('')

  useEffect(() => {
    loadRooms()
  }, [])

  async function loadRooms() {
    setLoading(true)
    try {
      const res = await fetch('/api/rooms')
      const data = await res.json()
      if (data.rooms) setRooms(data.rooms)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setCurrentRoom(null)
    setFormName('')
    setFormType('ROOM')
    setFormDesc('')
    setFormCapacity(4)
    setFormPrice(4500)
    setFormSeasonal(1.0)
    setFormStatus('AVAILABLE')
    setFormAmenities('Air Conditioning, Ensuite Bathroom, Free WiFi, Pool Access')
    setFormPhoto('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80')
    setEditModalOpen(true)
  }

  function openEditModal(room: any) {
    setCurrentRoom(room)
    setFormName(room.name)
    setFormType(room.type)
    setFormDesc(room.description || '')
    setFormCapacity(room.capacity)
    setFormPrice(room.basePrice)
    setFormSeasonal(room.seasonalMultiplier || 1.0)
    setFormStatus(room.status)
    setFormAmenities((room.amenities || []).join(', '))
    setFormPhoto(room.photos?.[0] || '')
    setEditModalOpen(true)
  }

  async function handleSave() {
    if (!formName || !formPrice || !formCapacity) {
      alert('Please fill in name, price, and capacity.')
      return
    }

    setSaving(true)
    try {
      const amenitiesArr = formAmenities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const payload = {
        name: formName,
        type: formType,
        description: formDesc,
        capacity: Number(formCapacity),
        basePrice: Number(formPrice),
        seasonalMultiplier: Number(formSeasonal),
        status: formStatus,
        amenities: amenitiesArr,
        photos: [formPhoto || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
      }

      if (currentRoom) {
        // Update
        const res = await fetch(`/api/rooms/${currentRoom.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          setEditModalOpen(false)
          await loadRooms()
        } else {
          alert(data.error || 'Failed to update')
        }
      } else {
        // Create
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          setEditModalOpen(false)
          await loadRooms()
        } else {
          alert(data.error || 'Failed to create')
        }
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove accommodation ${name}?`)) return
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        await loadRooms()
      } else {
        alert(data.error || 'Failed to delete')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f7f6ef]">
      <DashboardHeader
        title="Accommodations & Facilities"
        subtitle="Manage rooms, native cottages, lakefront gazebos, pricing, and 12-hour rates"
      />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Active Resort Inventory ({rooms.length})
            </h2>
            <p className="text-xs text-stone-600 font-medium">
              Control availability, seasonal price multipliers, and max guest capacities (Strictly 12 Hours)
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#14261d] hover:bg-[#1f382b] text-white text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 transition-all"
          >
            <Plus size={14} /> Add Accommodation
          </button>
        </div>

        {/* Accommodation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const effectivePrice = Math.round(room.basePrice * (room.seasonalMultiplier || 1.0))
            return (
              <div key={room.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col overflow-hidden">
                <div
                  className="h-44 bg-stone-200 bg-cover bg-center relative border-b-2 border-black"
                  style={{
                    backgroundImage: `url(${
                      room.photos?.[0] ||
                      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
                    })`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge variant="forest" className="text-[10px]">
                      {room.type}
                    </Badge>
                    <Badge
                      variant={room.status === 'AVAILABLE' ? 'success' : 'danger'}
                      className="text-[10px]"
                    >
                      {room.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                    <div>
                      <span className="text-[11px] text-stone-200 flex items-center gap-1 font-semibold">
                        <Users size={12} /> Up to {room.capacity} pax
                      </span>
                      <h3 className="font-serif font-bold text-lg text-white drop-shadow-sm">{room.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5">
                    {(room.amenities || []).slice(0, 4).map((am: string) => (
                      <span
                        key={am}
                        className="text-[10px] bg-[#f7f6ef] text-stone-800 border border-black/30 px-2 py-0.5 font-bold"
                      >
                        ✓ {am}
                      </span>
                    ))}
                    {(room.amenities || []).length > 4 && (
                      <span className="text-[10px] text-stone-500 font-bold self-center">
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Pricing Details */}
                  <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between">
                    <div>
                      <div className="text-stone-500 text-[9px] uppercase font-bold tracking-wider">
                        12 Hours Rate
                      </div>
                      <div className="font-serif text-stone-900 font-bold text-lg">
                        ₱{room.basePrice.toLocaleString()}
                      </div>
                      {room.seasonalMultiplier !== 1.0 && (
                        <span className="text-[10px] text-amber-800 font-bold">
                          Seasonal rate: ₱{effectivePrice.toLocaleString()} ({room.seasonalMultiplier}x)
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEditModal(room)}
                        className="px-2.5 py-1 text-xs font-bold bg-[#f7f6ef] hover:bg-white text-stone-900 border-2 border-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id, room.name)}
                        className="p-1 text-rose-700 hover:bg-rose-100 border-2 border-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Add / Edit Room Dialog */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={currentRoom ? `Edit ${currentRoom.name}` : 'New Accommodation / Facility'}
        description="Configure unit details, capacity, 12-hour pricing and multipliers"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Accommodation Name</label>
              <input
                type="text"
                placeholder="e.g. Deluxe Room 14"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Category Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none"
              >
                <option value="ROOM">Room / Villa (12 Hours)</option>
                <option value="COTTAGE">Gazebo / Cottage</option>
                <option value="PACKAGE">Event Place / Pavilion</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Highlight views, amenities, location in resort..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Max Guests (Pax)</label>
              <input
                type="number"
                min={1}
                max={300}
                value={formCapacity}
                onChange={(e) => setFormCapacity(Number(e.target.value))}
                className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">12-Hour Rate (PHP)</label>
              <input
                type="number"
                min={0}
                step={100}
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Seasonal Multiplier</label>
              <select
                value={formSeasonal}
                onChange={(e) => setFormSeasonal(Number(e.target.value))}
                className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none"
              >
                <option value={1.0}>1.0x (Standard Rate)</option>
                <option value={1.15}>1.15x (Peak Weekend)</option>
                <option value={1.25}>1.25x (Holiday Peak)</option>
                <option value={0.9}>0.9x (Weekday Promo)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none"
              >
                <option value="AVAILABLE">AVAILABLE (Open for bookings)</option>
                <option value="MAINTENANCE">MAINTENANCE (Blocked from reservations)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">Photo URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={formPhoto}
                onChange={(e) => setFormPhoto(e.target.value)}
                className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-900 uppercase text-[10px] mb-1">
              Amenities (comma separated)
            </label>
            <input
              type="text"
              placeholder="Air Conditioning, Ensuite Bathroom, Free WiFi, Swimming Pool Access"
              value={formAmenities}
              onChange={(e) => setFormAmenities(e.target.value)}
              className="w-full p-2 border-2 border-black bg-white text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t-2 border-black">
            <button
              onClick={() => setEditModalOpen(false)}
              className="px-3 py-1.5 bg-white text-stone-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-[#14261d] hover:bg-[#1f382b] text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000]"
            >
              {saving ? 'Saving...' : 'Save Accommodation'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
