'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const maxW = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#14261d]/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Content */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full rounded-none bg-white shadow-[6px_6px_0px_#000] border-2 border-black z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150',
          maxW
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#f7f6ef]">
          <div>
            {title && <h2 className="font-serif text-lg font-bold text-stone-900">{title}</h2>}
            {description && <p className="text-xs text-stone-600 font-medium mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-none border border-black bg-white text-stone-900 hover:bg-stone-200 transition-all shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 bg-white">{children}</div>
      </div>
    </div>
  )
}
