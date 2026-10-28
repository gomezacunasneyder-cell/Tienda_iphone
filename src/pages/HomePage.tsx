import { ArrowRight, BadgeCheck, Headphones, MapPin, MessageCircle, Package, Recycle, Smartphone, Truck, Users, Wallet, type LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { HeroBanner } from '@/components/home/HeroBanner'
import { buttonClasses } from '@/components/ui/Button'
import { ErrorState, ProductGridSkeleton } from '@/components/ui/States'
import { BRAND } from '@/config/brand'
import { inSection, type Section } from '@/features/catalog/helpers'
import { ProductGrid } from '@/features/catalog/ProductCard'
import { useProducts } from '@/hooks/useCatalog'
import { DEMO_MODE, isFirebaseConfigured } from '@/services/firebase'
import type { Product } from '@/types/domain'

const CATEGORIES: { section: Section; title: string; text: string; icon: LucideIcon; glow: string }[] = [
  { section: 'nuevos', title: 'iPhone nuevos', text: 'Sellados en caja', icon: Smartphone, glow: 'rgb(255 45 61 / 0.22)' },
  { section: 'usados', title: 'iPhone usados', text: 'Revisados, con IMEI legal', icon: Recycle, glow: 'rgb(34 211 238 / 0.16)' },
  { section: 'accesorios', title: 'Accesorios', text: 'Cargadores, cables, fundas y más', icon: Headphones, glow: 'rgb(139 92 246 / 0.2)' },
  { section: 'mayoristas', title: 'Al por mayor', text: 'Precios para clientes registrados', icon: Users, glow: 'rgb(61 123 255 / 0.18)' },
]

const SHELVES: { section: Section; id: string; title: string; subtitle: string }[] = [
  { section: 'nuevos', id: 'nuevos', title: 'iPhone nuevos', subtitle: 'Sellados en caja, listos para estrenar.' },
  { section: 'usados', id: 'usados', title: 'iPhone usados', subtitle: 'Con capacidad, color y estado de batería a la vista.' },
  { section: 'accesorios', id: 'accesorios', title: 'Accesorios destacados', subtitle: 'Todo lo que tu iPhone necesita.' },
]

const PERKS = [
  { icon: BadgeCheck, title: 'IMEI legal verificado', text: 'Cada equipo usado se revisa antes de venderse.' },
  { icon: Wallet, title: 'Pago contraentrega', text: 'Pagas cuando recibes, en las condiciones que acordamos contigo.' },
  { icon: Truck, title: 'Envíos a todo Colombia', text: 'Domicilio en Cúcuta, entrega en Los Patios o envío nacional.' },
  { icon: MessageCircle, title: 'Atención por WhatsApp', text: 'Te acompañamos antes, durante y después de tu compra.' },
]

const STEPS = [
  'Elige tu iPhone o accesorio y agrégalo al carrito.',
  'Envía tu pedido: queda registrado con una referencia.',
  'Te escribimos por WhatsApp para confirmar disponibilidad, entrega y pago contraentrega.',
]

const DELIVERY = [
  { icon: Package, text: 'Domicilio en Cúcuta' },
  { icon: MapPin, text: BRAND.pickup },
  { icon: Truck, text: 'Envío nacional con transportadora' },
]

/** Hasta 4 productos de una sección, primero los destacados. */
function shelf(products: Product[], section: Section): Product[] {
  const list = products.filter((p) => inSection(p, section))
  return [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured)].slice(0, 4)
}

function SectionHeader({ id, title, subtitle, to }: { id: string; title: string; subtitle?: string; to: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="section-title text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
      </div>
      <Link to={to} className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-ink transition hover:bg-white/5 hover:text-brand-400">Ver todo<ArrowRight className="size-4" aria-hidden /></Link>
    </div>
  )
}

export default function HomePage() {
  const { data, isLoading, isError, refetch } = useProducts()
  const products = data ?? []
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.section, products.filter((p) => inSection(p, c.section)).length]))
  const shelves = SHELVES.map((s) => ({ ...s, items: shelf(products, s.section) })).filter((s) => s.items.length)
  const configured = isFirebaseConfigured || DEMO_MODE

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6"><HeroBanner /></div>

      {/* 1. Categorías principales */}
      <nav aria-labelledby="categorias" className="mx-auto max-w-7xl px-4 pt-10">
        <h2 id="categorias" className="sr-only">Categorías</h2>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CATEGORIES.map(({ section, title, text, icon: Icon, glow }) => (
            <li key={section}>
              <Link to={`/catalogo?seccion=${section}`} style={{ '--glow': glow } as CSSProperties}
                className="panel group flex h-full items-center gap-3 overflow-hidden rounded-2xl p-3.5 transition-[transform,border-color,box-shadow] duration-300 before:pointer-events-none before:absolute before:-right-8 before:-top-10 before:size-32 before:rounded-full before:bg-[radial-gradient(circle,var(--glow),transparent_70%)] hover:-translate-y-1 hover:border-white/15 hover:shadow-[var(--shadow-float)] sm:gap-4 sm:p-5">
                <span className="perk-icon relative transition-transform duration-300 group-hover:scale-105 sm:size-12"><Icon className="size-5 sm:size-6" aria-hidden /></span>
                <span className="relative min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white sm:text-base">{title}</span>
                  <span className="mt-0.5 block text-xs text-muted max-sm:line-clamp-1">{data && counts[section] ? `${counts[section]} producto${counts[section] === 1 ? '' : 's'}` : text}</span>
                </span>
                <ArrowRight className="relative size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-400 max-sm:hidden" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 2–4. Vitrinas por sección */}
      {!configured ? (
        <p className="mx-auto mt-10 max-w-7xl rounded-card border border-dashed border-line-strong p-8 text-center text-sm text-muted">
          Firebase aún no está configurado. Copia <code>.env.example</code> a <code>.env.local</code> y completa tus credenciales.
        </p>
      ) : isLoading ? (
        <section aria-label="Cargando productos" className="mx-auto max-w-7xl px-4 pt-12"><ProductGridSkeleton /></section>
      ) : isError ? (
        <div className="mx-auto max-w-7xl px-4 pt-6"><ErrorState onRetry={() => void refetch()} /></div>
      ) : shelves.length === 0 ? (
        <p className="py-14 text-center text-sm text-muted">Pronto publicaremos nuestro inventario.</p>
      ) : shelves.map(({ section, id, title, subtitle, items }) => (
        <section key={id} aria-labelledby={id} className="mx-auto max-w-7xl px-4 pt-12">
          <SectionHeader id={id} title={title} subtitle={subtitle} to={`/catalogo?seccion=${section}`} />
          <ProductGrid products={items} />
        </section>
      ))}

      {/* 6. Beneficios */}
      <section aria-labelledby="beneficios" className="mx-auto max-w-7xl px-4 pt-14">
        <h2 id="beneficios" className="section-title text-xl font-bold tracking-tight sm:text-2xl">Compra con confianza</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="panel flex gap-3.5 rounded-2xl p-4 sm:p-5">
              <span className="perk-icon"><Icon className="size-5" aria-hidden /></span>
              <div><p className="text-sm font-semibold text-white">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted">{text}</p></div>
            </li>
          ))}
        </ul>
      </section>

      {/* 7. Envíos y atención por WhatsApp */}
      <section aria-labelledby="como-comprar" className="mx-auto max-w-7xl px-4 py-14">
        <div className="panel relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8 lg:p-10">
          <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(37_211_102/0.14),transparent_70%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow">Así compras</p>
              <h2 id="como-comprar" className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Pides aquí, coordinamos por WhatsApp</h2>
              <ol className="mt-6 space-y-4">
                {STEPS.map((s, i) => <li key={s} className="flex items-start gap-3 text-sm leading-relaxed text-ink/90"><span className="step-num">{i + 1}</span><span className="pt-1">{s}</span></li>)}
              </ol>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-line">
              <p className="text-sm font-semibold text-white">Opciones de entrega</p>
              <ul className="mt-3 space-y-2.5 text-sm text-muted">
                {DELIVERY.map(({ icon: Icon, text }) => <li key={text} className="flex items-center gap-2.5"><Icon className="size-4 shrink-0 text-brand-500" aria-hidden />{text}</li>)}
              </ul>
              {BRAND.whatsappNumber ? (
                <a href={`https://wa.me/${BRAND.whatsappNumber}`} target="_blank" rel="noreferrer"
                  className={buttonClasses({ size: 'lg', variant: 'outline', className: 'mt-5 w-full border-[#25d366]/40 text-white hover:border-[#25d366]/70 hover:bg-[#25d366]/10' })}>
                  <MessageCircle className="size-5 text-[#25d366]" aria-hidden />Escríbenos por WhatsApp
                </a>
              ) : (
                <Link to="/contacto" className={buttonClasses({ size: 'lg', variant: 'outline', className: 'mt-5 w-full' })}>Contacto</Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
