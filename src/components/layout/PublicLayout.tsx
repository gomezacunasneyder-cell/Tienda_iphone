import { asset } from '@/lib/asset'
import { ChevronDown, Headphones, LayoutGrid, MapPin, Menu, MessageCircle, Recycle, Search, ShieldCheck, ShoppingCart, Smartphone, Truck, User, Users, X, type LucideIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { IntroSplash } from '@/components/brand/IntroSplash'
import { CartToast } from '@/components/layout/CartToast'
import { Wordmark } from '@/components/brand/Wordmark'
import { BRAND } from '@/config/brand'
import { useAuth } from '@/features/auth/AuthContext'
import { useCart } from '@/features/cart/CartContext'
import { SECTION_LABEL, type Section } from '@/features/catalog/helpers'
import { cn, formatCOP } from '@/lib/utils'
import { DEMO_MODE } from '@/services/firebase'

/** Páginas informativas (barra superior en escritorio y menú en móvil). */
const infoNav = [
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/pagos', label: 'Pagos' },
  { to: '/contacto', label: 'Contacto' },
]

/** Categorías del catálogo (fila de categorías del encabezado). */
const categoryNav: NavItem[] = [
  { to: '/catalogo?seccion=nuevos', label: 'iPhone nuevos', icon: Smartphone },
  { to: '/catalogo?seccion=usados', label: 'iPhone usados', icon: Recycle },
  { to: '/catalogo?seccion=accesorios', label: 'Accesorios', icon: Headphones },
  { to: '/catalogo?seccion=mayoristas', label: 'Al por mayor', icon: Users },
  { to: '/catalogo', label: 'Todo el catálogo', icon: LayoutGrid },
]

/** Navegación móvil (menú desplegable). */
const mobileNav: NavItem[] = [
  { to: '/', label: 'Inicio', end: true },
  ...categoryNav,
  ...infoNav,
]

const SEARCH_SECTIONS: Section[] = ['nuevos', 'usados', 'accesorios', 'mayoristas']

type NavItem = { to: string; label: string; end?: boolean; icon?: LucideIcon }

/** Activo = misma ruta y, para los atajos de sección, mismo parámetro `seccion`. */
function useIsActive() {
  const { pathname, search } = useLocation()
  return (item: NavItem) => {
    const [path, query = ''] = item.to.split('?')
    if (path === '/catalogo' && pathname === '/catalogo') return query ? search.includes(query) : !search.includes('seccion=')
    return item.end ? pathname === path : pathname === path
  }
}

/**
 * Buscador: lleva al catálogo con `?q=` y, si se elige, `?seccion=`.
 * Si sigues en la misma sección del catálogo se conservan los demás filtros.
 */
function HeaderSearch({ className, withCategory }: { className?: string; withCategory?: boolean }) {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const onCatalog = pathname === '/catalogo'
  const currentParams = new URLSearchParams(onCatalog ? search : '')
  const current = currentParams.get('q') ?? ''
  const currentSection = currentParams.get('seccion') ?? ''
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const term = String(form.get('q') ?? '').trim()
    const section = withCategory ? String(form.get('seccion') ?? '') : currentSection
    const next = section === currentSection ? new URLSearchParams(currentParams) : new URLSearchParams()
    if (section) next.set('seccion', section); else next.delete('seccion')
    if (term) next.set('q', term); else next.delete('q')
    const qs = next.toString()
    void navigate(`/catalogo${qs ? `?${qs}` : ''}`)
  }
  return (
    <form role="search" onSubmit={onSubmit} key={`${current}|${currentSection}`}
      className={cn('flex h-11 items-center rounded-full bg-surface pl-4 pr-1 ring-1 ring-line-strong transition focus-within:ring-brand-500/60', className)}>
      <input name="q" type="search" defaultValue={current} aria-label="Buscar productos" placeholder="Buscar productos"
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none" />
      {withCategory ? (
        <label className="relative flex h-6 items-center border-l border-line-strong pl-3 pr-2">
          <span className="sr-only">Categoría</span>
          <select name="seccion" defaultValue={currentSection} className="h-full cursor-pointer appearance-none bg-transparent pr-6 text-sm text-ink/85 focus:outline-none">
            <option value="">Todas las categorías</option>
            {SEARCH_SECTIONS.map((s) => <option key={s} value={s}>{SECTION_LABEL[s]}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 size-4 text-muted" aria-hidden />
        </label>
      ) : null}
      <button type="submit" aria-label="Buscar" className="ml-1 grid size-9 shrink-0 place-items-center rounded-full bg-[#121418] text-white transition hover:bg-brand-600">
        <Search className="size-4" aria-hidden />
      </button>
    </form>
  )
}

export function PublicLayout() {
  const { user, role } = useAuth()
  const { count, subtotal } = useCart()
  const isActive = useIsActive()
  const { pathname, search } = useLocation()
  const [menuFor, setMenuFor] = useState<string | null>(null)
  // El menú móvil se cierra solo al cambiar de página
  const menuOpen = menuFor === pathname + search
  const accountLabel = role ? 'Panel' : user ? 'Mi cuenta' : 'Ingresar'
  const whatsapp = BRAND.whatsappNumber ? `https://wa.me/${BRAND.whatsappNumber}` : undefined

  return (
    <div className="flex min-h-dvh flex-col">
      <IntroSplash />
      <CartToast />
      {DEMO_MODE ? <p className="bg-amber-400/10 px-4 py-1.5 text-center text-xs font-medium text-amber-200 ring-1 ring-amber-400/20">Vista previa del diseño: los productos y pedidos son de prueba y no se guardan.</p> : null}

      {/* Barra de servicio */}
      <div className="hidden border-b border-line bg-[#191c21] md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs text-muted">
          <ul className="flex items-center gap-5">
            <li className="flex items-center gap-1.5"><Truck className="size-3.5" aria-hidden />Envíos a todo Colombia</li>
            <li className="flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden />{BRAND.pickup}</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" aria-hidden />IMEI legal verificado</li>
          </ul>
          <nav aria-label="Información" className="flex items-center gap-5">
            {infoNav.map((n) => <NavLink key={n.to} to={n.to} className={({ isActive: a }) => cn('transition hover:text-ink', a && 'text-ink')}>{n.label}</NavLink>)}
          </nav>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 lg:h-[72px] lg:gap-6">
          <Link to="/" aria-label={`${BRAND.name}, inicio`} className="flex shrink-0 items-center gap-2.5">
            <img src={asset("/brand/mark-96.webp")} alt="" width={44} height={44} className="size-10 rounded-full ring-2 ring-brand-500/60" />
            <span className="leading-none">
              <Wordmark className="block text-xl sm:text-2xl" />
              <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted xl:block">{BRAND.tagline}</span>
            </span>
          </Link>

          <HeaderSearch withCategory className="hidden flex-1 lg:flex lg:max-w-2xl" />

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noreferrer" className="mr-2 hidden items-center gap-2.5 xl:flex">
                <MessageCircle className="size-5 text-brand-500" aria-hidden />
                <span className="leading-tight"><span className="block text-[11px] text-muted">¿Necesitas ayuda?</span><span className="text-sm font-semibold text-ink">Escríbenos por WhatsApp</span></span>
              </a>
            ) : null}
            {user && !role ? <Link to="/mis-pedidos" className="hidden rounded-full px-3 py-2 text-sm text-ink/85 transition hover:bg-white/5 hover:text-ink xl:block">Mis pedidos</Link> : null}
            <Link to={role ? '/admin' : user ? '/mis-pedidos' : '/ingresar'} aria-label={accountLabel}
              className="inline-flex h-10 items-center gap-2 rounded-full px-2.5 text-sm text-ink/90 transition hover:bg-white/5 hover:text-ink sm:px-3">
              <User className="size-5" aria-hidden /><span className="sr-only sm:not-sr-only">{accountLabel}</span>
            </Link>
            <Link to="/carrito" aria-label={`Carrito, ${count} productos`} className="inline-flex h-10 items-center gap-2 rounded-full px-2.5 text-sm transition hover:bg-white/5 sm:px-3">
              <span data-cart-target className="relative grid place-items-center">
                <ShoppingCart className="size-5" aria-hidden />
                {count > 0 ? <span key={count} className="cart-count absolute -right-2.5 -top-2.5 grid min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold leading-[18px] text-white">{count}</span> : null}
              </span>
              <span className="price hidden font-semibold text-ink sm:inline">{formatCOP(subtotal)}</span>
            </Link>
          </div>
        </div>

        {/* Móvil y tableta: menú y buscador */}
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-3 lg:hidden">
          <button type="button" aria-expanded={menuOpen} aria-controls="menu-movil" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuFor(menuOpen ? null : pathname + search)}
            className="grid size-11 shrink-0 place-items-center rounded-full text-ink ring-1 ring-line-strong transition hover:bg-white/5">
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
          <HeaderSearch className="flex-1" />
        </div>
        {menuOpen ? (
          <nav id="menu-movil" aria-label="Menú" className="animate-fade-up border-t border-line bg-card px-4 py-3 lg:hidden">
            <ul className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
              {mobileNav.map((item) => {
                const Icon = item.icon
                const active = isActive(item)
                return (
                  <li key={item.to}>
                    <Link to={item.to} aria-current={active ? 'page' : undefined}
                      className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition', active ? 'bg-brand-600/12 font-semibold text-white' : 'text-ink/85 hover:bg-white/5')}>
                      {Icon ? <Icon className={cn('size-4', active ? 'text-brand-500' : 'text-muted')} aria-hidden /> : <span className="size-4" aria-hidden />}{item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        ) : null}

        {/* Escritorio: fila de categorías */}
        <nav aria-label="Categorías" className="hidden border-t border-line lg:block">
          <div className="mx-auto flex h-12 max-w-7xl items-center gap-1 px-4">
            {categoryNav.map((item) => {
              const Icon = item.icon!
              const active = isActive(item)
              return (
                <Link key={item.to} to={item.to} aria-current={active ? 'page' : undefined}
                  className={cn('relative inline-flex h-full items-center gap-2 px-3 text-sm font-medium transition', active ? 'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-500' : 'text-ink/80 hover:text-white')}>
                  <Icon className={cn('size-4', active ? 'text-brand-500' : 'text-muted')} aria-hidden />{item.label}
                </Link>
              )
            })}
            <p className="ml-auto text-xs text-muted">Pago contraentrega · Pedidos coordinados por WhatsApp</p>
          </div>
        </nav>
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="mt-14 border-t border-line bg-[#191c21]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-muted md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={asset("/brand/mark-96.webp")} alt="" width={36} height={36} loading="lazy" className="size-9 rounded-full" />
              <Wordmark className="text-lg" />
            </div>
            <p className="mt-3 max-w-xs">{BRAND.tagline}. iPhone nuevos y usados, y accesorios en {BRAND.city}.</p>
          </div>
          <div className="space-y-3">
            <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />Equipos usados con IMEI legal verificado.</p>
            <p className="flex items-start gap-2"><MessageCircle className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />Pedidos y pago coordinados por WhatsApp.</p>
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />{BRAND.city}. {BRAND.pickup}. Envíos a todo Colombia.</p>
          </div>
          <nav aria-label="Pie de página" className="grid grid-cols-2 content-start gap-x-4 gap-y-2">
            <Link to="/" className="w-fit transition hover:text-ink">Inicio</Link>
            <Link to="/catalogo" className="w-fit transition hover:text-ink">Catálogo</Link>
            {infoNav.map((n) => <Link key={n.to} to={n.to} className="w-fit transition hover:text-ink">{n.label}</Link>)}
            <Link to="/carrito" className="w-fit transition hover:text-ink">Carrito</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
