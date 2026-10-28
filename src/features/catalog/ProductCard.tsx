import { BatteryFull, CardSim, Check, HardDrive, Palette, ShoppingCart } from 'lucide-react'
import { useRef, useState, type ReactNode, type SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PREVIEW } from '@/config/preview'
import { useCart } from '@/features/cart/CartContext'
import { useWholesaleAccess } from '@/features/orders/useWholesaleAccess'
import { flyToCart } from '@/lib/cartFx'
import { cn, formatCOP } from '@/lib/utils'
import type { PriceTier, Product, ProductVariant } from '@/types/domain'
import { conditionLabel, SIM_LABEL, totalStock, variantLabel } from './helpers'

export type CardMode = 'retail' | 'wholesale'
export type CardLayout = 'grid' | 'list'

/** Logo de Apple (decorativo) junto al nombre de los iPhone. */
function AppleMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}

function batteryRange(p: Product): string | null {
  const b = p.variants.map((v) => v.batteryHealth).filter((n): n is number => typeof n === 'number')
  if (!b.length) return null
  const lo = Math.min(...b), hi = Math.max(...b)
  return lo === hi ? `Batería ${lo}%` : `Batería ${lo}–${hi}%`
}

/** Precio de una unidad según la sección (detal o mayorista); null si no tiene precio definido. */
const unitPriceOf = (v: ProductVariant, mode: CardMode): number | null => {
  const n = mode === 'wholesale' ? v.wholesalePrice : v.price
  return typeof n === 'number' && n > 0 ? n : null
}

/** Texto y color de disponibilidad a partir del inventario del producto. */
function availability(stock: number): { text: string; dot: string } {
  if (stock === 0) return { text: 'Agotado', dot: 'bg-red-400' }
  if (stock <= 3) return { text: stock === 1 ? 'Última unidad' : `Últimas ${stock} unidades`, dot: 'bg-amber-400' }
  return { text: 'Disponible', dot: 'bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153/0.8)]' }
}

export function ProductCard({ product, mode = 'retail', layout = 'grid' }: { product: Product; mode?: CardMode; layout?: CardLayout }) {
  const cart = useCart()
  const { canBuy } = useWholesaleAccess()
  const [variantId, setVariantId] = useState<string>()
  const [added, setAdded] = useState(false)
  const mediaRef = useRef<HTMLDivElement>(null)

  const stock = totalStock(product)
  const soldOut = stock === 0
  const image = product.images[0]
  const tier: PriceTier = mode === 'wholesale' ? 'wholesale' : 'retail'
  const options = product.variants
    .filter((v) => v.stock > 0 && unitPriceOf(v, mode) !== null)
    .sort((a, b) => (unitPriceOf(a, mode) ?? 0) - (unitPriceOf(b, mode) ?? 0))
  const selected = options.find((v) => v.id === variantId) ?? options[0]
  const price = selected ? unitPriceOf(selected, mode) : null
  const battery = batteryRange(product)
  const batteryNow = selected?.batteryHealth
  const blockedWholesale = mode === 'wholesale' && !canBuy
  const avail = availability(stock)

  const addToCart = () => {
    if (!selected || price === null) return
    cart.add({
      productId: product.id, variantId: selected.id, name: product.name, variantLabel: variantLabel(selected), sku: selected.sku,
      kind: product.kind, image: product.images[0], unitPrice: price, priceTier: tier, qty: 1,
    })
    flyToCart(mediaRef.current, { name: product.name, image: product.images[0]?.startsWith('data:') ? undefined : product.images[0], qty: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const href = `/producto/${product.slug}`
  /** Con el interruptor activo, la foto y el nombre abren la ficha; los botones siguen funcionando aparte. */
  const linkTo = (className: string, children: ReactNode, label?: string) =>
    PREVIEW.cardsLinkToProduct ? <Link to={href} aria-label={label} className={className}>{children}</Link> : <div className={className}>{children}</div>

  const list = layout === 'list'

  const imageBlock = linkTo(cn('block shrink-0', list ? 'w-28 self-stretch sm:w-44' : ''), (
    <div ref={mediaRef} className={cn('card-media', list ? 'h-full min-h-36' : 'aspect-[4/5]')}>
      {image ? (
        // Fondo blanco: la foto completa (con sus textos) se muestra sin recortes ni deformaciones
        <img src={image} alt={product.name} loading="lazy" decoding="async" className={cn('card-photo absolute inset-0 size-full object-contain', image.startsWith('data:') ? 'p-4' : 'p-2')} />
      ) : (
        <div className="grid size-full min-h-32 place-items-center text-sm text-muted">Sin imagen</div>
      )}
      <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
        <Badge tone={product.condition === 'new' ? 'brand' : 'used'}>{conditionLabel(product.condition)}</Badge>
        {mode === 'wholesale' ? <Badge tone="warning">Mayorista</Badge> : null}
        {soldOut ? <Badge tone="danger">Agotado</Badge> : null}
      </div>
      {batteryNow ? (
        <span className="battery-chip absolute bottom-2 left-2"><BatteryFull className="size-3.5" aria-hidden /><span className="sr-only">Batería </span>{batteryNow}%</span>
      ) : null}
    </div>
  ), `Ver ${product.name}`)

  const specs = selected
    ? [
        selected.capacity ? { icon: HardDrive, text: selected.capacity } : null,
        selected.color ? { icon: Palette, text: selected.color } : null,
        selected.simType ? { icon: CardSim, text: SIM_LABEL[selected.simType] } : null,
      ].filter((s) => s !== null)
    : []

  return (
    <article data-layout={layout} className={cn('product-card flex h-full rounded-xl', list ? 'flex-row' : 'flex-col')}>
      {imageBlock}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {product.kind === 'iphone' ? <AppleMark className="size-3 shrink-0" /> : null}{product.brand}
            </p>
            <h3 className={cn('line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-[15px]', !list && 'min-h-[2.5rem]')}>
              {PREVIEW.cardsLinkToProduct ? <Link to={href} className="transition-colors hover:text-brand-400">{product.name}</Link> : product.name}
            </h3>
          </div>
        </div>

        {specs.length ? (
          <ul className="spec-row" aria-label="Características">
            {specs.map(({ icon: Icon, text }) => <li key={text}><Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />{text}</li>)}
          </ul>
        ) : null}
        {battery && !batteryNow ? <p className="spec-row"><span><BatteryFull className="size-3.5 shrink-0 text-mint-ink" aria-hidden />{battery}</span></p> : null}

        {options.length > 1 ? (
          <select aria-label={`Unidad de ${product.name}`} value={selected?.id} onChange={(e) => setVariantId(e.target.value)}
            className="control-pill mt-0.5 h-10 w-full min-w-0 truncate rounded-xl px-3 text-xs">
            {options.map((v) => <option key={v.id} value={v.id}>{variantLabel(v) || v.sku} · {formatCOP(unitPriceOf(v, mode) ?? 0)}</option>)}
          </select>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1 pt-1">
          {price === null ? <p className="text-sm text-muted">Precio por definir</p> : (
            <p className="price text-lg font-bold text-white sm:text-xl">
              {options.length > 1 && !variantId ? <span className="mr-1 text-xs font-medium text-muted">Desde</span> : null}{formatCOP(price)}
            </p>
          )}
          <p className="flex items-center gap-1.5 pb-1 text-[11px] text-muted"><span className={cn('stock-dot', avail.dot)} aria-hidden />{avail.text}</p>
        </div>

        {price === null || !selected ? null : blockedWholesale ? (
          <p className="rounded-xl bg-butter px-3 py-2 text-center text-xs text-butter-ink">Compras a este precio después de tu primera compra</p>
        ) : (
          <Button size="sm" className={cn('whitespace-nowrap', list ? 'w-full sm:w-auto sm:self-start' : 'w-full')} onClick={addToCart} aria-label={`Agregar ${product.name} al carrito`}>
            {added ? <><Check className="size-4" aria-hidden />Agregado</> : <><ShoppingCart className="size-4" aria-hidden /><span className="sm:hidden">Agregar</span><span className="max-sm:hidden">Agregar al carrito</span></>}
          </Button>
        )}
      </div>
    </article>
  )
}

export function ProductGrid({ products, mode = 'retail', layout = 'grid', withSidebar = false }: { products: Product[]; mode?: CardMode; layout?: CardLayout; withSidebar?: boolean }) {
  return (
    <ul className={cn('product-grid grid gap-3 sm:gap-5', layout === 'list' ? 'grid-cols-1' : withSidebar ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4')}>
      {products.map((p) => (
        <li key={p.id} className="animate-fade-up min-w-0"><ProductCard product={p} mode={mode} layout={layout} /></li>
      ))}
    </ul>
  )
}
