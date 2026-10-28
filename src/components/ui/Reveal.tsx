import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Aparece suavemente (sube y se aclara) cuando entra en pantalla. Una sola vez.
 * Usa IntersectionObserver y, como respaldo, revisa la posición al hacer scroll o cambiar el tamaño:
 * el contenido nunca debe quedarse oculto aunque el observador no avise.
 */
export function Reveal({ as: Tag = 'div', delay = 0, className, children }: { as?: ElementType; delay?: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let io: IntersectionObserver | undefined
    const show = () => { el.classList.add('is-visible'); cleanup() }
    const check = () => { const r = el.getBoundingClientRect(); if (r.top < innerHeight - 40 && r.bottom > 0) show() }
    const cleanup = () => { io?.disconnect(); removeEventListener('scroll', check); removeEventListener('resize', check) }
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) show() }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
      io.observe(el)
    }
    addEventListener('scroll', check, { passive: true })
    addEventListener('resize', check)
    check()
    return cleanup
  }, [])
  return <Tag ref={ref} className={cn('reveal', className)} style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}>{children}</Tag>
}
