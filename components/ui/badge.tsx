import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gold' | 'forest'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-stone-100 text-stone-900 border-black',
    success: 'bg-emerald-100 text-emerald-950 border-black',
    warning: 'bg-amber-100 text-amber-950 border-black',
    danger: 'bg-rose-100 text-rose-950 border-black',
    info: 'bg-sky-100 text-sky-950 border-black',
    outline: 'border-black text-stone-900 bg-white',
    gold: 'bg-amber-200 text-amber-950 border-black',
    forest: 'bg-[#14261d] text-white border-black',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border shadow-[1.5px_1.5px_0px_#000] transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
