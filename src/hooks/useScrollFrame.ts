import { useEffect, useRef } from 'react'

/**
 * Llama a `onFrame` como máximo una vez por cuadro mientras se hace scroll o cambia el tamaño de la ventana,
 * y una vez al montar. `resized` indica si el llamado viene de un cambio de tamaño (para volver a medir).
 */
export function useScrollFrame(onFrame: (resized: boolean) => void, enabled = true) {
  const cb = useRef(onFrame)
  useEffect(() => { cb.current = onFrame })

  useEffect(() => {
    if (!enabled) return
    let raf = 0
    let resized = true
    const schedule = (isResize: boolean) => () => {
      resized ||= isResize
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; cb.current(resized); resized = false })
    }
    const onScroll = schedule(false)
    const onResize = schedule(true)
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onResize)
    onResize()
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); removeEventListener('resize', onResize) }
  }, [enabled])
}
