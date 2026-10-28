import { ChevronDown, X } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

export interface FilterOption { value: string; label: string; count: number }

export type FilterKey = 'estado' | 'cat' | 'capacidad' | 'precio'

interface Props {
  estado: { selected: string[]; options: FilterOption[] } | null
  categorias: { selected: string[]; options: FilterOption[] }
  capacidades: { selected: string[]; options: FilterOption[] }
  precio: { max: number; limit: number; step: number; format: (n: number) => string }
  activeCount: number
  onToggle: (key: 'estado' | 'cat' | 'capacidad', value: string) => void
  onPrice: (value: number) => void
  onClear: () => void
  /** Restablece un solo grupo de filtros. */
  onReset?: (key: FilterKey) => void
  /** Solo móvil: cierra el panel desplegable. */
  onClose?: () => void
  /** Solo móvil: cantidad de resultados para el botón "Ver productos". */
  resultCount?: number
}

/** Grupo plegable: título en mayúsculas con flecha y "Restablecer" cuando tiene algo aplicado. */
function Group({ title, active, onReset, children }: { title: string; active: boolean; onReset?: () => void; children: ReactNode }) {
  return (
    <details open className="group/f border-t border-line px-4 py-4 first:border-t-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
          {title}<ChevronDown className="size-3.5 text-muted transition-transform group-open/f:rotate-180" aria-hidden />
        </span>
        {active && onReset ? (
          <button type="button" onClick={(e) => { e.preventDefault(); onReset() }} className="text-xs text-muted underline underline-offset-2 transition hover:text-ink">Restablecer</button>
        ) : null}
      </summary>
      <fieldset className="mt-3 min-w-0">
        <legend className="sr-only">{title}</legend>
        <div className="space-y-0.5">{children}</div>
      </fieldset>
    </details>
  )
}

function Checks({ name, group, onToggle }: { name: 'estado' | 'cat' | 'capacidad'; group: { selected: string[]; options: FilterOption[] }; onToggle: Props['onToggle'] }) {
  return (
    <>
      {group.options.map((o) => (
        <label key={o.value} className="filter-option flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm text-ink/90">
          <input type="checkbox" checked={group.selected.includes(o.value)} onChange={() => onToggle(name, o.value)} className="size-[18px] shrink-0 rounded accent-[#ff3b4b]" />
          <span className="flex-1">{o.label} <span className="text-muted">({o.count})</span></span>
        </label>
      ))}
    </>
  )
}

/** Panel de filtros. El estado vive en la URL (lo maneja CatalogPage); aquí solo se presenta. */
export function CatalogFilters({ estado, categorias, capacidades, precio, activeCount, onToggle, onPrice, onClear, onReset, onClose, resultCount }: Props) {
  const fill = `${precio.limit ? (precio.max / precio.limit) * 100 : 100}%`
  return (
    <div className="panel overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <p className="text-sm font-semibold text-white">Filtros{activeCount ? <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">{activeCount}</span> : null}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onClear} disabled={!activeCount} className="rounded-full px-2.5 py-1.5 text-xs text-muted transition hover:bg-white/5 hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent">Limpiar todo</button>
          {onClose ? <button type="button" onClick={onClose} aria-label="Cerrar filtros" className="grid size-10 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-ink lg:hidden"><X className="size-5" aria-hidden /></button> : null}
        </div>
      </div>

      {estado && estado.options.length > 1 ? (
        <Group title="Estado" active={estado.selected.length > 0} onReset={onReset && (() => onReset('estado'))}><Checks name="estado" group={estado} onToggle={onToggle} /></Group>
      ) : null}
      {categorias.options.length > 1 ? (
        <Group title="Categoría" active={categorias.selected.length > 0} onReset={onReset && (() => onReset('cat'))}><Checks name="cat" group={categorias} onToggle={onToggle} /></Group>
      ) : null}
      {precio.limit > 0 ? (
        <Group title="Precio" active={precio.max < precio.limit} onReset={onReset && (() => onReset('precio'))}>
          <input type="range" min={0} max={precio.limit} step={precio.step} value={precio.max} onChange={(e) => onPrice(Number(e.target.value))}
            aria-label="Precio máximo" aria-valuetext={precio.format(precio.max)} className="range-brand my-2 w-full" style={{ '--fill': fill } as CSSProperties} />
          <p className="text-xs text-muted">Precio: $ 0 – {precio.format(precio.max)}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex h-10 w-16 shrink-0 items-center rounded-lg bg-surface px-3 text-sm text-muted ring-1 ring-line-strong">$ 0</span>
            <span className="text-muted" aria-hidden>—</span>
            {/* Se aplica al salir del campo o con Enter; key reinicia el campo cuando cambia por la barra */}
            <input key={precio.max} type="number" inputMode="numeric" min={0} max={precio.limit} step={precio.step} defaultValue={precio.max} aria-label="Precio máximo en pesos"
              onBlur={(e) => { const v = Number(e.currentTarget.value); if (Number.isFinite(v) && v !== precio.max) onPrice(Math.min(Math.max(v, 0), precio.limit)) }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
              className="h-10 min-w-0 flex-1 rounded-lg bg-surface px-3 text-sm tabular-nums text-ink ring-1 ring-line-strong focus:outline-none focus:ring-brand-500/60" />
          </div>
        </Group>
      ) : null}
      {capacidades.options.length > 1 ? (
        <Group title="Capacidad" active={capacidades.selected.length > 0} onReset={onReset && (() => onReset('capacidad'))}><Checks name="capacidad" group={capacidades} onToggle={onToggle} /></Group>
      ) : null}

      {onClose && resultCount !== undefined ? (
        <div className="sticky bottom-0 border-t border-line bg-card/95 p-4 backdrop-blur lg:hidden">
          <Button size="lg" className="w-full" onClick={onClose}>Ver {resultCount} producto{resultCount === 1 ? '' : 's'}</Button>
        </div>
      ) : null}
    </div>
  )
}
