import { AlertTriangle, PackageSearch } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-line-strong border-t-brand-500" />
      <span className="text-sm">{label}…</span>
    </div>
  )
}

/** Cuadrícula de tarjetas vacías con brillo: mantiene el espacio mientras llega el catálogo (sin saltos de diseño). */
export function ProductGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div role="status" aria-label="Cargando productos" className={className ?? 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4'}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="skeleton aspect-[4/5]" />
          <div className="space-y-2.5 p-3.5 sm:p-4">
            <div className="skeleton h-3.5 w-4/5 rounded-full" />
            <div className="skeleton h-3 w-1/2 rounded-full" />
            <div className="skeleton mt-4 h-5 w-2/5 rounded-full" />
            <div className="skeleton h-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-surface ring-1 ring-line"><PackageSearch className="size-8 text-muted" aria-hidden /></span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children ? <div className="max-w-sm text-sm text-muted">{children}</div> : null}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="size-10 text-amber-400" aria-hidden />
      <h2 className="text-lg font-semibold">No pudimos cargar la información</h2>
      <p className="max-w-sm text-sm text-muted">{message ?? 'Revisa tu conexión e inténtalo de nuevo.'}</p>
      {onRetry ? <Button variant="outline" onClick={onRetry}>Reintentar</Button> : null}
    </div>
  )
}
