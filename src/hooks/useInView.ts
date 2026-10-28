import { useEffect, useRef, useState } from 'react'

/**
 * Indica si el elemento está en pantalla (`inView`) y si ya apareció alguna vez (`seen`).
 * `enabled: false` no crea el observador. Sin IntersectionObserver se considera visible.
 */
export function useInView<T extends Element>({ threshold = 0.25, rootMargin, enabled = true }: { threshold?: number; rootMargin?: string; enabled?: boolean } = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); setSeen(true); return }
    const io = new IntersectionObserver(([e]) => {
      const visible = Boolean(e?.isIntersecting)
      setInView(visible)
      if (visible) setSeen(true)
    }, { threshold, rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [enabled, threshold, rootMargin])

  return { ref, inView, seen }
}
