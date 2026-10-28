import { useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import { ChevronsDown, RotateCcw } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { shouldAutoplayMedia, type VideoSource } from '@/lib/media'
import { cn } from '@/lib/utils'

/** Control del video en modo `scroll`: quien lo usa decide el avance (0 = inicio, 1 = final). */
export interface StoryVideoHandle { seek: (progress: number) => void }

export interface StoryVideoProps {
  /** En orden de preferencia. */
  sources: readonly VideoSource[]
  /** Imagen fija: se muestra mientras carga el video y cuando no se reproduce. */
  poster: string
  /** Imagen de respaldo si el póster no existe. */
  fallback?: string
  alt: string
  /** Proporción del marco; el video debería venir recortado con la misma proporción. */
  ratio?: string
  /**
   * - `auto`: se reproduce solo al entrar en pantalla.
   * - `scroll`: avanza y retrocede según `handle.seek()`. El video debe tener todos los cuadros como
   *   fotogramas clave (ver README), o al retroceder se verá a saltos.
   */
  playback?: 'auto' | 'scroll'
  /** Cuadros por segundo del video; en modo `scroll` se busca siempre un cuadro exacto. */
  fps?: number
  handle?: Ref<StoryVideoHandle>
  loop?: boolean
  /** Texto o marca sobre la esquina inferior izquierda del video. */
  caption?: ReactNode
  /** Decoración alrededor del marco (halos, etiquetas). Puede reaccionar a `.story[data-ended]` desde CSS. */
  children?: ReactNode
  className?: string
}

/**
 * Suavizado del avance en modo `scroll` (ms): en este tiempo se recorre ~63 % de la distancia que falta.
 * Bajo = responde al instante; alto = más "flotante".
 */
const SMOOTH_MS = 55

/**
 * Video vertical tipo "historia": marco con borde neón, barra de progreso y destello al llegar al final.
 * - El póster ocupa el espacio desde el inicio (sin saltos de diseño); el video se monta la primera vez que entra
 *   en pantalla y aparece con un fundido cuando tiene imagen.
 * - En modo `auto` se pausa fuera de pantalla y, sin bucle, vuelve a empezar al regresar; muestra "Ver de nuevo".
 * - Si ninguna fuente funciona, se queda el póster; si el póster falla, se usa `fallback`.
 */
export function StoryVideo({ sources, poster, fallback, alt, ratio = '3 / 4', playback = 'auto', fps = 24, handle, loop = false, caption, children, className }: StoryVideoProps) {
  const scroll = playback === 'scroll'
  const [wantVideo] = useState(shouldAutoplayMedia)
  const { ref: wrapRef, inView, seen } = useInView<HTMLDivElement>()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [posterSrc, setPosterSrc] = useState(poster)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [failed, setFailed] = useState(false)
  const showVideo = wantVideo && seen && !failed

  // ---- Modo scroll ----
  // El avance pedido se persigue con un suavizado basado en tiempo (igual en pantallas de 60 o 120 Hz).
  // Todo se escribe directo en el DOM: nada de esto vuelve a renderizar React.
  const scrub = useRef({ target: 0, shown: 0, raf: 0, last: 0, frame: -1 })

  useImperativeHandle(handle, () => ({
    seek: (progress) => {
      const s = scrub.current
      s.target = Math.min(1, Math.max(0, progress))
      if (!s.raf) { s.last = performance.now(); s.raf = requestAnimationFrame(step) }
    },
  }))

  function step(now: number) {
    const s = scrub.current
    s.raf = 0
    const dt = Math.min(64, now - s.last)
    s.last = now
    const diff = s.target - s.shown
    s.shown = Math.abs(diff) < 0.0005 ? s.target : s.shown + diff * (1 - Math.exp(-dt / SMOOTH_MS))
    const el = wrapRef.current
    el?.style.setProperty('--p', s.shown.toFixed(4))
    el?.toggleAttribute('data-ended', s.shown > 0.985)
    applyFrame()
    if (s.shown !== s.target) s.raf = requestAnimationFrame(step)
  }

  /**
   * Lleva el video al cuadro que corresponde. Solo busca si el cuadro cambió, y si el navegador sigue buscando
   * el anterior no encola otra búsqueda: `onSeeked` vuelve a llamar aquí apenas termina.
   */
  function applyFrame() {
    const v = videoRef.current
    if (!v?.duration || v.seeking) return
    const total = Math.max(1, Math.round(v.duration * fps) - 1)
    const frame = Math.round(scrub.current.shown * total)
    if (frame === scrub.current.frame) return
    scrub.current.frame = frame
    v.currentTime = (frame + 0.5) / fps
  }

  useEffect(() => () => cancelAnimationFrame(scrub.current.raf), [])

  // ---- Modo auto: reproduce solo mientras se ve ----
  useEffect(() => {
    const v = videoRef.current
    if (!v || scroll) return
    if (inView) {
      if (v.ended) { v.currentTime = 0; setEnded(false) }
      v.play().catch(() => { /* reproducción automática bloqueada: se queda el póster */ })
    } else v.pause()
  }, [inView, showVideo, scroll])

  // Barra de progreso fluida en modo auto: se escribe directo en una variable CSS, sin volver a renderizar.
  useEffect(() => {
    const v = videoRef.current
    const el = wrapRef.current
    if (!v || !el || !playing) return
    let raf = 0
    const tick = () => {
      if (v.duration) el.style.setProperty('--p', String(v.currentTime / v.duration))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, wrapRef])

  const replay = () => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    setEnded(false)
    v.play().catch(() => {})
  }

  const onLoaded = () => {
    setReady(true)
    if (!scroll) return
    // iOS no decodifica cuadros de un video que nunca se reprodujo: se reproduce y pausa una vez para habilitarlo.
    const v = videoRef.current
    v?.play().then(() => { v.pause(); scrub.current.frame = -1; applyFrame() }).catch(() => applyFrame())
  }

  return (
    <div ref={wrapRef} data-ended={ended || undefined} data-offscreen={!inView || undefined} className={cn('story', className)} style={{ '--story-ratio': ratio } as CSSProperties}>
      {children}
      <div className="story-frame">
        <div className="story-screen">
          <img
            src={posterSrc} alt={alt} decoding="async" fetchPriority="high"
            onError={() => fallback && setPosterSrc((s) => (s === fallback ? s : fallback))}
            className="story-media"
          />
          {showVideo ? (
            <video
              ref={videoRef} muted playsInline autoPlay={!scroll} loop={loop && !scroll} preload="auto" disablePictureInPicture aria-hidden
              onLoadedData={onLoaded} onSeeked={scroll ? applyFrame : undefined}
              onPlaying={() => { if (!scroll) { setPlaying(true); setEnded(false) } }} onPause={() => setPlaying(false)}
              onEnded={() => { if (!scroll) { setPlaying(false); setEnded(true) } }}
              className={cn('story-media story-video', ready && 'is-ready')}
            >
              {/* El error de un <source> no llega al <video>: se escucha en la última fuente. */}
              {sources.map((s, i) => <source key={s.src} src={s.src} type={s.type} onError={i === sources.length - 1 ? () => setFailed(true) : undefined} />)}
            </video>
          ) : null}
          <span aria-hidden className="story-shade" />
          {showVideo ? <span aria-hidden className="story-progress"><span /></span> : null}
          <span aria-hidden className="story-flash" />
          {caption ? <span aria-hidden className="story-caption">{caption}</span> : null}
          {showVideo && scroll ? <span aria-hidden className="story-hint"><ChevronsDown className="size-4" />Desliza</span> : null}
          {showVideo && !scroll ? (
            <button type="button" onClick={replay} className="story-replay" tabIndex={ended ? 0 : -1} aria-hidden={!ended}>
              <RotateCcw className="size-3.5" aria-hidden />Ver de nuevo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
