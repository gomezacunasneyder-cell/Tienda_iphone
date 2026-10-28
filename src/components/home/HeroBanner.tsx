import { useRef, useState } from 'react'
import { ArrowRight, BadgeCheck, Truck, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Mascot } from '@/components/brand/Mascot'
import { buttonClasses } from '@/components/ui/Button'
import type { StoryVideoHandle } from '@/components/ui/StoryVideo'
import { BRAND } from '@/config/brand'
import { useScrollFrame } from '@/hooks/useScrollFrame'
import { shouldScrubVideo } from '@/lib/media'

const TRUST = [
  { icon: BadgeCheck, text: 'IMEI legal verificado' },
  { icon: Wallet, text: 'Pago contraentrega' },
  { icon: Truck, text: 'Envíos a todo Colombia' },
]

/** Separación entre el encabezado fijo y el banner mientras está fijado (px). */
const PIN_GAP = 16
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Avance del video según el scroll (solo con `BRAND.mascot.playback === 'scroll'`):
 * - Si el banner cabe en pantalla (escritorio), se queda fijo bajo el encabezado mientras se recorre un tramo
 *   extra de scroll (`.hero-track[data-pinned]::after`) y el video avanza de 0 a 1 en ese tramo.
 * - Si no cabe (celular, ventanas bajas), no se fija: el video avanza mientras el marco cruza la pantalla.
 * - Después, mientras el banner sale de pantalla, se desvanece (`--exit` de 0 a 1, ver `.hero-track .hero`).
 * Al subir, todo vuelve atrás con la misma regla. Solo se escribe en el DOM, sin volver a renderizar.
 */
function useHeroScrub(enabled: boolean) {
  const trackRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const mascotRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<StoryVideoHandle>(null)
  const layout = useRef({ pinned: false, pinTop: 0 })
  const lastExit = useRef('')

  useScrollFrame((resized) => {
    const track = trackRef.current, hero = heroRef.current, mascot = mascotRef.current
    if (!track || !hero || !mascot) return
    const vh = innerHeight
    if (resized) {
      const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0
      const pinTop = header + PIN_GAP
      const pinned = matchMedia('(min-width: 768px)').matches && pinTop + hero.offsetHeight + PIN_GAP <= vh
      layout.current = { pinned, pinTop }
      track.toggleAttribute('data-pinned', pinned)
      track.style.setProperty('--pin-top', `${pinTop}px`)
    }
    const { pinned, pinTop } = layout.current
    let p: number, exit: number
    if (pinned) {
      const r = track.getBoundingClientRect()
      const h = hero.offsetHeight
      p = (pinTop - r.top) / Math.max(1, r.height - h)
      // Cuando se suelta, el banner sube: se desvanece durante el primer 55 % de su altura.
      exit = (pinTop - (r.bottom - h)) / (h * 0.55)
    } else {
      // De cuando el marco asoma por abajo (90 % de la pantalla; o desde arriba del todo si ya se ve al cargar)
      // a cuando su borde superior llega al 25 % de la pantalla, con un recorrido mínimo de media pantalla
      // (si el marco está muy arriba, el video no se consume en un par de giros de la rueda).
      const top = mascot.getBoundingClientRect().top + scrollY
      const start = Math.max(0, top - vh * 0.9)
      const end = Math.max(start + vh * 0.5, top - vh * 0.25)
      p = (scrollY - start) / (end - start)
      exit = (scrollY - end) / (vh * 0.4)
    }
    videoRef.current?.seek(clamp01(p))
    const e = clamp01(exit).toFixed(3)
    if (e !== lastExit.current) { lastExit.current = e; track.style.setProperty('--exit', e) }
  }, enabled)

  return { trackRef, heroRef, mascotRef, videoRef }
}

/** Banner principal: mensaje comercial y acciones a la izquierda; la mascota animada a la derecha. */
export function HeroBanner() {
  // Video ligado al scroll solo en escritorio; en celulares se reproduce solo al verse (más fluido y liviano)
  const [scrub] = useState(() => BRAND.mascot.playback === 'scroll' && shouldScrubVideo())
  const { trackRef, heroRef, mascotRef, videoRef } = useHeroScrub(scrub)

  return (
    <div ref={trackRef} className="hero-track">
      <section ref={heroRef} aria-labelledby="hero-title" className="hero">
        <div className="grid items-center gap-2 px-4 pb-4 pt-8 sm:px-8 md:grid-cols-2 md:gap-6 md:py-10 lg:px-14 lg:py-12">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-ink/90 ring-1 ring-line-strong">
              <span className="size-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_var(--color-brand-500)]" />iPhone nuevos · usados · accesorios
            </p>
            <h1 id="hero-title" className="mt-5 text-[2.1rem] font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
              Tu próximo iPhone<br /><span className="text-gradient">está en {BRAND.name}</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              Equipos nuevos y usados con IMEI legal, y los accesorios para tu iPhone. Haces tu pedido aquí y coordinamos la entrega contigo por WhatsApp.
            </p>
            <ul aria-label="Por qué comprar en CeluNorte" className="mt-5 flex flex-wrap gap-2">
              {TRUST.map(({ icon: Icon, text }) => <li key={text} className="trust-pill"><Icon className="size-3.5" aria-hidden />{text}</li>)}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/catalogo" className={buttonClasses({ size: 'lg' })}>Explorar catálogo<ArrowRight className="size-4" aria-hidden /></Link>
              <Link to="/nosotros" className={buttonClasses({ size: 'lg', variant: 'outline' })}>Conoce la tienda</Link>
            </div>
          </div>
          <div ref={mascotRef}>
            <Mascot handle={videoRef} playback={scrub ? 'scroll' : 'auto'} className="mx-auto mt-4 max-w-[380px] sm:max-w-[440px] md:mt-0 md:max-w-[var(--mascot-max)]" />
          </div>
        </div>
      </section>
    </div>
  )
}
