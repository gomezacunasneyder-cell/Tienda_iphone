import { cn } from '@/lib/utils'

/** Nombre de marca como en el logo: "Celu" en blanco y "Norte" en rojo. Texto real (nítido y accesible). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-extrabold tracking-tight text-ink', className)}>
      Celu<span className="text-brand-500">Norte</span>
    </span>
  )
}
