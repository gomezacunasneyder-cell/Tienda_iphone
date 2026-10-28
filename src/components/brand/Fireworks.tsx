import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/** Rojo de marca con reflejos coral, cian, violeta y azul eléctrico sobre el fondo carbón. */
const PASTELS = ['#ff3b4b', '#ff6f61', '#22d3ee', '#8b5cf6', '#3d7bff', '#ffffff']

interface Rocket { x: number; y: number; vx: number; vy: number; ty: number; color: string }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; decay: number; color: string; size: number; drag: number; gravity: number; twinkle: boolean }

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)]!
/** Gravedad del cohete: alta, para que suba rápido y frene justo al llegar (estalla en ~0,7 s). */
const ROCKET_G = 0.5
const TRAIL = 30

/**
 * Fuegos artificiales en canvas (sin dependencias): cohetes con estela que suben y estallan en
 * anillos, peonías o sauces. Lanza durante `durationMs` y se detiene solo al apagarse la última chispa.
 * Respeta "reducir movimiento" (no dibuja nada y llama a onDone de inmediato).
 */
export function Fireworks({ onDone, durationMs = 2600, className }: { onDone?: () => void; durationMs?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onDone?.(); return }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize(); addEventListener('resize', resize)

    const rockets: Rocket[] = []
    let sparks: Spark[] = []

    const launch = () => {
      const x = w * (0.15 + Math.random() * 0.7)
      const ty = h * (0.14 + Math.random() * 0.34)
      // Velocidad justa para que el punto más alto de la trayectoria sea el objetivo
      rockets.push({ x, y: h + 8, vx: (Math.random() - 0.5) * 1.6, vy: -Math.sqrt(2 * ROCKET_G * (h + 8 - ty)), ty, color: pick(PASTELS) })
    }

    const explode = (r: Rocket) => {
      const kind = pick(['peony', 'ring', 'willow', 'peony'] as const)
      const second = pick(PASTELS)
      const n = kind === 'ring' ? 56 : 80
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.08
        const speed = kind === 'ring' ? 5 : (1.4 + Math.random() * 4.6) * (kind === 'willow' ? 0.8 : 1)
        sparks.push({
          x: r.x, y: r.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
          life: 1, decay: kind === 'willow' ? 0.008 : 0.014 + Math.random() * 0.006,
          color: i % 3 === 0 ? second : r.color, size: kind === 'ring' ? 2.6 : 2.2,
          drag: kind === 'willow' ? 0.975 : 0.965, gravity: kind === 'willow' ? 0.05 : 0.03, twinkle: Math.random() < 0.25,
        })
      }
    }

    let raf = 0, last = performance.now(), nextLaunch = last
    const start = last
    /** Avanza la física `dt` fotogramas de 60 Hz. */
    const step = (dt: number) => {
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]!
        r.x += r.vx * dt; r.y += r.vy * dt; r.vy += ROCKET_G * dt
        if (r.y <= r.ty || r.vy >= -1) { explode(r); rockets.splice(i, 1) }
      }
      for (const s of sparks) {
        s.vx *= Math.pow(s.drag, dt); s.vy = s.vy * Math.pow(s.drag, dt) + s.gravity * dt
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= s.decay * dt
      }
      sparks = sparks.filter((s) => s.life > 0)
    }

    const frame = (t: number) => {
      // Tiempo real aunque el navegador pierda fotogramas: subpasos de ≤1,5 fotogramas (máx. ~130 ms por cuadro)
      const elapsed = Math.min((t - last) / 16.67, 8); last = t
      const steps = Math.max(1, Math.ceil(elapsed / 1.5))
      for (let k = 0; k < steps; k++) step(elapsed / steps)
      if (t - start < durationMs && t >= nextLaunch) { launch(); nextLaunch = t + 260 + Math.random() * 260 }

      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      for (const r of rockets) {
        // Estela de largo fijo en sentido contrario al movimiento, con degradado que se apaga
        const speed = Math.hypot(r.vx, r.vy) || 1
        const tx = r.x - (r.vx / speed) * TRAIL, ty = r.y - (r.vy / speed) * TRAIL
        const g = ctx.createLinearGradient(r.x, r.y, tx, ty)
        g.addColorStop(0, r.color); g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.strokeStyle = g; ctx.lineWidth = 2.4; ctx.globalAlpha = 1
        ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(tx, ty); ctx.stroke()
      }
      for (const s of sparks) {
        const alpha = Math.max(s.life, 0) * (s.twinkle && Math.random() < 0.3 ? 0.35 : 1)
        // Chispa como trazo corto en la dirección del movimiento: se ve "moderna", no como puntos
        ctx.globalAlpha = alpha; ctx.strokeStyle = s.color; ctx.lineWidth = s.size
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 3.2, s.y - s.vy * 3.2); ctx.stroke()
      }
      ctx.globalAlpha = 1
      if (t - start < durationMs || rockets.length || sparks.length) raf = requestAnimationFrame(frame); else onDone?.()
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [onDone, durationMs])

  return <canvas ref={ref} aria-hidden className={cn('pointer-events-none fixed inset-0 z-50 size-full', className)} />
}
