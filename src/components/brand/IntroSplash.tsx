import { asset } from '@/lib/asset'
import { useEffect, useState, type CSSProperties } from 'react'
import { BRAND } from '@/config/brand'
import { cn } from '@/lib/utils'
import { Fireworks } from './Fireworks'

const KEY = 'celunorte:intro:v1'
const INTRO_MS = 3200
const LEAVE_MS = 700

/** Se muestra una vez por sesión del navegador y nunca con "reducir movimiento". */
function shouldShow(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(KEY) !== '1'
  } catch {
    return false
  }
}

/**
 * Animación de entrada: el logo aparece con ondas de luz, el nombre se arma letra por letra en 3D
 * y los fuegos artificiales estallan alrededor. Se salta con clic, con el botón o con Escape.
 */
export function IntroSplash() {
  const [phase, setPhase] = useState<'show' | 'leave' | 'done'>(() => (shouldShow() ? 'show' : 'done'))
  const leave = () => setPhase((p) => (p === 'show' ? 'leave' : p))

  useEffect(() => {
    if (phase !== 'show') return
    try { sessionStorage.setItem(KEY, '1') } catch { /* almacenamiento no disponible */ }
    const t = window.setTimeout(leave, INTRO_MS)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') leave() }
    addEventListener('keydown', onKey)
    return () => { window.clearTimeout(t); removeEventListener('keydown', onKey) }
  }, [phase])

  useEffect(() => {
    if (phase !== 'leave') return
    const t = window.setTimeout(() => setPhase('done'), LEAVE_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  // Bloquea el desplazamiento mientras la intro cubre la página
  const visible = phase !== 'done'
  useEffect(() => {
    if (!visible) return
    const html = document.documentElement
    html.style.overflow = 'hidden'
    return () => { html.style.overflow = '' }
  }, [visible])

  if (!visible) return null

  const letters = [...'Celu'].map((ch) => ({ ch, brand: false })).concat([...'Norte'].map((ch) => ({ ch, brand: true })))

  return (
    <div className={cn('intro', phase === 'leave' && 'intro-leave')} onClick={leave} style={{ '--intro-ms': `${INTRO_MS}ms` } as CSSProperties}>
      <Fireworks className="absolute z-[1]" durationMs={INTRO_MS - 600} />
      <div className="intro-stage" role="img" aria-label={`${BRAND.name}: ${BRAND.tagline}`}>
        <div className="intro-logo">
          <span className="intro-ripple" style={{ '--c': '#ff3b4b', '--d': '.5s' } as CSSProperties} />
          <span className="intro-ripple" style={{ '--c': '#8b5cf6', '--d': '1.1s' } as CSSProperties} />
          <span className="intro-ripple" style={{ '--c': '#22d3ee', '--d': '1.7s' } as CSSProperties} />
          <img src={asset("/brand/celunorte-logo.webp")} alt="" width={176} height={176} fetchPriority="high" className="relative" />
        </div>
        <p className="intro-word" aria-hidden>
          {letters.map((l, i) => (
            <span key={i} className={cn('intro-letter', l.brand && 'text-brand-600')} style={{ '--i': i } as CSSProperties}>{l.ch}</span>
          ))}
        </p>
        <p className="intro-tag" aria-hidden>{BRAND.tagline}</p>
      </div>
      <button type="button" className="intro-skip" onClick={(e) => { e.stopPropagation(); leave() }}>Saltar intro</button>
      <span className="intro-bar" aria-hidden />
    </div>
  )
}
