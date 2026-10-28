import { Headphones, LayoutGrid, List, Recycle, SlidersHorizontal, Sparkles, Users, X, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, ProductGridSkeleton } from '@/components/ui/States'
import { cn, formatCOP } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'
import { CatalogFilters, type FilterKey, type FilterOption } from '@/features/catalog/CatalogFilters'
import { inSection, minRetail, minWholesale, SECTION_LABEL, type Section } from '@/features/catalog/helpers'
import { useWholesaleAccess } from '@/features/orders/useWholesaleAccess'
import type { Product } from '@/types/domain'
import { ProductGrid } from '@/features/catalog/ProductCard'
import { useCategories, useProducts } from '@/hooks/useCatalog'
import { DEMO_MODE, isFirebaseConfigured } from '@/services/firebase'

type Sort = 'recientes' | 'precio-asc' | 'precio-desc'
const SECTIONS: Section[] = ['nuevos', 'usados', 'mayoristas', 'accesorios']
const FILTER_KEYS = ['estado', 'cat', 'capacidad', 'precio_max'] as const
const SECTION_ICON: Record<Section, LucideIcon> = { nuevos: Sparkles, usados: Recycle, mayoristas: Users, accesorios: Headphones }

const count = <T,>(items: T[], keyOf: (item: T) => string[]): Map<string, number> => {
  const m = new Map<string, number>()
  items.forEach((i) => new Set(keyOf(i)).forEach((k) => m.set(k, (m.get(k) ?? 0) + 1)))
  return m
}

export default function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const { data, isLoading, isError, refetch } = useProducts()
  const { data: categories } = useCategories()
  const { user } = useAuth()
  const { canBuy } = useWholesaleAccess()
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Panel de filtros en móvil: se cierra con Escape y bloquea el desplazamiento de la página mientras está abierto.
  useEffect(() => {
    if (!filtersOpen || window.matchMedia('(min-width: 1024px)').matches) return
    const html = document.documentElement
    html.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFiltersOpen(false) }
    addEventListener('keydown', onKey)
    return () => { html.style.overflow = ''; removeEventListener('keydown', onKey) }
  }, [filtersOpen])

  const q = params.get('q') ?? ''
  const raw = params.get('seccion')
  const section: Section | '' = SECTIONS.includes(raw as Section) ? (raw as Section) : ''
  const orden = (params.get('orden') as Sort | null) ?? 'recientes'
  const vista = params.get('vista') === 'lista' ? 'list' : 'grid'
  const wholesale = section === 'mayoristas'
  const locked = wholesale && !user
  const showEstado = section === '' || section === 'accesorios'

  const estados = params.getAll('estado')
  const cats = params.getAll('cat')
  const caps = params.getAll('capacidad')
  const precioMaxParam = Number(params.get('precio_max')) || 0

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace: true })
  }
  const toggle = (key: 'estado' | 'cat' | 'capacidad', value: string) => {
    const next = new URLSearchParams(params)
    const current = next.getAll(key)
    next.delete(key)
    ;(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]).forEach((v) => next.append(key, v))
    setParams(next, { replace: true })
  }
  const clearFilters = () => {
    const next = new URLSearchParams(params)
    FILTER_KEYS.forEach((k) => next.delete(k))
    setParams(next, { replace: true })
  }

  const priceOf = (p: Product) => (wholesale ? minWholesale(p) : minRetail(p)) ?? 0

  // Productos de la sección y la búsqueda (sin los filtros laterales): base para los contadores.
  const base = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (data ?? []).filter((p) => inSection(p, section) && (!term || `${p.name} ${p.brand}`.toLowerCase().includes(term)))
  }, [data, q, section])

  const limit = useMemo(() => {
    const top = Math.max(0, ...base.map(priceOf))
    return top ? Math.ceil(top / 100_000) * 100_000 : 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, wholesale])
  const precioMax = precioMaxParam > 0 && precioMaxParam < limit ? precioMaxParam : limit

  const results = useMemo(() => {
    const list = base.filter(
      (p) =>
        (!showEstado || !estados.length || estados.includes(p.condition)) &&
        (!cats.length || cats.includes(p.categoryId)) &&
        (!caps.length || p.variants.some((v) => v.capacity && caps.includes(v.capacity))) &&
        (precioMax >= limit || priceOf(p) <= precioMax),
    )
    if (orden === 'precio-asc') list.sort((a, b) => priceOf(a) - priceOf(b))
    if (orden === 'precio-desc') list.sort((a, b) => priceOf(b) - priceOf(a))
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, estados.join(), cats.join(), caps.join(), precioMax, limit, orden, wholesale, showEstado])

  const facets = useMemo(() => {
    const byEstado = count(base, (p) => [p.condition])
    const byCat = count(base, (p) => [p.categoryId])
    const byCap = count(base, (p) => p.variants.map((v) => v.capacity).filter((c): c is string => Boolean(c)))
    const catName = new Map((categories ?? []).map((c) => [c.id, c.name]))
    const num = (s: string) => parseInt(s, 10) || 0
    return {
      estado: [{ value: 'new', label: 'Nuevo', count: byEstado.get('new') ?? 0 }, { value: 'used', label: 'Usado', count: byEstado.get('used') ?? 0 }].filter((o) => o.count > 0) as FilterOption[],
      categorias: [...byCat].map(([value, c]) => ({ value, label: catName.get(value) ?? value, count: c })).sort((a, b) => a.label.localeCompare(b.label, 'es')) as FilterOption[],
      capacidades: [...byCap].map(([value, c]) => ({ value, label: value, count: c })).sort((a, b) => num(a.value) - num(b.value)) as FilterOption[],
    }
  }, [base, categories])

  const activeCount = (showEstado ? estados.length : 0) + cats.length + caps.length + (precioMax < limit ? 1 : 0)

  const tab = (label: string, to: string, active: boolean, Icon: LucideIcon) => (
    <Link key={to} to={to} aria-current={active ? 'page' : undefined}
      className={cn('chip gap-2 px-4', active ? 'chip-solid' : 'chip-idle')}><Icon className="size-4" aria-hidden />{label}</Link>
  )

  // Filtros activos como chips removibles (usan las mismas acciones que el panel)
  const labelOf = (opts: FilterOption[], v: string) => opts.find((o) => o.value === v)?.label ?? v
  const activeChips = [
    ...(showEstado ? estados.map((v) => ({ key: `estado-${v}`, label: labelOf(facets.estado, v), remove: () => toggle('estado', v) })) : []),
    ...cats.map((v) => ({ key: `cat-${v}`, label: labelOf(facets.categorias, v), remove: () => toggle('cat', v) })),
    ...caps.map((v) => ({ key: `cap-${v}`, label: v, remove: () => toggle('capacidad', v) })),
    ...(precioMax < limit ? [{ key: 'precio', label: `Hasta ${formatCOP(precioMax)}`, remove: () => set('precio_max', '') }] : []),
  ]

  const resetKey = (key: FilterKey) => {
    const next = new URLSearchParams(params)
    next.delete(key === 'precio' ? 'precio_max' : key)
    setParams(next, { replace: true })
  }

  // Fotos reales de la sección para el banner (las ilustraciones de prueba no se muestran)
  const bannerPhotos = base.map((p) => p.images[0]).filter((src): src is string => Boolean(src) && !src!.startsWith('data:')).slice(0, 3)
  const title = section ? SECTION_LABEL[section] : 'Catálogo'

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:pt-6">
      <section aria-labelledby="catalogo-titulo" className="catalog-hero">
        <div className="relative z-10 max-w-md py-2 sm:py-6">
          <nav aria-label="Ruta de navegación" className="breadcrumb">
            <Link to="/" className="underline underline-offset-2 transition hover:text-paper-ink">Inicio</Link>
            <span aria-hidden>—</span>
            {section ? <><Link to="/catalogo" className="underline underline-offset-2 transition hover:text-paper-ink">Catálogo</Link><span aria-hidden>—</span><span aria-current="page">{SECTION_LABEL[section]}</span></> : <span aria-current="page">Catálogo</span>}
          </nav>
          <h1 id="catalogo-titulo" className="mt-3 text-3xl font-bold tracking-tight text-paper-ink sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#4a505c] sm:text-base">iPhone nuevos y usados con IMEI legal, y accesorios para tu iPhone. Envíos a todo Colombia.</p>
          {q ? (
            <p className="mt-4 inline-flex flex-wrap items-center gap-1 rounded-full bg-white py-1 pl-3 pr-1 text-sm text-paper-ink shadow-sm">
              Resultados para “{q}”
              <Link to={section ? `/catalogo?seccion=${section}` : '/catalogo'} aria-label="Quitar búsqueda" className="grid size-7 place-items-center rounded-full text-[#4a505c] transition hover:bg-black/5"><X className="size-3.5" aria-hidden /></Link>
            </p>
          ) : null}
        </div>
        {bannerPhotos.length ? (
          <div aria-hidden className="catalog-hero-photos">
            {bannerPhotos.map((src, i) => <img key={src} src={src} alt="" loading="lazy" decoding="async" style={{ '--i': i } as CSSProperties} />)}
          </div>
        ) : null}
      </section>

      <nav aria-label="Secciones del catálogo" className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {tab('Todos', '/catalogo', section === '', LayoutGrid)}
        {SECTIONS.map((s) => tab(SECTION_LABEL[s], `/catalogo?seccion=${s}`, section === s, SECTION_ICON[s]))}
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:items-start">
        {/* En escritorio es una columna fija; en móvil, un panel inferior desplegable sobre la página */}
        <aside aria-label="Filtros" onClick={(e) => { if (e.target === e.currentTarget) setFiltersOpen(false) }}
          className={cn('lg:sticky lg:top-32 lg:block', filtersOpen ? 'max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:flex max-lg:items-end max-lg:bg-black/65 max-lg:backdrop-blur-sm' : 'max-lg:hidden')}>
          <div className="max-lg:animate-fade-up max-lg:max-h-[88dvh] max-lg:w-full max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:rounded-t-3xl max-lg:[&>.panel]:rounded-b-none">
            <CatalogFilters
              estado={showEstado ? { selected: estados, options: facets.estado } : null}
              categorias={{ selected: cats, options: facets.categorias }}
              capacidades={{ selected: caps, options: facets.capacidades }}
              precio={{ max: precioMax, limit, step: limit > 1_000_000 ? 100_000 : 10_000, format: formatCOP }}
              activeCount={activeCount} onToggle={toggle} onClear={clearFilters}
              onPrice={(v) => set('precio_max', v >= limit ? '' : String(v))}
              onReset={resetKey} onClose={() => setFiltersOpen(false)} resultCount={results.length}
            />
          </div>
        </aside>

        <div className="results-panel min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((o) => !o)}
              className={cn('chip gap-2 lg:hidden', activeCount ? 'chip-active' : 'chip-idle text-ink')}><SlidersHorizontal className="size-4" aria-hidden />Filtros{activeCount ? ` (${activeCount})` : ''}</button>
            <p className="mr-auto text-sm text-muted" aria-live="polite">Mostrando <span className="font-semibold tabular-nums text-white">{results.length}</span> de {base.length} producto{base.length === 1 ? '' : 's'}</p>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="hidden font-medium text-ink sm:inline">Ordenar por:</span>
              <select aria-label="Ordenar" value={orden} onChange={(e) => set('orden', e.target.value === 'recientes' ? '' : e.target.value)} className="control-pill h-11 rounded-lg px-3 sm:min-w-52">
                <option value="recientes">Más recientes</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
              </select>
            </label>
            <div role="group" aria-label="Vista" className="flex gap-1 rounded-lg bg-surface p-1 ring-1 ring-line">
              <button type="button" aria-label="Vista en cuadrícula" aria-pressed={vista === 'grid'} onClick={() => set('vista', '')} className={cn('seg-btn grid size-9 place-items-center rounded-lg', vista === 'grid' ? 'seg-active' : 'text-muted hover:text-ink')}><LayoutGrid className="size-4" aria-hidden /></button>
              <button type="button" aria-label="Vista en lista" aria-pressed={vista === 'list'} onClick={() => set('vista', 'lista')} className={cn('seg-btn grid size-9 place-items-center rounded-lg', vista === 'list' ? 'seg-active' : 'text-muted hover:text-ink')}><List className="size-4" aria-hidden /></button>
            </div>
          </div>

          {activeChips.length ? (
            <ul aria-label="Filtros aplicados" className="mb-4 flex flex-wrap gap-2">
              {activeChips.map((c) => (
                <li key={c.key}><button type="button" onClick={c.remove} aria-label={`Quitar filtro ${c.label}`} className="chip chip-active min-h-8 gap-1.5 px-3 text-xs">{c.label}<X className="size-3.5" aria-hidden /></button></li>
              ))}
              {activeChips.length > 1 ? <li><button type="button" onClick={clearFilters} className="min-h-8 rounded-full px-3 text-xs text-muted underline-offset-2 hover:text-ink hover:underline">Limpiar todo</button></li> : null}
            </ul>
          ) : null}

          {wholesale ? (
            <p className="mb-4 rounded-2xl bg-butter p-4 text-sm text-butter-ink ring-1 ring-yellow-400/20">
              Precios al por mayor de equipos usados. {canBuy ? 'Tu cuenta puede comprar a estos precios.' : 'Compras a estos precios después de tu primera compra entregada y pagada.'}
            </p>
          ) : null}
          {locked ? (
            <EmptyState title="Precios mayoristas solo para clientes registrados">
              <Link to="/ingresar" state={{ from: '/catalogo?seccion=mayoristas' }} className="font-medium text-brand-400 hover:underline">Ingresa o crea tu cuenta</Link> para verlos.
            </EmptyState>
          ) : !(isFirebaseConfigured || DEMO_MODE) ? (
            <EmptyState title="Firebase sin configurar">Completa tu archivo <code>.env.local</code> para cargar el catálogo.</EmptyState>
          ) : isLoading ? <ProductGridSkeleton count={6} className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3" />
            : isError ? <ErrorState onRetry={() => void refetch()} />
            : results.length === 0 ? (
              <EmptyState title="Sin resultados">
                Prueba con otros filtros o una búsqueda distinta.
                {activeCount ? <button type="button" onClick={clearFilters} className="mt-3 block w-full font-medium text-brand-400 hover:underline">Limpiar filtros</button> : null}
              </EmptyState>
            )
            : <ProductGrid products={results} mode={wholesale ? 'wholesale' : 'retail'} layout={vista} withSidebar />}
        </div>
      </div>

    </div>
  )
}
