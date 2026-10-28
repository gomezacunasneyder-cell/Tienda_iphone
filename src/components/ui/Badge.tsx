import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Etiquetas discretas: base carbón translúcida (legible también sobre fotos) con tinta clara y un filo del mismo tono. */
const tones = {
  neutral: 'bg-[#0d0d11]/80 text-ink ring-1 ring-white/12 backdrop-blur-md',
  brand: 'bg-[#2b0c12]/85 text-rose-ink ring-1 ring-brand-500/40 backdrop-blur-md',
  used: 'bg-[#08202a]/85 text-sky-ink ring-1 ring-cyan/35 backdrop-blur-md',
  success: 'bg-[#0a2219]/85 text-mint-ink ring-1 ring-emerald-400/30 backdrop-blur-md',
  warning: 'bg-[#2a2208]/85 text-butter-ink ring-1 ring-yellow-400/30 backdrop-blur-md',
  danger: 'bg-[#2b0b0e]/85 text-red-300 ring-1 ring-red-400/40 backdrop-blur-md',
}

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide', tones[tone])}>{children}</span>
}
